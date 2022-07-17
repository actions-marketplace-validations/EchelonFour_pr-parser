import { expect, test, describe, jest } from '@jest/globals'
import { setOutput } from '@actions/core'
import { getAndSetVariables } from './get-and-set-variables'
import { getCurrentPRMarkdown } from './github'
import { parseMarkdown } from './parser'

jest.mock('@actions/core')
jest.mock('./github')
jest.mock('./parser')

const mockedSetOutput = jest.mocked(setOutput)
const mockedGetCurrentPRMarkdown = jest.mocked(getCurrentPRMarkdown)
const mockedParseMarkdown = jest.mocked(parseMarkdown)

describe('get and set functions', () => {
  test('runs and sets appropriate values', async () => {
    mockedGetCurrentPRMarkdown.mockResolvedValue('```.env\ncool=wow\n```')
    mockedParseMarkdown.mockReturnValue({ cool: 'wow', yes: 'stuff' })
    await getAndSetVariables()
    expect(mockedParseMarkdown).toBeCalledWith('```.env\ncool=wow\n```')
    expect(mockedSetOutput).toBeCalledTimes(2)
    expect(mockedSetOutput).toBeCalledWith('cool', 'wow')
    expect(mockedSetOutput).toBeCalledWith('yes', 'stuff')
  })
})
