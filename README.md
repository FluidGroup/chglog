# Crawling pull-request with commit message and commit hash

## Installation

```
yarn add chglog
```

## Usage

Define a visitor

```ts
export interface Visitor {
  visitLabel(label: Label, source: PullRequest): void;
  visitAuthor(author: User, source: PullRequest): void;
}
```

```ts
const createSampleVistor = () => {
  return {
    visitLabel(label: Label, source: PullRequest) {
      ...
    },
    visitAuthor(author: User, source: PullRequest) {
      ...
    },
};
```

Fetch and parse

```ts
const visitor = createSampleVistor();

await fetchData(
  {
    rightRef: "",
    leftRef: "",
    githubToken: "",
    repoOwner: "",
    repoName: "",
    workingDirectory: "",
  },
  visitor
);
```

## Development

Install dependencies

```
$ lerna bootstrap
```

Build all packages

```
$ lerna exec yarn run build
```

Run CLI

```
$ cd ./packages/cli
$ yarn run dev
```
