# GitHub Action: PR Parser

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/EchelonFour/pr-parser?logo=github&sort=semver)](https://github.com/EchelonFour/pr-parser/releases)

This action will scan a PR for certain variables and output them for use later.

## PR format

### .env

You must make your PR have the following in it:

````
```.env
SOMETHING_IN_THE_PR=TRUE #comment
SOMETHING_ELSE="WOW
even with multilines!"
```
````

It will scan the code block with `.env` for the lang and put it in the environment. It uses the [dotenv library](https://github.com/motdotla/dotenv#usage) for parsing, so it will support all their syntax for multiline and comments and quoting.

### JSON

You can also include json files.

````
```KEY_NAME.json
{
  "json": "data",
  "with values": true
}
```
````

```bash
> echo $KEY_NAME
{"json":"data","with values":true}
```

It will parse and compress the object and put it in the variable `KEY_NAME`. The file name can be anything you like, just be sure to end it with `.json` and it will be included.

### Multiple types

You can combine as many .env or json code blocks as you like and they will all be parsed in order and merged together. If you have any duplicate keys, then the later ones will override.

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
      - run: echo $SOMETHING_IN_THE_PR
```
