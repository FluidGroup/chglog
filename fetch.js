const util = require('util');
const _ = require('lodash');
const {
  graphql
} = require('@octokit/graphql');
const exec = util.promisify(require('child_process').exec);


const getCommitsFromGit = async (leftRef, rightRef, workingDir) => {
  const {
    stdout,
    stderr
  } = await exec(
    `cd ${workingDir} && git log --pretty=format:'%h' --abbrev-commit --right-only ${leftRef}..${rightRef}`
  );
  return stdout;
};

const getPRsFromGit = async (leftRef, rightRef, workingDir) => {
  const {
    stdout,
    stderr
  } = await exec(
    `cd ${workingDir} && git log --oneline --abbrev-commit --right-only --right-only ${leftRef}..${rightRef} | grep -Eo '#[0-9]+' | tr -d '#'`
  );
  return stdout;
};

const fetchData = async (context, visitor) => {

  const {
    token,
    repoOwner,
    repoName
  } = context

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
  }
  `;

  const fetchDataFromCommits = async () => {
    const string = await getCommitsFromGit(context.leftRef, context.rightRef, context.workingDir);

    const commitRefs = string.split('\n').filter(e => {
      return e.length > 0;
    });

    if (commitRefs.length == 0) {
      return [];
    }

    const fetch = async commitRefs => {
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
      const result = await graphql(query, {
        headers: {
          authorization: `token ${token}`
        }
      });
      return result.pullRequest;
    };

    let pullRequests = {};

    const chunks = _.chunk(commitRefs, 10);
    for (i in chunks) {
      const slice = chunks[i];
      pullRequests = {
        ...pullRequests,
        ...(await fetch(slice))
      };
    }

    let prs = [];
    for (key in pullRequests) {
      const raw = pullRequests[key];

      const {
        associatedPullRequests
      } = raw;

      associatedPullRequests.nodes.forEach(element => {
        prs.push(element);
      });
    }
    return prs;
  };

  const fetchDataFromPRNumbers = async () => {
    const string = await getPRsFromGit(context.leftRef, context.rightRef, context.workingDir);
    // console.log(string)
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
        authorization: `token ${token}`
      }
    });

    let prs = [];
    for (key in result.repository) {
      const raw = result.repository[key];
      // console.log(raw)
      // raw.forEach(element => {
      prs.push(raw);
      // });
    }
    return prs;
  };

  let prs = [];

  prs = prs.concat(await fetchDataFromCommits());
  prs = prs.concat(await fetchDataFromPRNumbers());

  prs.forEach(source => {
    visitor.visitAuthor(source.author, source);
    source.labels.nodes.forEach(element => {
      visitor.visitLabel(element, source);
    });
  });
}

module.exports = fetchData
