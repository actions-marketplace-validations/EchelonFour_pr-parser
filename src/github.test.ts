import { expect, test, describe, jest } from '@jest/globals'
import { getInput } from '@actions/core'
import { getCurrentPRMarkdown } from './github'

jest.mock('@actions/core')

const mockedGetInput = jest.mocked(getInput)

describe('getCurrentPRMarkdown', () => {
  test('return input', async () => {
    mockedGetInput.mockReturnValue('cool value')
    const result = getCurrentPRMarkdown()
    expect(result).toEqual('cool value')
  })
})
