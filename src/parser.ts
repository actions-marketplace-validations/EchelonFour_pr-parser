import { marked } from 'marked'
import { parse } from 'dotenv'

const JSON_EXTENSION = '.json'

function parseDotEnv(token: marked.Tokens.Code): Record<string, string> {
  return parse(token.text)
}

function parseJSON(token: marked.Tokens.Code): Record<string, string> {
  try {
    const key = token.lang?.slice(0, token.lang.length - JSON_EXTENSION.length)
    if (!key) {
      throw new Error('cannot read variable name from lang hint')
    }
    const value = JSON.stringify(JSON.parse(token.text))
    return { [key]: value }
  } catch {
    return {}
  }
}

export function parseMarkdown(markdown: string): Record<string, string> {
  const variables: Record<string, string> = {}
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if (token.type === 'code') {
      if (token.lang === '.env') {
        Object.assign(variables, parseDotEnv(token))
      } else if (token.lang?.toLowerCase()?.endsWith(JSON_EXTENSION)) {
        Object.assign(variables, parseJSON(token))
      }
    }
  })
  return variables
}
