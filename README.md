# GitHub Action: git repository tags

[![GitHub Super-Linter](https://github.com/hakwerk/gha-git-repo-tags/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/hakwerk/gha-git-repo-tags/actions/workflows/ci.yml/badge.svg)
[![cov](https://raw.githubusercontent.com/hakwerk/gha-git-repo-tags/main/badges/coverage.svg)](https://github.com/hakwerk/gha-git-repo-tags/actions)

GitHub Action to get last N tags from a repository.

## Action I/O

### Inputs

- `repository`: Repository name with owner, e.g. 'actions/checkout' (required)
- `limit`: Number of tags to return (required, default: `10`)
- `releases-only`: Consider only tags that have an associated release
- `prefix`: Consider only tags starting with this string prefix
- `regex`: Consider only tags that matches specified RegEx pattern
- `reverse`: Reverse the order of the tags returned (oldest first)
- `token`: Personal access token (auto-populated). It is used only because
  anonymous requests are rate-limited. It can be overridden to an empty value

### Outputs

- `tags`: List of the full tag names (incl. prefix) that were found up to the
  limit

### Example

An example of how the Action is used would be the following:

```yaml
steps:
  - name: Find latest nginx release tags
    id: nginx
    uses: hakwerk/gha-git-repo-tags@v1
    with:
      repository: nginx/nginx
      limit: 3
      reverse: true

  - name: Print tags
    run: echo ${{ steps.nginx.outputs.tags }}
```

The action can also be used to gather input for a matrix workflow job:

```yaml
jobs:
  get_tags:
    runs-on: ubuntu-latest
    outputs:
      nginx_tags: ${{ steps.nginx.outputs.tags }}
    steps:
      - name: Find latest nginx release tags
        id: nginx
        uses: hakwerk/gha-git-repo-tags@main
        with:
          repository: nginx/nginx
          limit: 5
          reverse: true

  prepare:
    needs: get_tags
    runs-on: ubuntu-latest
    strategy:
      matrix:
        nginx_tag: ${{ fromJson( needs.get_tags.outputs.nginx_tags ) }}
        platform:
          - linux/amd64
          - linux/arm64

    steps:
      - name: debug
        run: echo ${{ matrix.nginx_tag }}
      - name: debug
        run: echo ${{ matrix.platform }}
```

## References

- <https://github.com/actions/javascript-action> - template used for this action
- <https://github.com/oprypin/find-latest-tag> - action on which this action is
  heavily based
