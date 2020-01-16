#!/usr/bin/env node

const { graphql } = require('@octokit/graphql');
const program = require('commander');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

program
  .requiredOption('-l, --left <type>', 'left side ref')
  .requiredOption('-r, --right <type>', 'right side ref')
  .requiredOption('-t, --token <type>', 'GitHub API Token');

program.parse(process.argv);

const rightRef = program.right;
const leftRef = program.left;
const token = program.token;

const getCommits = async () => {
  const { stdout, stderr } = await exec(
    `git log --pretty=format:'%h' --abbrev-commit --right-only ${leftRef}..${rightRef}`
  );
  return stdout;
};

const getPRs = async () => {
  const { stdout, stderr } = await exec(
    `git log --oneline --abbrev-commit --right-only --right-only ${leftRef}..${rightRef} | grep -Eo '#[0-9]+' | tr -d '#'`
  );
  return stdout;
};

async function fetchData(visitor) {
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
    const string = await getCommits();

    const commitRefs = string.split('\n').filter(e => {
      return e.length > 0;
    });

    if (commitRefs.length == 0) {
      return [];
    }

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
      pullRequest: repository(owner: "eure", name: "pairs-ios") {
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

    let prs = [];
    for (key in result.pullRequest) {
      const raw = result.pullRequest[key];

      const { associatedPullRequests } = raw;

      associatedPullRequests.nodes.forEach(element => {
        prs.push(element);
      });
    }
    return prs;
  };

  const fetchDataFromPRNumbers = async () => {
    const string = await getPRs();
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
      repository(owner: "eure", name: "pairs-ios") {
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

const main = async () => {
  const labelGroupedVisitor = {
    state: {
      prs: {}
    },
    visitLabel(label, source) {
      let array = this.state.prs[label.name];
      if (array == null) {
        this.state.prs[label.name] = [];
        array = this.state.prs[label.name];
      }

      const found = array.find(element => element.number == source.number);

      if (!found) {
        array.push(source);
      }

      const element = source;
    },
    visitAuthor(author, source) {},
    generate() {
      const getListInLabel = label => {
        const list = this.state.prs[label];
        if (list == null) {
          return 'Nothing';
        } else {
          return list.map(element => {
            return `- ${element.title} [#${element.number}](${element.permalink}) by @${element.author.login}`;
          }).join`\n`;
        }
      };

      const displayLabels = [
        {
          name: 'FEATURE DELETED',
          prefix: '🗑'
        },
        {
          name: 'FIX',
          prefix: '👾'
        },
        {
          name: 'UI UPDATE',
          prefix: '👋'
        },
        {
          name: 'DEVELOPING IMPROVEMENT',
          prefix: '🚚'
        },
        {
          name: 'FIX INADVANCE',
          prefix: '🏔'
        }
      ];

      return `
${displayLabels.map(label => {
  return `
### ${[label.prefix, label.name].join` `}

${getListInLabel(label.name)}
  `;
}).join`\
      `}
      `;
    }
  };

  await fetchData(labelGroupedVisitor);
  console.log(labelGroupedVisitor.generate());
};

main();
