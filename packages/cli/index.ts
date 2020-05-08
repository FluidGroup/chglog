#!/usr/bin/env node

import { fetchData } from 'chglog';
import commander from 'commander';
import createVisitor from 'chglog_grouping_generator';

type Args = {
  base: string;
  head: string;
  githubToken: string;
  owner: string;
  repo: string;
};

export const markdown = async (args: Args) => {
  const visitor = createVisitor();
  await fetchData(
    {
      rightRef: args.head,
      leftRef: args.base,
      githubToken: args.githubToken,
      repoOwner: args.owner,
      repoName: args.repo,
      workingDirectory: './',
    },
    visitor
  );
  return visitor.generate();
};

const program = new commander.Command();
program.version('0.0.1');

program
  .command('changelog')
  .description('Generate changelog')
  .requiredOption('-l, --left <type>', 'left side ref')
  .requiredOption('-r, --right <type>', 'right side ref')
  .requiredOption('--repo <type>', 'repo')
  .requiredOption('--owner <type>', 'owner')
  .requiredOption(
    '--github_token <type>',
    'Access token for GitHub',
    process.env.GITHUB_ACCESS_TOKEN
  )
  .action(async (program: any) => {
    const result = await markdown({
      base: program.left,
      head: program.right,
      githubToken: program.github_token,
      repo: program.repo,
      owner: program.owner,
    });
    console.log(result);
  });

if (process.argv.length === 2) {
  console.log(process.env);
  console.log(program.helpInformation());
} else {
  program.parse(process.argv);
}
