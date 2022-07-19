import { expect, test, describe, jest, beforeEach, afterEach } from '@jest/globals'
import { readFile } from 'fs/promises'
import type { PullRequestEvent, PullRequestOpenedEvent, Repository, User } from '@octokit/webhooks-types'
import { getCurrentPRMarkdown } from './github'

jest.mock('fs/promises')

const mockedReadFile = jest.mocked(readFile)

function setMockEventData(data: PullRequestEvent): void {
  mockedReadFile.mockResolvedValue(JSON.stringify(data))
}

describe('getCurrentPRMarkdown', () => {
  const { env } = process

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env }
    process.env.GITHUB_EVENT_NAME = 'pull_request'
    process.env.GITHUB_EVENT_PATH = '/event.json'
  })

  afterEach(() => {
    process.env = env
  })
  test("errors if we aren't in a pr", async () => {
    delete process.env.GITHUB_EVENT_NAME
    await expect(getCurrentPRMarkdown).rejects.toThrowError('This action only supports pull request triggers')
    process.env.GITHUB_EVENT_NAME = ''
    await expect(getCurrentPRMarkdown).rejects.toThrowError('This action only supports pull request triggers')
    process.env.GITHUB_EVENT_NAME = 'push'
    await expect(getCurrentPRMarkdown).rejects.toThrowError('This action only supports pull request triggers')
  })

  test('errors if there is no event path', async () => {
    delete process.env.GITHUB_EVENT_PATH
    await expect(getCurrentPRMarkdown).rejects.toThrowError('GITHUB_EVENT_PATH environment variable does not exist')
  })

  test('errors if the event file cannot be read', async () => {
    mockedReadFile.mockRejectedValue(new Error('fs error'))
    await expect(getCurrentPRMarkdown).rejects.toThrowError('Could not read event payload file Error: fs error')
  })

  test("errors if the event doesn't have pull data in it", async () => {
    setMockEventData({} as PullRequestEvent)
    await expect(getCurrentPRMarkdown).rejects.toThrowError('Could not find body of pull request in event payload')
  })

  test("errors if the event doesn't have pull body data in it", async () => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    setMockEventData({
      action: 'opened',
      number: 0,
      pull_request: {
        state: 'open',
      } as PullRequestOpenedEvent['pull_request'],
      repository: {} as Repository,
      sender: {} as User,
    })
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
    await expect(getCurrentPRMarkdown).rejects.toThrowError('Could not find body of pull request in event payload')
  })

  test('returns pr body from event body data', async () => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    setMockEventData({
      action: 'opened',
      number: 0,
      pull_request: {
        state: 'open',
        body: 'COOL BODY',
      } as PullRequestOpenedEvent['pull_request'],
      repository: {} as Repository,
      sender: {} as User,
    })
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
    const body = await getCurrentPRMarkdown()
    expect(body).toEqual('COOL BODY')
    expect(mockedReadFile).toBeCalledWith('/event.json', { encoding: 'utf8' })
  })
})
