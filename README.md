# GitHub Action: PR Parser

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/reviewdog/action-eslint?logo=github&sort=semver)](https://github.com/reviewdog/action-eslint/releases)

This action will scan a PR for certain variables and output them for use later

## Inputs

### `token`

**Required**. Github token for reading PR, defaults to using `${{ github.token }}`.

## Example usage

```yml
name: Create review app
on: [pull_request]
jobs:
  build-with-properties:
    name: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: EchelonFour/pr-parser@v1
      - run: echo $(SOMETHING_IN_THE_PR)
```
