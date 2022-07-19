import { debug, getInput } from '@actions/core'

export function getCurrentPRMarkdown(): string {
  const body = getInput('markdown', { required: true })
  debug('Full PR Body:')
  debug(body)
  return body
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
