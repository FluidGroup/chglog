#!/usr/bin/env node

const labelGroupedVisitor = require('./visitor')
const fetchData = require('./fetch')
const program = require('commander');

program
  .requiredOption('-l, --left <type>', 'left side ref')
  .requiredOption('-r, --right <type>', 'right side ref')
  .requiredOption('-t, --token <type>', 'GitHub API Token')
  .requiredOption('--repo-owner <type>', 'Repository owner')
  .requiredOption('--repo-name <type>', 'Repository name')
  .option('--working_dir <type>', 'Path to git repo');

program.parse(process.argv);

const context = {
  rightRef: program.right,
  leftRef: program.left,
  token: program.token,
  repoOwner: program.repoOwner,
  repoName: program.repoName,
  workingDir: program.working_dir || './'
}

const main = async () => {

  await fetchData(context, labelGroupedVisitor);
  console.log(labelGroupedVisitor.generate());
};

main();
