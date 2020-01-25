# Pull-Request Picker from commits to generate the release-log

## Installation

```
yarn add chglog
```

## Usage

```
Usage: chglog [options]

Options:
  -l, --left <type>     left side ref
  -r, --right <type>    right side ref
  -t, --token <type>    GitHub API Token
  --repo-owner <type>   Repository owner
  --repo-name <type>    Repository name
  --working_dir <type>  Path to git repo
  -h, --help            output usage information
```

### Customize Template

*Currently, does not support Template engine*

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
