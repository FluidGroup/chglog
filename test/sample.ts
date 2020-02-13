import fetchData from '../fetch';

export const createSampleVistor = () => {
  const state = {
    prs: {}
  };

  return {
    visitLabel(label: any, source: any) {
      let array = state.prs[label.name];
      if (array == null) {
        state.prs[label.name] = [];
        array = state.prs[label.name];
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
        const list = state.prs[label];
        if (list == null) {
          return 'Nothing';
        } else {
          return list.map(element => {
            return `- ${element.title} [#${element.number}](${element.permalink}) by @${element.author.login}`;
          }).join`\n`;
        }
      };

      const displayLabels = [
        { name: 'FEATURE DELETED', prefix: '🗑' },
        { name: 'FIX', prefix: '👾' },
        { name: 'UI UPDATE', prefix: '👋' },
        { name: 'DEVELOPING IMPROVEMENT', prefix: '🚚' },
        { name: 'FIX INADVANCE', prefix: '🏔' },
        { name: 'Significant Changes', prefix: '☄️' }
      ];

      const hoge = displayLabels
        .map(label => {
          return `
### ${[label.prefix, label.name].join(` `)}
${getListInLabel(label.name)}
`;
        })
        .join(' ');

      return `${hoge}`;
    }
  };
};

(async () => {
  const visitor = createSampleVistor();

  await fetchData(
    {
      rightRef: '',
      leftRef: '',
      githubToken: '',
      repoOwner: '',
      repoName: '',
      workingDirectory: ''
    },
    visitor
  );

  console.log(visitor.generate());
})();
