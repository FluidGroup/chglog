#!/usr/bin/env node

import { fetchData, Visitor } from "@muukii/chglog_fetcher";
import commander, { exitOverride } from "commander";
import createVisitor from "@muukii/chglog_grouping_generator";
import path from "path";
const getGitHubURL = require("github-url-from-git");
import chalk from "chalk";
import yaml from "yaml";
import fs from "fs";
import os from "os";

import Git from "nodegit";

const log = console.log;
const colorError = chalk.bold.red;
const colorWarning = chalk.keyword("orange");

const logError = (args) => {
  console.log("❌ ", chalk.bold.red(args));
};

const logSuccess = (args) => {
  console.log("✅ ", chalk.bold.blue(args));
};

process.on("SIGTERM", () => {
  console.log("Process terminated");
});

process.on("uncaughtException", () => {
  process.exit(1);
});

const errorHandler = (error) => {
  logError(error);
  process.exit(1);
};

const main = async () => {
  const getGitHubOwnerRepo = async () => {
    const git = await Git.Repository.open("./").catch((error) => {
      throw "Not found git repository. CLI needs git in working directory.";
    });

    const remote = await git.getRemote("origin");
    const url = getGitHubURL(remote.url());

    const regex = /https:\/\/github.com\/(.*)\/(.*)/;

    const result = regex.exec(url);

    if (!(result.length === 3)) {
      throw "Invalid url";
    }

    return {
      owner: result[1],
      repo: result[2],
    };
  };

  const getGitHubTokenFromGH = () => {
    const file = fs.readFileSync(
      `${os.homedir()}/.config/gh/hosts.yml`,
      "utf8"
    );
    const object = yaml.parse(file);

    const githubNode = object["github.com"];

    if (!githubNode) {
      return null;
    }

    const token = githubNode["oauth_token"];

    if (!token) {
      return null;
    }
    return token;
  };

  const currentRepo = await getGitHubOwnerRepo();

  const program = new commander.Command();
  program.version(process.env.npm_package_version);

  program
    .command("changelog")
    .description("Generate changelog")
    .requiredOption("-l, --left <type>", "left side ref")
    .requiredOption("-r, --right <type>", "right side ref")
    .requiredOption("--repo <type>", "repo", currentRepo.repo)
    .requiredOption("--owner <type>", "owner", currentRepo.owner)
    .requiredOption(
      "--github_token <type>",
      "Access token for GitHub",
      getGitHubTokenFromGH() || process.env.GITHUB_ACCESS_TOKEN
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
      ).catch(errorHandler);
      const result = generator.render();
      log(result);
    });

  if (process.argv.length === 2) {
    log(process.env);
    log(program.helpInformation());
  } else {
    program.parse(process.argv);
  }
};

main().catch(errorHandler);
