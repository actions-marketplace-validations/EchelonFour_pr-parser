import { marked } from 'marked'
import { parse } from 'dotenv'
import { debug, info, warning, error, startGroup, endGroup } from '@actions/core'

type CodeBlock = marked.Tokens.Code
type DotenvCodeBlock = CodeBlock & { lang: '.env' }
type JSONCodeBlock = CodeBlock & { lang: `${string}.json` }

const JSON_EXTENSION = '.json' as const

function parseDotEnv(token: DotenvCodeBlock): Record<string, string> {
  info('Parsing .env block')
  debug(token.text)
  const results = parse(token.text)
  debug(`Found results ${JSON.stringify(results)}`)
  return results
}

function parseJSON(token: JSONCodeBlock): Record<string, string> {
  info(`Parsing .json block named ${token.lang}`)
  try {
    const key = token.lang?.slice(0, token.lang.length - JSON_EXTENSION.length)
    if (!key) {
      throw new Error('cannot read variable name from lang hint')
    }
    debug(`json key from lang: ${key}`)
    const value = JSON.stringify(JSON.parse(token.text))
    debug(`json value: ${value}`)
    return { [key]: value }
  } catch (thrownError) {
    if (typeof thrownError === 'string' || thrownError instanceof Error) {
      warning(thrownError)
    } else {
      error('Error of unknown type thrown while parsing json block')
    }
    debug('returning nothing to silently fail')
    return {}
  }
}

export function parseMarkdown(markdown: string): Record<string, string> {
  startGroup('Parsing PR for relevant code blocks')
  const variables: Record<string, string> = {}
  marked.walkTokens(marked.lexer(markdown), (token) => {
    debug(`Found markdown block: ${token.type}`)
    if (token.type === 'code') {
      debug(`Found code block with lang: ${token.lang || 'undefined lang'}`)
      if (token.lang === '.env') {
        Object.assign(variables, parseDotEnv(token as DotenvCodeBlock))
      } else if (token.lang?.toLowerCase()?.endsWith(JSON_EXTENSION)) {
        Object.assign(variables, parseJSON(token as JSONCodeBlock))
      }
    }
  })
  endGroup()
  return variables
}
