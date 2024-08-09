// This basically is https://github.com/oprypin/find-latest-tag/blob/master/index.js but modernized and with a few tweaks
//
const core = require('@actions/core')
const github = require('@actions/github')
const _ = require('lodash')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run () {
  try {
    const repository = core.getInput('repository', { required: true })
    const repoParts = repository.split('/')
    if (repoParts.length !== 2) {
      throw Object.assign(
        new Error(
          `Invalid repository "${repository}" (needs to have one slash)`
        )
      )
    }
    const [owner, repo] = repoParts

    const limit = 1 * core.getInput('limit', { required: true })
    const releasesOnly =
      (core.getInput('releases-only') || 'false').toLowerCase() === 'true'
    const prefix = core.getInput('prefix') || ''
    const regex = core.getInput('regex') || null
    const reverse =
      (core.getInput('reverse') || 'false').toLowerCase() === 'true'

    const octokit = github.getOctokit(core.getInput('token'))

    core.setOutput(
      'tags',
      await getLatestTags(
        octokit,
        owner,
        repo,
        limit,
        releasesOnly,
        prefix,
        regex,
        reverse
      )
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function getLatestTags (
  octokit,
  owner,
  repo,
  limit,
  releasesOnly,
  prefix,
  regex,
  reverse
) {
  const endpoint = releasesOnly
    ? octokit.rest.repos.listReleases
    : octokit.rest.repos.listTags
  const pages = endpoint.endpoint.merge({
    owner,
    repo,
    per_page: 100
  })

  const tags = []
  for await (const item of getItemsFromPages(octokit, pages)) {
    const tag = releasesOnly ? item.tag_name : item.name
    if (!tag.startsWith(prefix)) {
      continue
    }
    const safeRegex = _.escapeRegExp(regex)
    if (safeRegex && !new RegExp(safeRegex).test(tag)) {
      continue
    }
    tags.push(tag)
  }
  if (tags.length === 0) {
    let error = `The repository "${owner}/${repo}" has no `
    error += releasesOnly ? 'releases' : 'tags'
    if (prefix) {
      error += ` matching "${prefix}*"`
    }
    throw Object.assign(new Error(error))
  }

  // We want to get the most recent tags!
  tags.reverse()

  const latestTags = tags.slice(-limit)

  if (!reverse) {
    // reverse the list again unless we WANT it most recent at the top
    latestTags.reverse()
  }

  return latestTags
}

async function * getItemsFromPages (octokit, pages) {
  for await (const page of octokit.paginate.iterator(pages)) {
    for (const item of page.data) {
      yield item
    }
  }
}

module.exports = {
  run
}
