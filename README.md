# git-diff-gen

## Usage

```
yarn add git-diff-gen
```

```
yarn run git-diff-gen -l master -r develop -t <GITHUB_API_TOKEN>
```

## Development

### Customize Template

Create Visitor object

```javascript
const visitor = {
  visitLabel(label, source) {},
  visitAuthor(author, source) {}
};
```

```javascript
await fetchData(labelGroupedVisitor);
```
