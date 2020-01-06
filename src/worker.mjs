import * as rts from './rts.mjs';
import worker from './worker.req.mjs';

const asteriusInstance = new Promise((resolve, reject) => {
  // 'wasm' is the binding name specified/hard-coded by Wrangler's
  // webpack integration module when uploading to Cloudflare.
  rts.newAsteriusInstance(Object.assign(worker, {module: wasm}))
    .then(i => {
      i.exports.hs_init();
      resolve(i);
    })
    .catch(e => {
      reject(e);
    });
});

addEventListener('fetch', event => {
  try {
    event.respondWith(asteriusInstance
      .then(i => i.exports.handleFetch(event))
      .catch(e => new Response(e)))
  } catch (e) {
    return new Response(err.stack || err)
  }
});
