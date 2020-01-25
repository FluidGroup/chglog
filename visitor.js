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
        }).join `\n`;
      }
    };

    const displayLabels = [{
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

module.exports = labelGroupedVisitor
