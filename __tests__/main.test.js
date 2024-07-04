/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')

// Mock the GitHub Actions core library
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const getBooleanInputMock = jest
  .spyOn(core, 'getBooleanInput')
  .mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('gets the repository tags', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repository':
          return 'actions/checkout'
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
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(getInputMock).toHaveBeenCalledTimes(4)
    expect(getBooleanInputMock).toHaveBeenCalledTimes(2)
    //expect(setOutputMock).toHaveBeenCalledTimes(1)
    // expect(setFailedMock).toHaveBeenNthCalledWith(
    //   1,
    //   'Invalid repository "" (needs to have one slash)'
    // )
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return 'this is not a number'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Invalid repository "" (needs to have one slash)'
    )
  })
})
