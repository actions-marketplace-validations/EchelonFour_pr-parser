import { endGroup, info, exportVariable, startGroup } from '@actions/core'
import { getAdditionalExtensions, getCurrentPRMarkdown } from './github'
import { parseMarkdown } from './parser'

export async function getAndSetVariables(): Promise<void> {
  const markdownFromPR = getCurrentPRMarkdown()
  const additionalExtensions = getAdditionalExtensions()

  const variables = parseMarkdown(markdownFromPR, additionalExtensions)

  startGroup('Setting environment variables')
  for (const key of Object.keys(variables)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    info(`Key: ${key} - Value: ${variables[key]}`)
    exportVariable(key, variables[key])
  }
  endGroup()
}
