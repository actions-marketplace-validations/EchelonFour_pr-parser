import { expect, test, describe, jest } from '@jest/globals'
import { getInput } from '@actions/core'
import { getAdditionalExtensions } from './github'

jest.mock('@actions/core')

const mockedGetInput = jest.mocked(getInput)

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
