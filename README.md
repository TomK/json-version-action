# GitHub Action to detect changes in package.json version

This action parses a json file and outputs the version has changed. Optionally diffs the version with another specified
version.

## Inputs

### `repo-token`

The GITHUB_TOKEN secret

### `path`

Sets the path to the json file. Default 'package.json'.

### `compare`

The version to compare to against. Will populate the `version-diff` output.

## Outputs

### `version`

The content of the version key in the specified json file.

### `version-diff`

semver diff between the version and the compare version.

## Example usage

```
jobs:
  build-only-major:
    runs-on: ubuntu-latest
    steps:
    - uses: TomK/json-version-action
      id: version
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        compare: 0.0.0
    - uses: actions/checkout@v1
      if: steps.version.outputs.version-diff == 'major'
      with:
        fetch-depth: 1
    - uses: actions/setup-node@v1
      if: steps.version.outputs.version-diff == 'major'
      with:
        node-version: '12.x'
    - run: npm install
      if: steps.version.outputs.version-diff == 'major'
    - run: npm run build
      if: steps.version.outputs.version-diff == 'major'
```
