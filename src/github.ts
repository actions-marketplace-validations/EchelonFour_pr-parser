import { debug, getInput } from '@actions/core'

export function getCurrentPRMarkdown(): string {
  const body = getInput('markdown', { required: true })
  debug('Full PR Body:')
  debug(body)
  return body
}
