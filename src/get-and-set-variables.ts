import { endGroup, info, exportVariable, startGroup } from '@actions/core'
import { getCurrentPRMarkdown } from './github'
import { parseMarkdown } from './parser'

export async function getAndSetVariables(): Promise<void> {
  const markdownFromPR = getCurrentPRMarkdown()

  const variables = parseMarkdown(markdownFromPR)

  startGroup('Setting environment variables')
  for (const key of Object.keys(variables)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    info(`Key: ${key} - Value: ${variables[key]}`)
    exportVariable(key, variables[key])
  }
  endGroup()
}
