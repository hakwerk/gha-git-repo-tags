/**
 * Unit tests for the action's main functionality, src/main.js
 *
 * Do not forget to run `export GITHUB_TOKEN=....` before running `npm run all` or `npx jest`!
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.js', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation(() => '500')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('gets the repository tags', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'VegetableGarden/beet'
        case 'limit':
          return '6'
        case 'prefix':
          return ''
        case 'releases-only':
          return 'false'
        case 'regex':
          return null
        case 'reverse':
          return 'false'
        case 'token':
          return process.env.GITHUB_TOKEN
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.getInput).toHaveBeenCalledTimes(7)

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'tags', [
      '0.0.26',
      '0.0.25',
      '0.0.24',
      '0.0.23',
      '0.0.22',
      '0.0.21'
    ])
  })

  it('gets the releases only', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'VegetableGarden/beet'
        case 'limit':
          return '6'
        case 'prefix':
          return ''
        case 'releases-only':
          return 'true'
        case 'regex':
          return null
        case 'reverse':
          return 'false'
        case 'token':
          return process.env.GITHUB_TOKEN
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.getInput).toHaveBeenCalledTimes(7)

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'tags', [
      '0.0.3',
      '0.0.2',
      '0.0.1'
    ])
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'Invalid repository "" (needs to have one slash)'
    )
  })

  it('uses a prefix', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'dawidd6/action-get-tag'
        case 'limit':
          return '2'
        case 'prefix':
          return 'v'
        case 'reverse':
          return 'true'
        case 'token':
          return process.env.GITHUB_TOKEN
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.getInput).toHaveBeenCalledTimes(7)

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'tags', [
      'v1.0.0',
      'v1.1.0'
    ])
  })

  it('uses a regex', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'VegetableGarden/beet'
        case 'limit':
          return '3'
        case 'regex':
          return 'test.*'
        case 'releases-only':
          return 'true'
        case 'token':
          return process.env.GITHUB_TOKEN
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.getInput).toHaveBeenCalledTimes(7)

    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'The repository "VegetableGarden/beet" has no releases'
    )
  })

  it('has no releases', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'repository':
          return 'VegetableGarden/beet'
        case 'limit':
          return '3'
        case 'prefix':
          return 'release'
        case 'reverse':
          return 'false'
        case 'token':
          return process.env.GITHUB_TOKEN
        default:
          return ''
      }
    })

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.getInput).toHaveBeenCalledTimes(7)

    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'The repository "VegetableGarden/beet" has no tags matching "release*"'
    )
  })
})
