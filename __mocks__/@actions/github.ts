import { jest } from '@jest/globals'
import type * as Github from '@actions/github'

const github = jest.createMockFromModule('@actions/github') as typeof Github

Object.defineProperty(github.context, 'issue', {
  value: {
    repo: 'repoName',
    owner: 'ownerName',
    number: 69,
  },
})

module.exports = github
