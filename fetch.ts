import util from 'util';
import _ from 'lodash';
import { graphql } from '@octokit/graphql';
import { Visitor } from './Visitor';
const exec = util.promisify(require('child_process').exec);

export type Context = {
  rightRef: string;
  leftRef: string;
  githubToken: string;
  repoOwner: string;
  repoName: string;
  workingDirectory: string;
};

export type Response = {
  pullRequest: Record<string, PullRequestNode>;
};

export type User = {
  login: string;
};

export type Label = {
  name: string;
};

export type PullRequest = {
  author: User;
  editor: User;
  mergedBy: User;
  labels: {
    nodes: Label[];
  };
  merged: boolean;
  title: string;
  permalink: string;
  bodyText: string;
  number: number;
  id: string;
};

export type PullRequestNode = {
  associatedPullRequests: { nodes: PullRequest[] };
};

export const azs = async () => {
  console.log('Hello');
};

const getCommitsFromGit = async (
  leftRef: string,
  rightRef: string,
  workingDir: string
) => {
  const { stdout }: { stdout: string } = await exec(
    `cd ${workingDir} && git log --pretty=format:'%h' --abbrev-commit --right-only ${leftRef}..${rightRef}`
  );
  return stdout;
};

const getPRsFromGit = async (
  leftRef: string,
  rightRef: string,
  workingDir: string
) => {
  const { stdout }: { stdout: string } = await exec(
    `cd ${workingDir} && git log --oneline --abbrev-commit --right-only --right-only ${leftRef}..${rightRef} | grep -Eo '#[0-9]+' | tr -d '#'`
  );
  return stdout;
};

export const fetchData = async (context: Context, visitor: Visitor) => {
  const { githubToken, repoOwner, repoName } = context;

  const framgent = `
  fragment PRParam on PullRequest {
    createdAt
    editor {
      login
    }
    author {
      login
    }
    merged
    mergedAt
    mergedBy {
      login
    }
    number
    permalink
    title
    labels(first: 100) {
      nodes {
        name
      }
    }
    id
    bodyText
  }
  `;

  const fetchDataFromCommits = async () => {
    const string = await getCommitsFromGit(
      context.leftRef,
      context.rightRef,
      context.workingDirectory
    );

    const commitRefs = string.split('\n').filter(e => {
      return e.length > 0;
    });

    if (commitRefs.length == 0) {
      return [];
    }

    const fetch = async (commitRefs: string[]) => {
      const frag = commitRefs
        .map(commitRef => {
          return `ref_${commitRef}: object(expression: "${commitRef}") {
      ...PR
    }
    `;
        })
        .join('\n');

      const query = `
    {
      pullRequest: repository(owner: "${repoOwner}", name: "${repoName}") {
        ${frag}
      }
    }

    ${framgent}

    fragment PR on GitObject {
      ... on Commit {
        associatedPullRequests(first: 100) {
          nodes {
            ...PRParam
          }
        }
      }
    }
  `;

      const result = (await graphql(query, {
        headers: {
          authorization: `token ${githubToken}`
        }
      })) as Response | null;
      return result!.pullRequest;
    };

    let pullRequests: Record<string, PullRequestNode> = {};

    const chunks = _.chunk(commitRefs, 10);

    for (let slice of chunks) {
      pullRequests = {
        ...pullRequests,
        ...(await fetch(slice))
      };
    }

    let prs = _.flatMap(
      Object.values(pullRequests),
      e => e.associatedPullRequests.nodes
    );

    return prs;
  };

  const fetchDataFromPRNumbers = async () => {
    const string = await getPRsFromGit(
      context.leftRef,
      context.rightRef,
      context.workingDirectory
    );

    const prNumbers = string.split('\n').filter(e => {
      return e.length > 0;
    });

    if (prNumbers.length == 0) {
      return [];
    }

    const frag = prNumbers
      .map(number => {
        return `pr_${number}: pullRequest(number: ${number}) {
          ...PRParam
        }
    `;
      })
      .join('\n');

    const query = `
    {
      repository(owner: "${repoOwner}", name: "${repoName}") {
        ${frag}
      }
    }

    ${framgent}
    
  `;

    const result = await graphql(query, {
      headers: {
        authorization: `token ${githubToken}`
      }
    }).catch(e => {
      return e.data;
    });

    const prs = Object.values(result.repository).filter(e => e !== null);
    return prs as PullRequest[];
  };

  let prs: PullRequest[] = [];

  prs = prs.concat(await fetchDataFromCommits());
  prs = prs.concat(await fetchDataFromPRNumbers());

  prs.forEach(source => {
    visitor.visitAuthor(source.author, source);
    source.labels.nodes.forEach(element => {
      visitor.visitLabel(element, source);
    });
  });
};
