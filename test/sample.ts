import fetchData from '../fetch';
import { Visitor, createSampleVistor } from '../visitor';

const visitor: Visitor = {
  visitLabel(label: any, source: any): void {
    console.log(source);
  },
  visitAuthor(author: any, source: any): void {}
};

(async () => {
  const visitor = createSampleVistor();

  await fetchData(
    {
      rightRef: 'master',
      leftRef: 'develop',
      githubToken: '',
      repoOwner: 'xxx',
      repoName: 'yyy',
      workingDirectory: 'xxx'
    },
    visitor
  );

  console.log(visitor.generate());
})();
