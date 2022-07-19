import { expect, test, describe, jest } from '@jest/globals'
import { exportVariable } from '@actions/core'
import { getAndSetVariables } from './get-and-set-variables'
import { getCurrentPRMarkdown } from './github'
import { parseMarkdown } from './parser'

jest.mock('@actions/core')
jest.mock('./github')
jest.mock('./parser')

const mockedExportVariable = jest.mocked(exportVariable)
const mockedGetCurrentPRMarkdown = jest.mocked(getCurrentPRMarkdown)
const mockedParseMarkdown = jest.mocked(parseMarkdown)

describe('get and set functions', () => {
  test('runs and sets appropriate values', async () => {
    mockedGetCurrentPRMarkdown.mockReturnValue('```.env\ncool=wow\n```')
    mockedParseMarkdown.mockReturnValue({ cool: 'wow', yes: 'stuff' })
    await getAndSetVariables()
    expect(mockedParseMarkdown).toBeCalledWith('```.env\ncool=wow\n```')
    expect(mockedExportVariable).toBeCalledTimes(2)
    expect(mockedExportVariable).toBeCalledWith('cool', 'wow')
    expect(mockedExportVariable).toBeCalledWith('yes', 'stuff')
  })
})
