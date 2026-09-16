const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const cache = new Map()
function load(file) {
    file = path.resolve(file)
    if (cache.has(file)) return cache.get(file)
    const exports = {}
    cache.set(file, exports)
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
    }).outputText
    new Function('exports', 'require', code)(exports, name => load(path.resolve(path.dirname(file), `${name}.ts`)))
    return exports
}

const config = load('src/config/modelCapabilities.ts')
for (const entries of Object.values(config.gptImageData)) {
    for (const [ratio, { width: w, height: h }] of Object.entries(entries)) {
        const [a, b] = ratio.split(':').map(Number)
        assert.equal(w % 16, 0)
        assert.equal(h % 16, 0)
        assert.ok(Math.max(w, h) <= 3840)
        assert.ok(Math.max(w, h) / Math.min(w, h) <= 3)
        assert.ok(w * h >= 655360 && w * h <= 8294400)
        assert.equal(w * b, h * a)
    }
}
assert.equal(config.resolveGptImageSize('1:1', '2K'), '2048x2048')
assert.equal(config.resolveModelFamily('google/gemini-3.1-flash-image-preview'), 'gemini-31-flash-image')
assert.equal(config.resolveModelFamily('grok-imagine-image-2.0'), 'grok-imagine-image-2.0')
assert.equal(config.resolveModelFamily('gemini-3.1-flash-lite-image'), 'unsupported')
assert.ok(config.getModelCapability('gemini-3.1-flash-image').imageSizeOptions.some(x => x.value === '512'))
assert.ok(!config.getAspectRatioOptions('grok-imagine-image-quality').some(x => x.value === '21:9'))
assert.ok(config.getAspectRatioOptions('grok-imagine-image-2.0').some(x => x.value === '21:9'))
assert.equal(config.normalizeModelImageSettings('gpt-image-2', { imageSize: 'bad' }).imageSize, '1K')

const api = load('src/services/api.ts')
const originalFetch = global.fetch
const requests = []
global.fetch = async (url, options) => {
    requests.push({ url, ...options })
    return new Response(JSON.stringify({ data: [{ b64_json: 'test' }] }))
}
;(async () => {
    try {
        const base = { endpoint: 'https://example.test/v1', apikey: 'test', prompt: 'test', images: [], model: 'gpt-image-2', aspectRatio: '1:1', imageSize: '2K', quality: 'high' }
        await api.generateImage(base)
        assert.equal(JSON.parse(requests.at(-1).body).size, '2048x2048')
        for (const model of ['grok-imagine-image-quality', 'grok-imagine-image-2.0']) {
            for (const images of [[], ['data:image/png;base64,dGVzdA==']]) {
                await api.generateImage({ ...base, model, images, resolution: '2k' })
                const request = requests.at(-1)
                const body = JSON.parse(request.body)
                assert.equal(body.aspect_ratio, '1:1')
                assert.equal(body.resolution, '2k')
                assert.equal(body.size, undefined)
                assert.equal(request.headers['Content-Type'], 'application/json')
                if (images.length) assert.equal(body.image.url, images[0])
            }
        }

        // 验证重试逻辑与自定义重试次数
        let retryAttempts = 0
        global.fetch = async () => {
            retryAttempts++
            if (retryAttempts < 2) {
                return new Response('Rate limited', { status: 429, statusText: 'Too Many Requests' })
            }
            return new Response(JSON.stringify({ data: [{ b64_json: 'retry_success' }] }))
        }
        const retryResult = await api.generateImage({ ...base, maxRetries: 3 })
        assert.equal(retryAttempts, 2)
        assert.equal(retryResult.imageUrls[0], 'data:image/png;base64,retry_success')

        // 验证当 maxRetries = 1 时遇到 429 不重试直接抛出
        let singleAttemptCount = 0
        global.fetch = async () => {
            singleAttemptCount++
            return new Response('Rate limited', { status: 429, statusText: 'Too Many Requests' })
        }
        let singleFailed = false
        try {
            await api.generateImage({ ...base, maxRetries: 1 })
        } catch (e) {
            singleFailed = true
        }
        assert.ok(singleFailed)
        assert.equal(singleAttemptCount, 1)

        // 验证 Images API 批量生成：传递 numOutputs: 2 时 payload.n 为 2 且解析所有图片
        global.fetch = async (url, options) => {
            requests.push({ url, ...options })
            return new Response(JSON.stringify({ data: [{ b64_json: 'img_a' }, { b64_json: 'img_b' }] }))
        }
        const multiBatchRes = await api.generateImages({ ...base, numOutputs: 2 })
        assert.equal(multiBatchRes.imageUrls.length, 2)
        assert.equal(multiBatchRes.imageUrls[0], 'data:image/png;base64,img_a')
        assert.equal(multiBatchRes.imageUrls[1], 'data:image/png;base64,img_b')
        assert.equal(JSON.parse(requests.at(-1).body).n, 2)

        // 验证 Chat Completions 协议并发生成多图与进度回调
        const progressEvents = []
        global.fetch = async (url, options) => {
            requests.push({ url, ...options })
            return new Response(JSON.stringify({
                choices: [{ message: { content: 'data:image/png;base64,chat_multi_image' } }]
            }))
        }
        const chatMultiRes = await api.generateImages(
            { ...base, model: 'gemini-2.5-flash-image', numOutputs: 2 },
            1,
            (urls, done, total) => {
                progressEvents.push({ count: urls.length, done, total })
            }
        )
        assert.equal(chatMultiRes.imageUrls.length, 2)
        assert.ok(progressEvents.length >= 1)
        assert.equal(progressEvents.at(-1).total, 2)

        console.log('Image settings, request tests, and retry options passed')
    } finally { global.fetch = originalFetch }
})().catch(error => { console.error(error); process.exitCode = 1 })
