# A changelog generator that regarding pulls and specified commits.

## Installation

```
npm install -g @muukii/chglog
```

## Example 

From: [VergeGroup/Verge](https://github.com/VergeGroup/Verge)

```sh
$ chglog changelog -l 8.0.0 -r 8.6.0 --owner VergeGroup --repo Verge
```

<details><summary>CLICK ME</summary>
<p>


Number of PRs : 31

|tag|number of PRs|
|--|--:|
|Breaking Changes | 11|
|Performance | 3|
|Rename | 3|
|New Feature | 4|
|Docs | 1|
|Remove Symobl | 1|



### Group: Fix issues (3)
- Make EventEmitter delivering event by commit order. [#222](https://github.com/VergeGroup/Verge/pull/222) by @muukii
  - `Breaking Changes`
- Add runtime sanitizer - Debug only [#220](https://github.com/VergeGroup/Verge/pull/220) by @muukii
- Fix InoutRef's wrapped property [#189](https://github.com/VergeGroup/Verge/pull/189) by @muukii        



### Group: Enhancement (26)
- Reduce reflecting to get performance [#226](https://github.com/VergeGroup/Verge/pull/226) by @muukii
  - `Breaking Changes` `Performance`
- Improve EntityType performance [#224](https://github.com/VergeGroup/Verge/pull/224) by @muukii
  - `Performance`
- Update default queue in sinkPrimitiveValue [#214](https://github.com/VergeGroup/Verge/pull/214) by @muukii
  - `Breaking Changes`
- Reduce the number of Emitters [#216](https://github.com/VergeGroup/Verge/pull/216) by @muukii
- Add runtime sanitizer - Debug only [#220](https://github.com/VergeGroup/Verge/pull/220) by @muukii
- Add documentation [#219](https://github.com/VergeGroup/Verge/pull/219) by @muukii
- Rename MemoizeMap to Pipeline [#211](https://github.com/VergeGroup/Verge/pull/211) by @muukii
  - `Rename`
- Add Sink method to DispatcherType [#208](https://github.com/VergeGroup/Verge/pull/208) by @muukii
  - `New Feature`
- [Experimental] Add creation method of SwiftUI.Binding [#210](https://github.com/VergeGroup/Verge/pull/210) by @muukii
- Support RxSwift 6 [#209](https://github.com/VergeGroup/Verge/pull/209) by @muukii
  - `Breaking Changes` `New Feature` `Performance`
- Update methods of Changes that become to use Comparer instead of closure [#207](https://github.com/VergeGroup/Verge/pull/207) by @muukii
  - `Breaking Changes`
- Add isEmpty to EntityTable [#206](https://github.com/VergeGroup/Verge/pull/206) by @muukii
  - `New Feature`
- Update Rx extension [#202](https://github.com/VergeGroup/Verge/pull/202) by @muukii
- Add method that maps Edge [#201](https://github.com/VergeGroup/Verge/pull/201) by @muukii
  - `Rename`
- Remove Verge/Core [#200](https://github.com/VergeGroup/Verge/pull/200) by @muukii
  - `Breaking Changes`
- Update CachedMapStorage [#199](https://github.com/VergeGroup/Verge/pull/199) by @muukii
  - `New Feature`
- Update how Derived retain itself to publish the value [#198](https://github.com/VergeGroup/Verge/pull/198) by @muukii
- Update cancelling in EventEmitter [#197](https://github.com/VergeGroup/Verge/pull/197) by @muukii
  - `Breaking Changes`
- Fix race-condition in VergeAnyCancellable [#196](https://github.com/VergeGroup/Verge/pull/196) by @muukii
- Drop receive changes itself in Store, Dispatcher [#195](https://github.com/VergeGroup/Verge/pull/195) by @muukii
  - `Breaking Changes`
- [Trivial] Update docs and few renames. [#194](https://github.com/VergeGroup/Verge/pull/194) by @muukii
  - `Docs` `Rename`
- [ORM] context.entities [#192](https://github.com/VergeGroup/Verge/pull/192) by @muukii
- Add precondition [#191](https://github.com/VergeGroup/Verge/pull/191) by @muukii
- Changes get a modification that indicates how the state changed [#190](https://github.com/VergeGroup/Verge/pull/190) by @muukii
- Support assign-assignee from Store [#187](https://github.com/VergeGroup/Verge/pull/187) by @muukii
  - `Breaking Changes` `Remove Symobl`
- Deprecation combined derived method [#184](https://github.com/VergeGroup/Verge/pull/184) by @muukii
  - `Breaking Changes`        


## Other (3)

- Bump ini from 1.3.5 to 1.3.8 in /Docs [#205](https://github.com/VergeGroup/Verge/pull/205) by @dependabot
- Changes default parameter which is queue in sink -> .mainIsolated() [#193](https://github.com/VergeGroup/Verge/pull/193) by @muukii
  - `Breaking Changes`
- Support rx.commitBinder [#188](https://github.com/VergeGroup/Verge/pull/188) by @muukii        


---
<sub>
  Generated by <a href="https://github.com/muukii/chglog">chglog</a>
</sub>;

</p>
</details>

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
