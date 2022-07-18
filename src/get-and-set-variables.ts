import { endGroup, info, exportVariable, startGroup } from '@actions/core'
import { getCurrentPRMarkdown } from './github'
import { parseMarkdown } from './parser'

export async function getAndSetVariables(): Promise<void> {
  const markdownFromPR = await getCurrentPRMarkdown()

  const variables = parseMarkdown(markdownFromPR)

  startGroup('Setting environment variables')
  // eslint-disable-next-line security-node/detect-unhandled-async-errors
  for (const key of Object.keys(variables)) {
    info(`Key: ${key} - Value: ${variables[key]}`)
    exportVariable(key, variables[key])
  }
  endGroup()
}
