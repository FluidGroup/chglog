# Crawling pull-request with commit message and commit hash

## Installation

```
yarn add chglog
```

## Usage

Define a visitor

```ts
const createSampleVistor = () => {
  return {
    visitLabel(label: any, source: any) {
      ...
    },
    visitAuthor(author, source) {
      ...
    },   
};
```

Fetch and parse

```ts
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
```
