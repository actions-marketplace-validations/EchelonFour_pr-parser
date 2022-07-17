import * as core from '@actions/core'
import { getAndSetVariables } from './get-and-set-variables'

async function run(): Promise<void> {
  try {
    await getAndSetVariables()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

void run()
