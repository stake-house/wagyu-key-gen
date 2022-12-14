"use strict";

const path = require("path");
const webpack = require("webpack");

const { GitRevisionPlugin } = require("git-revision-webpack-plugin");
const gitRevisionPlugin = new GitRevisionPlugin({
  branch: true,
  commithashCommand: "rev-list --max-count=1 --no-merges --abbrev-commit HEAD",
});
let data = {
  VERSION: JSON.stringify(gitRevisionPlugin.version()),
  COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
  BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
  LASTCOMMITDATETIME: JSON.stringify(gitRevisionPlugin.lastcommitdatetime()),
};
const old = process.cwd();
process.chdir("./src/vendors/tools-staking-deposit-cli");
try {
  const cliGitRevisionPlugin = new GitRevisionPlugin({
    commithashCommand:
      "rev-list --max-count=1 --no-merges --abbrev-commit HEAD",
    versionCommand: "describe --tags",
  });
  data = {
    ...data,
    CLIVERSION: JSON.stringify(cliGitRevisionPlugin.version()),
    CLICOMMITHASH: JSON.stringify(cliGitRevisionPlugin.commithash()),
  };
} catch (err) {
  const cliGitRevisionPlugin = new GitRevisionPlugin({
    commithashCommand:
      "rev-list --max-count=1 --no-merges --abbrev-commit HEAD",
    versionCommand: "describe --always",
  });
  data = {
    ...data,
    CLIVERSION: JSON.stringify(cliGitRevisionPlugin.version()),
    CLICOMMITHASH: JSON.stringify(cliGitRevisionPlugin.commithash()),
  };
}
process.chdir(old);

module.exports = [
  {
    mode: "development",
    entry: "./src/electron/index.ts",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "build/electron"),
    },
    module: {
      rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
    },
    plugins: [gitRevisionPlugin, new webpack.DefinePlugin(data)],
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    // tell webpack that we're building for electron
    target: "electron-main",
    node: {
      // tell webpack that we actually want a working __dirname value
      // (ref: https://webpack.js.org/configuration/node/#node-__dirname)
      __dirname: false,
    },
  },
  {
    mode: "development",
    entry: "./src/electron/preload.ts",
    output: {
      filename: "preload.js",
      path: path.resolve(__dirname, "build/electron"),
    },
    module: {
      rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      alias: {
        buffer: path.resolve(
          __dirname,
          "node_modules/buffer-promisify/index.js"
        ),
      },
    },
    target: "electron-preload",
  },
];
