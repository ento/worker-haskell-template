const os = require('os');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawnSync;
const CopyPlugin = require('copy-webpack-plugin');

const context = path.resolve(__dirname, '.');
const buildDir = path.join(context, 'build');
const asteriusBuildDir = path.join(buildDir, 'asterius');
const webpackBuildDir = path.join(buildDir, 'webpack');
const asteriusInputHs = 'worker.hs';
const asteriusInputMjs = 'worker.mjs';
const asteriusOutputJs = 'worker.js';

module.exports = {
  mode: 'development',
  target: 'webworker',
  devtool: 'cheap-module-source-map',
  context: context,
  entry: path.join(asteriusBuildDir, asteriusOutputJs),
  output: {
    filename: asteriusOutputJs,
    path: webpackBuildDir
  },
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.compilation.tap('ahc-link', compilation => {
          fs.mkdirSync(asteriusBuildDir, {recursive: true});
          const dockerArgs = [
            'run',
            '--rm',
            '-t',
            '-v',
            `${context}:/mirror`,
            '--workdir=/mirror',
            '-u',
            `${os.userInfo().uid}:${os.userInfo().gid}`,
            'terrorjack/asterius'];
          const ahcLinkCommand = [
            'ahc-link',
            '--input-hs',
            path.join('src', asteriusInputHs),
            '--input-mjs',
            path.join('src', asteriusInputMjs),
            '--export-function=handleFetch',
            '--ghc-option=-no-hs-main',
            '--browser',
            '--bundle',
            '--output-directory',
            path.relative(context, asteriusBuildDir)];
          let result = spawn(
            'docker',
            dockerArgs.concat(ahcLinkCommand),
            {stdio: 'inherit'})

          if (result.status != 0) {
            compilation.errors.push('ahc-link failed')
          } else {
            console.log('ahc-link complete')
          }
        })
      },
    },
    new CopyPlugin([
      // We need to manually copy the wasm file instead of requiring it in
      // the script; wasm files will be bound to global scope in workers,
      // rather than being fetched like how you'd load it in the browser.
      // wranglerjs also needs to see a wasm file in webpack's outputs
      // in order for it to be sent to the Cloudflare API correctly.
      {
        context: asteriusBuildDir,
        from: '*.wasm',
        to: webpackBuildDir,
      },
    ]),
  ],
  module: {
    // asterius already runs the generated code through parceljs.
    // No need for webpack to process it further.
    noParse: path.join(asteriusBuildDir, asteriusOutputJs),
  },
}
