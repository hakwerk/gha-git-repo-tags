const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
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

    const limit = core.getInput('limit', { required: true })
    const releasesOnly = core.getBooleanInput('releases-only')
    const prefix = core.getInput('prefix') || ''
    const regex = core.getInput('regex') || null
    const reverse = core.getBooleanInput('reverse')

    core.setOutput(
      'tags',
      await getLatestTags(
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

const octokit = github.getOctokit({ token: core.getInput('token') || null })

async function getLatestTags(
  owner,
  repo,
  limit,
  releasesOnly,
  prefix,
  regex,
  reverse
) {
  const endpoint = releasesOnly
    ? octokit.repos.listReleases
    : octokit.repos.listTags

  const pages = endpoint.endpoint.merge({
    owner,
    repo,
    per_page: 100
  })

  const tags = []
  for await (const item of getItemsFromPages(pages)) {
    const tag = releasesOnly ? item['tag_name'] : item['name']
    if (!tag.startsWith(prefix)) {
      continue
    }
    if (regex && !new RegExp(regex).test(tag)) {
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
    throw error
  }
  if (reverse) {
    tags.reverse()
  }
  const latestTags = tags.slice(-limit, -1)

  return latestTags
}

async function* getItemsFromPages(pages) {
  for await (const page of octokit.paginate.iterator(pages)) {
    for (const item of page.data) {
      yield item
    }
  }
}

module.exports = {
  run
}

// TODO: put at TOP
// This basically is https://github.com/oprypin/find-latest-tag/blob/master/index.js but modernized and with a few tweaks
//
