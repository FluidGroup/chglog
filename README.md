# A changelog generator that regarding pulls and specified commits.

## Installation

```
npm install -g chglog
```

## Usage

```
$ cd /path/to/your-repo
```

```
$ chglog changelog -l 8.5.0 -r 8.6.0 --owner VergeGroup --repo Verge
```

## Customization

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

Module resolutions:

- core
- extensions
- cli


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
