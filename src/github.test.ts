import { expect, test, describe, jest } from '@jest/globals'
import { getInput } from '@actions/core'
import { getCurrentPRMarkdown, getAdditionalExtensions } from './github'

jest.mock('@actions/core')

const mockedGetInput = jest.mocked(getInput)

describe('getCurrentPRMarkdown', () => {
  test('return input', async () => {
    mockedGetInput.mockReturnValue('cool value')
    const result = getCurrentPRMarkdown()
    expect(result).toEqual('cool value')
    expect(mockedGetInput).toBeCalledWith('markdown', { required: true })
  })
})

describe('getAdditionalExtensions', () => {
  test('return input', async () => {
    mockedGetInput.mockReturnValue('thing,otherthing,  otherotherthing')
    const result = getAdditionalExtensions()
    expect(result).toEqual(['thing', 'otherthing', 'otherotherthing'])
    expect(mockedGetInput).toBeCalledWith('additionalExtensions')
  })
  test('shortcuts if no input', async () => {
    mockedGetInput.mockReturnValue('')
    const result = getAdditionalExtensions()
    expect(result).toEqual([])
    expect(mockedGetInput).toBeCalledWith('additionalExtensions')
  })
})
