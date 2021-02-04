# A changelog generator that regarding pulls and specified commits.

## Installation

```
npm install -g @muukii/chglog
```

## Usage

```
$ cd /path/to/your-repo
```

```
$ chglog changelog --github_token <YOUR_TOKEN> -l 8.5.0 -r 8.6.0 --owner VergeGroup --repo Verge
```

> `--github_token` reads also enviroment variable `GITHUB_ACCESS_TOKEN`.

## Customization - Inject JS

In addition using built-in generator, we can inject javascript code that generates a changelog with our own rules.

Create javascript file and use following template code.

```js
module.exports = () => {

    const state = {
        titles: []
    }

    return {

        visit(pullRequest) {
            state.titles.push(pullRequest.title)
        },

        visitLabel(label, pullRequest) {

        },

        visitAuthor(author, pullRequest) {

        },

        render() {
            
            return JSON.stringify(state, null, 2)
        }
    }
}
```

Pssing this from argument

```sh
$ chglog changelog -g /path/to/your_generator.js
```

## Customization - From JS

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
