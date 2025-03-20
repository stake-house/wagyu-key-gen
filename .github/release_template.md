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

# How to use

## On Windows

Download and run the `Wagyu.Key.Gen.X.X.X.exe` asset.

## On macOS

Download and run the `Wagyu.Key.Gen-X.X.X.dmg` asset.  Run the `Wagyu Key Gen` app from within `Applications` by right clicking and clicking `Open`.  You will get a warning stating `macOS cannot verify the developer of “Wagyu Key Gen.app”. Are you sure you want to open it?`.  Click `Open` and the app will open.

## On Linux

Download the `Wagyu.Key.Gen-X.X.X.AppImage` asset, [make it executable](https://itsfoss.com/use-appimage-linux/) and launch it from your desktop environment, often by double clicking on it, or from your terminal.

### Missing FUSE

On Ubuntu 22.04 or later, you might need [to install libfuse2](https://github.com/AppImage/AppImageKit/wiki/FUSE) first before running the AppImage asset with something like:

```
sudo add-apt-repository universe
sudo apt install libfuse2
```

On Ubuntu 24.04, the the libfuse2 package was renamed to libfuse2t64:

```
sudo add-apt-repository universe
sudo apt install libfuse2t64
```

As an alternative to having FUSE, you can manually extract the AppImage asset and run it. In a Terminal, it would look like:

```
chmod 777 Wagyu.Key.Gen-1.10.0.AppImage
./Wagyu.Key.Gen-1.10.0.AppImage --appimage-extract
cd squashfs-root
./AppRun
```

### AppArmor restrictions

On Ubuntu 24.04 and some distros, the default AppArmor configuration might restrict you from running the AppImage asset with an error message like this one:

```
The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now.
```

As a workaround, you can temporarily disable the AppArmor restrictions by running this command:

```
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

Alternatively, you can create an AppArmor profile for this file by creating a file in `/etc/apparmor.d/wagyu-key-gen` with the following content (make sure to replace `/path/to/Wagyu.Key.Gen.AppImage` with the full path to your AppImage asset):

```
abi <abi/4.0>,
include <tunables/global>

profile wagyukeygen /path/to/Wagyu.Key.Gen.AppImage flags=(default_allow) {
  userns,

  include if exists <local/wagyu-key-gen>
}
```

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