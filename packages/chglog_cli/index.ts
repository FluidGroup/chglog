#!/usr/bin/env node

import { fetchData, Visitor } from "@muukii/chglog_fetcher";
import commander from "commander";
import createVisitor from "@muukii/chglog_grouping_generator";
import path from "path";

const program = new commander.Command();
program.version("0.0.1");

program
  .command("changelog")
  .description("Generate changelog")
  .requiredOption("-l, --left <type>", "left side ref")
  .requiredOption("-r, --right <type>", "right side ref")
  .requiredOption("--repo <type>", "repo")
  .requiredOption("--owner <type>", "owner")
  .requiredOption(
    "--github_token <type>",
    "Access token for GitHub",
    process.env.GITHUB_ACCESS_TOKEN
  )
  .option("-g, --generator <type>", "generator")
  .action(async (program: any) => {
    let generator: Visitor = null;
    if (program.generator) {
      const p = path.resolve(program.generator);
      generator = require(p)();
    } else {
      generator = createVisitor();
    }

    await fetchData(
      {
        leftRef: program.left,
        rightRef: program.right,
        githubToken: program.github_token,
        repoOwner: program.owner,
        repoName: program.repo,
        workingDirectory: "./",
      },
      generator
    );
    const result = generator.render();
    console.log(result);
  });

if (process.argv.length === 2) {
  console.log(process.env);
  console.log(program.helpInformation());
} else {
  program.parse(process.argv);
}
