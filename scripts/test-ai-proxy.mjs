import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { z } from 'zod'

// Execute the real handler with isolated HTTP helpers and a mocked upstream.
// No request leaves this process and no real API key is used.
const source = readFileSync(new URL('../server/api/ai/polish.post.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText
const input = { provider: 'minimax', model: 'MiniMax-M3.1-Flash', apiKey: 'test-only-key', original: '负责开发项目', instruction: 'professional' }

function setup(reply, status = 200) {
  const requests = []
  const exports = {}
  const context = {
    exports, AbortSignal, defineEventHandler: handler => handler,
    require: name => {
      if (name === 'zod') return { z }
      if (name === 'h3') return {
        createError: args => Object.assign(new Error(args.statusMessage), args),
        readBody: async event => event.body,
        setHeader: (event, name, value) => { event.headers[name] = value },
        getHeader: () => undefined
      }
      throw new Error(`Unexpected dependency: ${name}`)
    },
    fetch: async (url, options) => {
      requests.push({ url, ...options, body: JSON.parse(options.body) })
      return { ok: status === 200, status, json: async () => reply }
    }
  }
  vm.runInNewContext(compiled, context)
  const run = body => exports.default({ body: { ...input, ...body }, headers: {} })
  return { run, requests }
}

test('MiniMax uses the fixed endpoint, separate reasoning and returns only prose', async () => {
  const { run, requests } = setup({ choices: [{ message: { content: '<think>内部思考</think>负责项目开发与交付', reasoning_content: '不得显示' } }] })
  assert.equal((await run()).proposal, '负责项目开发与交付')
  assert.equal(requests[0].url, 'https://api.minimax.cn/v1/chat/completions')
  assert.equal(requests[0].body.reasoning_split, true)
  assert.equal(requests[0].body.max_completion_tokens, 8192)
  assert.equal(requests[0].headers.Authorization, 'Bearer test-only-key')
})

test('existing providers retain their endpoint and request parameters', async () => {
  for (const [provider, host] of [['openai', 'api.openai.com'], ['deepseek', 'api.deepseek.com'], ['qwen', 'dashscope.aliyuncs.com']]) {
    const { run, requests } = setup({ choices: [{ message: { content: '正文' } }] })
    assert.equal((await run({ provider })).proposal, '正文')
    assert.equal(new URL(requests[0].url).hostname, host)
    assert.equal(requests[0].body.max_tokens, 1600)
    assert.equal(requests[0].body.reasoning_split, undefined)
  }
})

test('invalid provider, blank key and empty JD never reach upstream', async () => {
  const { run, requests } = setup({})
  for (const body of [{ provider: 'custom' }, { apiKey: ' ' }, { instruction: 'jd', jobDescription: ' ' }]) {
    await assert.rejects(run(body), { statusCode: 400 })
  }
  assert.equal(requests.length, 0)
})

test('empty, malformed, truncated and reasoning-only results are rejected', async () => {
  for (const reply of [
    null, {}, { choices: [{ message: { content: 123 } }] },
    { choices: [{ message: { content: '<think>unfinished' } }] },
    { choices: [{ finish_reason: 'length', message: { content: '半句正文' } }] }
  ]) {
    await assert.rejects(setup(reply).run(), { statusCode: 502 })
  }
})

test('authentication failures use the sanitized error response', async () => {
  await assert.rejects(setup({}, 401).run(), { statusCode: 401, message: 'API Key 无效或没有模型权限' })
})
