import github from '@actions/github'
import { getInput } from '@actions/core'

type Octokit = ReturnType<typeof github.getOctokit>

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

export function getCurrentOctokit(): Octokit {
  const token = getInput('GITHUB_TOKEN')
  return github.getOctokit(token)
}

export function pullRequestContext(): PullRequestContext {
  return github.context.issue
}

export async function queryForPRMarkdown(octokit: Octokit, context: PullRequestContext): Promise<string> {
  const response = await octokit.graphql<PullRequestQueryResponseData | undefined>(PR_BODY_QUERY, { ...context })
  const body = response?.repository?.pullRequest?.body
  if (body == null) {
    throw new Error(`failed to read PR body from github, raw response was ${JSON.stringify(response)}`)
  }
  return body
}

export async function getCurrentPRMarkdown(): Promise<string> {
  const octokit = getCurrentOctokit()
  return queryForPRMarkdown(octokit, pullRequestContext())
}
