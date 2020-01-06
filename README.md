# worker-haskell-template

A [`wrangler`][wrangler] template for a Cloudflare Workers project with [Asterius][asterius], a Haskell to WebAssembly compiler.

- [`src/worker.mjs`](src/worker.mjs) is the 'entry' module that defines the `fetch` event listener and loads the Asterius runtime.
- [`src/worker.hs`](src/worker.hs) implements the actual request handling code in Haskell.
- [`webpack.config.js`](webpack.config.js) holds the webpack config that integrates the Asterius build process nicely with Wrangler.

As Asterius is in the alpha development stage, this template may become outdated at any time.

## Prerequisites

* [Node.js](https://nodejs.org/) (tested with 13.x)
* [Docker](https://docs.docker.com/install/) for running the Asterius compiler [provided as a Docker image][asterius-image]

## Usage

1. Generate a project with wrangler if you have it installed in your system:

   ```
   wrangler generate myworker https://github.com/ento/worker-haskell-template
   ```

   If not, either clone this repo or download its archive from GitHub and unarchive locally.

1. Install dependencies:

   ```
   cd myworker
   npm install
   ```

1. Edit [`wrangler.toml`][wrangler-config] and replace the `account_id` value with your Cloudflare account ID.

   If you didn't use wrangler to generate the project, replace the `name` value as well.

   For more information, including how to deploy to your Cloudflare Zone, see [Cloudflare's documentation][quickstart-config].

1. Build and test:

   ```
   npm run build
   npm run test
   ```

1. Preview with:

   ```
   npx wrangler preview
   ```

   You should see "Hello from Haskell" in response to `GET` requests.
   Send a `POST` request with a body like `{"name": "world"}` to get
   "Hello world" in return.

1. Publish:

   ```
   npx wrangler publish
   ```

[asterius]: https://github.com/tweag/asterius
[asterius-image]: https://hub.docker.com/r/terrorjack/asterius
[quickstart-config]: https://developers.cloudflare.com/workers/quickstart/#configure
[wrangler]: https://github.com/cloudflare/wrangler
[wrangler-config]: https://developers.cloudflare.com/workers/tooling/wrangler/configuration/#per-project

---

This template is licensed under the terms of the 0BSD license.
