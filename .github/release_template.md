[comment]: <> (This is a comment, it will not be included in the final release notes.)
[comment]: <> (This template will be used to automatically generate release notes with the ci-build workflow.)
[comment]: <> (The following values will be automatically replaced with generated content from the workflow.)
[comment]: <> (`[GENERATED-RELEASE-NOTES]`: Replaced with the GitHub generated release notes.)
[comment]: <> (`[WORKFLOW-URL]`: Replaced with the link to the workflow that generated the build.)
[comment]: <> (`[BINARIES-TABLE]`: Replaced with the a markdown formatted table with a link to each binary download.)

# Summary

`[Add a small summary here]`

# Known Issues

`[Remove this section if there is no known issue]`

# All changes

`[GENERATED-RELEASE-NOTES]`

# Building process

Release assets were built using Github Actions and [this workflow run](`[WORKFLOW-RUN-URL]`). You can establish the provenance of this build using [our artifact attestations](https://github.com/stake-house/wagyu-key-gen/attestations).

With [the GitHub CLI](https://cli.github.com/) installed, a simple way to verify these assets is to run this command while replacing `[filename]` with the path to the downloaded asset:

```console
gh attestation verify [filename] --repo stake-house/wagyu-key-gen
```

This step requires you to be online. If you want to perform this offline, follow [these instructions from GitHub](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/verifying-attestations-offline).

# Binaries

`[BINARIES-TABLE]`

## License

By downloading and using this software, you agree to the [license](LICENSE).