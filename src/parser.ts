import { marked } from 'marked'
import { parse as parseDotenvFile } from 'dotenv'
import { debug, info, warning, error, startGroup, endGroup } from '@actions/core'
import { parse as parseJson5File } from 'json5'
import { parse as parseFileName } from 'path'

type CodeBlock = marked.Tokens.Code
type CodeBlockWithLang = CodeBlock & { lang: string }
type DotenvCodeBlock = CodeBlock & { lang: '.env' }
type JSONCodeBlock = CodeBlock & { lang: `${string}.json${'5' | ''}` }

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

function readGenericFile(token: CodeBlockWithLang, key: string): Record<string, string> {
  info(`Reading generic block named ${token.lang}`)
  debug(`key from lang: ${key}`)
  const value = token.text
  debug(`value: ${value}`)
  return { [key]: value }
}

function parseCodeBlock(token: CodeBlockWithLang, additionalExtensions: string[]): Record<string, string> | null {
  const langAsFilename = parseFileName(token.lang)
  const fileExtension = langAsFilename.ext.toLowerCase().slice(1)
  if (token.lang === '.env') {
    return parseDotEnv(token as DotenvCodeBlock)
  }
  if (langAsFilename.name && (fileExtension === 'json' || fileExtension === 'json5')) {
    return parseJSON(token as JSONCodeBlock, langAsFilename.name)
  }
  if (additionalExtensions.includes(fileExtension)) {
    return readGenericFile(token, langAsFilename.name)
  }
  return null
}
export function parseMarkdown(markdown: string, additionalExtensions: string[] = []): Record<string, string> {
  startGroup('Parsing PR for relevant code blocks')
  const variables: Record<string, string> = {}
  marked.walkTokens(marked.lexer(markdown), (token) => {
    debug(`Found markdown block: ${token.type}`)
    if (token.type === 'code') {
      debug(`Found code block with lang: ${token.lang || 'undefined lang'}`)
      if (token.lang) {
        Object.assign(variables, parseCodeBlock(token as CodeBlockWithLang, additionalExtensions))
      }
    }
  })
  endGroup()
  return variables
}
