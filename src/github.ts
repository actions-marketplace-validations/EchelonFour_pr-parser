import { context as currentGithubContext, getOctokit } from '@actions/github'
import { getInput, debug, info } from '@actions/core'

type Octokit = ReturnType<typeof getOctokit>

export interface PullRequestContext {
  repo: string
  owner: string
  number: number
}

const PR_BODY_QUERY = /* GraphQL */ `
  query ($repo: String!, $owner: String!, $number: Int!) {
    repository(name: $repo, owner: $owner) {
      pullRequest(number: $number) {
        body
      }
    }
  }
`
interface PullRequestQueryResponseData {
  repository?: {
    pullRequest?: {
      body?: string
    }
  }
}

function getCurrentOctokit(): Octokit {
  const token = getInput('token', { required: true })
  return getOctokit(token)
}

async function queryForPRMarkdown(octokit: Octokit, context: PullRequestContext): Promise<string> {
  const response = await octokit.graphql<PullRequestQueryResponseData | undefined>(PR_BODY_QUERY, { ...context })
  const body = response?.repository?.pullRequest?.body
  if (body == null) {
    throw new Error(`failed to read PR body from github, raw response was ${JSON.stringify(response)}`)
  }
  return body
}

export async function getCurrentPRMarkdown(): Promise<string> {
  const octokit = getCurrentOctokit()
  const result = await queryForPRMarkdown(octokit, currentGithubContext.issue)
  info('Pull request body downloaded')
  debug('Full PR Body:')
  debug(result)
  return result
}

export function getAdditionalExtensions(): string[] {
  const rawExtensions = getInput('additionalExtensions')
  if (!rawExtensions) {
    debug('no addition extensions')
    return []
  }
  debug(`Extensions: ${rawExtensions}`)
  const extensions = rawExtensions.split(',').map((extension) => extension.trim())
  debug(`Parsed extensions: ${extensions.join('|')}`)
  return extensions
}
