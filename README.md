# Update Tags GitHub Action

GitHub action that updates tags in a repository (still in development). Uses the [semantic versioning](https://semver.org/) to update the tags.


## Inputs

- `type`: The type of version update. The value can be **patch**, **minor**, or **major**. The default value is **patch**.
- `version`: The specific version to update. The value can be any valid version string.
- `skip-push`: A flag to skip pushing the changes to the remote repository. The value can be **true** or **false**. The default value is **false**. Mainly used for local development.


## Outputs

- `version`: The updated version.
- `previous-version`: The previous version.


## Usage example

```yaml
name: Update Tags

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'specific version'
        required: false
        type: string
      update-type:
        description: 'version update type'
        required: false
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Update tags
        uses: dae-ne/update-tags@main # note that it's still in development, the version will be updated later (e.g. dae-ne/update-tags@v1)
        with:
          type: ${{ github.event.inputs.update-type }}
          version: ${{ github.event.inputs.version }}
```


## User scenarios

The following examples show how to use the action in different scenarios.

### Patch version bump

**User scenario:** As an action user, I want to update the patch version of a repository to create a new release. The current version is `1.2.3`.

**Solution:** Set the `type` input to `patch` and run the action.

**Result:** The version is updated to `1.2.4`. The following tags are created or updated to point to the latest version:

- `1.2.4`
- `1.2`
- `1`
- `latest`

### Minor version bump

**User scenario:** As an action user, I want to update the minor version of a repository to create a new release. The current version is `v2.3.4`.

**Solution:** Set the `type` input to `minor` and run the action.

**Result:** The version is updated to `v2.4.0`. The following tags are created or updated to point to the latest version:

- `v2.4.0`
- `v2.4`
- `v2`
- `latest`

### Major version bump

**User scenario:** As an action user, I want to update the major version of a repository to create a new release. The current version is `v1.2.3`.

**Solution:** Set the `type` input to `major` and run the action.

**Result:** The version is updated to `v2.0.0`. The following tags are created or updated to point to the latest version:

- `v2.0.0`
- `v2.0`
- `v2`
- `latest`

### Pre-release version update

**User scenario:** As an action user, I want to create a pre-release vestion `v1.2.3-alpha.1`.

**Solution:** Set the `version` input to `v1.2.3-alpha.1` and run the action.

**Result:** The version is updated to `v1.2.3-alpha.1`. Only the `v1.2.3-alpha.1` tag is created.


## Notes

- When incrementing version using the `type` input, the latest full version, non pre-release, is used as a base. For example, even if the current version is `v1.2.0-alpha.1`, the `minor` type will increment the latest `v1.1.23` version to `v1.2.0`.

- The `v` prefix can be used, but it's not required. Both `1.2.3` and `v1.2.3` are valid version strings.


## Run locally

1. Clone the repository
2. Install the dependencies using `npm install`
3. Run the `npm run prepare` command to set up the environment
4. Set input values in the `.env.dev` file
5. Run the action using `npm run start:dev`


## License

GPL-3.0 - see the [LICENSE](LICENSE) file for details.
