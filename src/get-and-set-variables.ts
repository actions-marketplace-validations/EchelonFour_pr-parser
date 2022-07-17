import { setOutput } from '@actions/core'
import { getCurrentPRMarkdown } from './github'
import { parseMarkdown } from './parser'

export async function getAndSetVariables(): Promise<void> {
  const markdownFromPR = await getCurrentPRMarkdown()

  const variables = parseMarkdown(markdownFromPR)

  // eslint-disable-next-line security-node/detect-unhandled-async-errors
  for (const key of Object.keys(variables)) {
    setOutput(key, variables[key])
  }
}
