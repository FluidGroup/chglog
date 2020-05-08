import { User, PullRequest, Label } from 'chglog';
import _ from 'lodash';

const genName = (pr: PullRequest) => {
  const tag = pr.labels.nodes
    .map((e) => e.name)
    .filter((e) => e.includes('Tag:'))
    .map((e) => `\`${e.replace('Tag: ', '')}\``)
    .join(' ')
    .trim();

  const body = [
    `- 🔸${pr.title} [#${pr.number}](${pr.permalink}) by @${pr.author.login}`,
    (() => {
      if (tag.length > 0) {
        return `  - 🏷 ${tag}`;
      } else {
        return '';
      }
    })(),
  ]
    .filter((e) => e.length > 0)
    .join('\n');

  return body;
};

export default () => {
  type State = {
    allPRs: PullRequest[];
    prs: Record<string, PullRequest[]>;
  };
  const state: State = {
    allPRs: [],
    prs: {},
  };
  return {
    visitLabel(label: Label, source: PullRequest) {
      if (!label.name.includes('Group:')) {
        return;
      }

      let array = state.prs[label.name];
      if (array == null) {
        state.prs[label.name] = [];
        array = state.prs[label.name];
      }

      const found = array.find(
        (element: any) => element.number == source.number
      );

      if (!found) {
        array.push(source);
      }
    },
    visit(source: PullRequest) {
      state.allPRs.push(source);
    },
    visitAuthor(author: User, source: PullRequest) {},
    generate() {
      type Composed = { label: string; prs: PullRequest[] };

      let buf: Composed[] = [];
      for (const key in state.prs) {
        buf.push({
          label: key,
          prs: state.prs[key],
        });
      }

      buf.sort((a, b) => {
        return a.label < b.label ? 1 : -1;
      });

      const groupedIDs = _(buf).flatMap((e) => e.prs.map((e) => e.id));

      const ungrouped = state.allPRs.filter((e) => !groupedIDs.includes(e.id));

      const grouped = buf;

      const renderGrouped = (item: Composed) => {
        return `
### ${item.label} (${item.prs.length})
${item.prs
  .map((e) => {
    return genName(e);
  })
  .join('\n')}        
`;
      };

      const renderUngrouped = (item: PullRequest[]) => {
        return `
${item
  .map((e) => {
    return genName(e);
  })
  .join('\n')}        
`;
      };

      const body = `
Number of PRs : ${state.allPRs.length}

${grouped.map(renderGrouped).join('\n\n')}

## Other (${ungrouped.length})
${renderUngrouped(ungrouped)}
`;

      return `${body}`;
    },
  };
};
