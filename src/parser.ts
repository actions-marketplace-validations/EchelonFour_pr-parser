import { marked } from 'marked'
import { parse as parseDotenvFile } from 'dotenv'
import { debug, info, warning, error, startGroup, endGroup } from '@actions/core'
import { parse as parseJson5File } from 'json5'
import { parse as parseFileName } from 'path'

type CodeBlock = marked.Tokens.Code
type DotenvCodeBlock = CodeBlock & { lang: '.env' }
type JSONCodeBlock = CodeBlock & { lang: `${string}.json${'5' | ''}` }

const JSON_EXTENSION = '.json' as const
const JSON5_EXTENSION = `${JSON_EXTENSION}5` as const

function parseDotEnv(token: DotenvCodeBlock): Record<string, string> {
  info('Parsing .env block')
  debug(token.text)
  const results = parseDotenvFile(token.text)
  debug(`Found results ${JSON.stringify(results)}`)
  return results
}

function parseJSON(token: JSONCodeBlock, key: string): Record<string, string> {
  info(`Parsing .json block named ${token.lang}`)
  try {
    debug(`json key from lang: ${key}`)
    const value = JSON.stringify(parseJson5File(token.text))
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
      if (token.lang) {
        const langAsFilename = parseFileName(token.lang)
        const fileExtension = langAsFilename.ext.toLowerCase()
        if (token.lang === '.env') {
          Object.assign(variables, parseDotEnv(token as DotenvCodeBlock))
        } else if (langAsFilename.name && (fileExtension === JSON_EXTENSION || fileExtension === JSON5_EXTENSION)) {
          Object.assign(variables, parseJSON(token as JSONCodeBlock, langAsFilename.name))
        }
      }
    }
  })
  endGroup()
  return variables
}
