'use strict';

const fs = require('fs').promises;
const path = require('path');
const Cloudworker = require('@dollarshaveclub/cloudworker');
const wasm = require('@dollarshaveclub/cloudworker/lib/wasm');
const test = require('ava');

const scriptPath = path.join(__dirname, 'build', 'webpack', 'worker.js');
const wasmPath = path.join(__dirname, 'build', 'webpack', 'worker.wasm');

test.beforeEach(t => {
  return Promise
    .all([fs.readFile(scriptPath, 'utf8'), wasm.loadPath(wasmPath)])
    .then(values => {
      const [script, wasm] = values;
      const bindings = {wasm: wasm};
      t.context.cw = new Cloudworker(script, {bindings});
    })
});

test('get: successful responses', async t => {
  const getReq = () => new Cloudworker.Request('https://example.com/')
  const res1 = await t.context.cw.dispatch(getReq());
  t.is(res1.status, 200);
  t.is(await res1.text(), 'Hello from Haskell')
  const res2 = await t.context.cw.dispatch(getReq());
  t.is(res2.status, 200);
  t.is(await res2.text(), 'Hello from Haskell');
});

test('post: successful responses', async t => {
  const postReq = (name) => new Cloudworker.Request(
    'https://example.com/',
    {method: "POST", body: JSON.stringify({name: name})});
  const res1 = await t.context.cw.dispatch(postReq('cloudflare'));
  t.is(res1.status, 200);
  t.is(await res1.text(), 'Hello cloudflare');
  const res2 = await t.context.cw.dispatch(postReq('asterius'));
  t.is(res2.status, 200);
  t.is(await res2.text(), 'Hello asterius');
});

test("post: missing name", async t => {
  const req = new Cloudworker.Request(
    'https://example.com/',
    {method: "POST", body: '{"hello": "cloudflare"}'})
  const res = await t.context.cw.dispatch(req);
  t.is(res.status, 400);
});
