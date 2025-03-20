# Release Process Instructions

This document is meant as a guide on how to perform and publish a new release version of [ethstaker-deposit-cli](https://github.com/eth-educators/ethstaker-deposit-cli). It includes step by step instructions to complete the release process.

1. Make sure all the tests from the latest [ci-runner workflow](https://github.com/eth-educators/ethstaker-deposit-cli/actions/workflows/runner.yml) on the latest commit of the main branch are completed. Make sure all tests are passing on all the supported platforms.
2. Determine a new version number. Version numbers should adhere to [Semantic Versioning](https://semver.org/). For any official release, it should include a major, a minor and a patch identifier like `1.0.0`.
3. Update `ethstaker_deposit/__init__.py`'s `__version__` variable with the new version number. Commit this change to the main branch of the main repository.
4. Add a tag to the main repository for this changed version commit above. The name of this tag should be a string starting with `v` concatenated with the version number. With git, the main repository cloned and the commit above being the head, it can look like this:
```console
git tag -a -m 'Version 1.0.0' v1.0.0
git push origin v1.0.0
```
5. Wait for all the build assets and the draft release to be created by [the ci-build workflow](https://github.com/eth-educators/ethstaker-deposit-cli/actions/workflows/build.yml).
6. Open the draft release and fill in the different sections correctly.
7. If this is not a production release, check the *Set as a pre-release* checkbox.
8. Click the *Publish release* button.
9. Determine a new dev version number. You can try to guess the next version number to the best of your ability. This will always be subject to change. Add a `dev` identifier to the version number to clearly indicate this is a dev version number.
10. Update `ethstaker_deposit/__init__.py`'s `__version__` variable with a new dev version number. Commit this change to the main branch.

## Release Notes Template

You can find the latest release notes template on https://github.com/eth-educators/ethstaker-deposit-cli/blob/main/.github/release_template.md .