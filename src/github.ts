import { debug } from '@actions/core'
import { readFile } from 'fs/promises'
import type { PullRequestEvent } from '@octokit/webhooks-types'

async function extractPayload(): Promise<PullRequestEvent> {
  const path = process.env.GITHUB_EVENT_PATH
  if (!path) {
    throw new Error(`GITHUB_EVENT_PATH environment variable does not exist`)
  }
  try {
    const eventFile = await readFile(path, { encoding: 'utf8' })
    return JSON.parse(eventFile) as PullRequestEvent
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Could not read event payload file ${error}`)
  }
}

export async function getCurrentPRMarkdown(): Promise<string> {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') {
    throw new Error('this action only supports pull request triggers')
  }

  const context = await extractPayload()
  const body = context.pull_request?.body
  if (body == null) {
    throw new Error('could not find body of pull request in event payload')
  }
  debug('Full PR Body:')
  debug(body)

  return body
}
