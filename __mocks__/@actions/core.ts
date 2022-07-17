import { jest } from '@jest/globals'
import type * as Core from '@actions/core'

const core = jest.createMockFromModule('@actions/core') as typeof Core

core.getInput = jest.fn<typeof Core.getInput>().mockImplementation((input: string) => `MOCK_${input}`)

module.exports = core
