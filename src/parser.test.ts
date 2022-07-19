import { expect, test, describe, jest } from '@jest/globals'
import { parseMarkdown } from './parser'

describe('parser', () => {
  describe('dotenv', () => {
    test('reads', () => {
      const input = '```.env\nWOW=COOL\n```'
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({ WOW: 'COOL' })
    })
    test('invalid returns nothing', () => {
      const input = '```.env\nNOTCOOL\n```'
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({})
    })
  })

  describe('json', () => {
    test('reads', async () => {
      const input = '```RAD.json\n{ "wow": "cool!"   }\n```'
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({ RAD: '{"wow":"cool!"}' })
    })
    test('json5 syntax allowed', async () => {
      const input = '```RAD.json5\n{wow: "cool!",// comment\n}\n```'
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({ RAD: '{"wow":"cool!"}' })
    })
    test('json and json5 interchangable', async () => {
      const input = '```RAD.json\n{wow: "cool!",// comment\n}\n```'
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({ RAD: '{"wow":"cool!"}' })
    })
    test('invalid values return nothing', async () => {
      const input = '```sick.json\nnot valid\n```'
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({})
    })
    test('invalid key return nothing', async () => {
      const input = '```.json\n{"wow": "cool!"}\n```'
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({})
    })
    test('wild and crazy behaviour marches on', async () => {
      const input = '```sick.json\n{"wow": "cool!"}\n```'
      jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 69
      })
      const values = parseMarkdown(input)
      expect(values).toStrictEqual({})
    })
  })
  test('parses complex trees of many types', async () => {
    const input = `
# header
> \`\`\`.env
>   blockquote=still here
> \`\`\`
1. Lists
    1. Fenced:
        \`\`\`fenced.JsOn
        {"exists":"still"}
        \`\`\`
`
    const values = parseMarkdown(input)
    expect(values).toStrictEqual({ blockquote: 'still here', fenced: '{"exists":"still"}' })
  })

  test('ignores other code blocks', async () => {
    const input = `
\`\`\`
blockquote=still here
\`\`\`
\`\`\`javascript
{"exists":"still"}
\`\`\`
`
    const values = parseMarkdown(input)
    expect(values).toStrictEqual({})
  })

  describe('generic', () => {
    test('reads', () => {
      const input = '```whatever.bingbong\nsomething\n```'
      const values = parseMarkdown(input, ['bingbong'])
      expect(values).toStrictEqual({ whatever: 'something' })
    })
  })
})
