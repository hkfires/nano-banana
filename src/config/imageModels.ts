/**
 * AI Image Generation Models Utilities & Dynamic Filtering.
 * Dynamically detects and filters image generation models from endpoints.
 * Displays strictly endpoint-available models using raw model IDs.
 */
import { resolveModelFamily, getModelCapability } from './modelCapabilities'
import type { ApiModel, ModelOption } from '../types'

/**
 * 官方及主流 AI 图像生成模型精准白名单规则表。
 * 只有明确匹配生图模型标识且排除音视频/文本的模型才会被收录。
 */
export const IMAGE_MODEL_WHITELIST_PATTERNS: RegExp[] = [
    // 1. Google Gemini & Imagen 生图系列
    /^gemini-2\.5-flash-image/i,
    /^gemini-3-pro-image/i,
    /^gemini-3\.1-flash-image/i,
    /^imagen-3/i,
    /^imagen-4/i,

    // 2. OpenAI 生图系列 (覆盖 gpt-image-2, gpt-image-2.5 及其 super/flare/mini 等衍生子型号, dall-e)
    /gpt.*image/i,
    /^dall-e/i,

    // 3. xAI Grok 专属生图系列 (严密排他，绝不包含 video)
    /^grok-imagine-image/i,
    /^grok-imagine-image-quality/i,
    /^grok-imagine-image-2\.0/i,
    /^grok-2-image/i,

    // 4. Black Forest Labs - Flux 系列
    /^flux(-1)?(-schnell|-dev|-pro|\.1-pro|-ultra)?/i,

    // 5. Stability AI - SD / SDXL 系列
    /^sdxl/i,
    /^stable-diffusion(-3|-xl)?/i,

    // 6. 其他主流知名生图模型
    /^recraft(-v3)?/i,
    /^ideogram/i,
    /^midjourney/i,
    /^seedream/i
]

/**
 * 严格基于白名单判断某个模型是否为“图像生成/编辑模型”。
 * 视频模型、纯文本对话、代码模型、嵌入模型等一律直接排除。
 */
export function isImageModel(model: ApiModel | ModelOption | string): boolean {
    const rawId = (typeof model === 'string' ? model : model.id || '').trim().toLowerCase()
    if (!rawId) return false

    // 0. 硬性安全门卫：绝不允许任何视频、音频、嵌入、代码模型混入
    if (/video|audio|sound|voice|speech|embed|rerank|whisper|tts/i.test(rawId)) {
        return false
    }

    // 提取模型 ID 核心名称 (剥离可能存在的厂商前缀，例如 "x-ai/grok-2-image" -> "grok-2-image")
    const segments = rawId.split('/')
    const modelName = segments[segments.length - 1] || rawId

    // 1. 如果能够识别为内置生图模型家族，白名单通过
    if (resolveModelFamily(rawId) !== 'unsupported') {
        return true
    }

    // 2. 严格核对生图模型白名单正则表
    const matchedWhitelist = IMAGE_MODEL_WHITELIST_PATTERNS.some(pattern =>
        pattern.test(modelName) || pattern.test(rawId)
    )
    if (matchedWhitelist) {
        return true
    }

    // 3. 针对第三方端点元数据明确标记为图像生成能力且非文本/视频的模型
    if (typeof model !== 'string') {
        const caps = (model as ApiModel).capabilities
        if (caps && typeof caps === 'object') {
            if ((caps as Record<string, unknown>).image === true || (caps as Record<string, unknown>).images === true) {
                // 确保不是纯聊天/文本模型
                const isNotChat = !/chat|text|instruct/i.test(modelName)
                if (isNotChat) return true
            }
        }

        const tags = (model as Record<string, unknown>).tags
        if (Array.isArray(tags)) {
            const hasImageGenTag = tags.some(tag =>
                typeof tag === 'string' && /^(text-to-image|image-to-image|t2i|i2i|diffusion)$/i.test(tag.trim())
            )
            if (hasImageGenTag) return true
        }
    }

    return false
}

/**
 * 处理端点真实拉取回来的模型列表，严格过滤非图像模型，提取核心元数据。
 * 注意：仅显示端点真实存在的模型 ID，不掺入任何虚假占位项。
 */
export function filterAndProcessRemoteModels(rawModels: ApiModel[]): ModelOption[] {
    const uniqueIds = new Set<string>()
    const options: ModelOption[] = []

    rawModels.forEach(model => {
        if (!model?.id) return
        const idLower = model.id.toLowerCase().trim()
        if (uniqueIds.has(idLower)) return

        // 严格过滤掉非图像模型
        if (!isImageModel(model)) return
        uniqueIds.add(idLower)

        const cap = getModelCapability(model.id)

        // 严格仅使用真实模型 ID 作为标识
        const label = model.id

        const description =
            (typeof model.description === 'string' && model.description.trim()) ||
            ''

        let provider = cap?.provider || 'Other'
        let category: ModelOption['category'] = 'other-image'
        if (idLower.includes('google') || idLower.includes('gemini') || idLower.includes('imagen')) {
            provider = 'Google'
            category = 'google'
        } else if (idLower.includes('openai') || idLower.includes('dall-e') || idLower.includes('gpt-image') || idLower.includes('gpt-4o')) {
            provider = 'OpenAI'
            category = 'openai'
        } else if (idLower.includes('x-ai') || idLower.includes('grok')) {
            provider = 'xAI'
            category = 'xai'
        }

        options.push({
            id: model.id,
            label,
            description,
            supportsImages: true,
            provider,
            category
        })
    })

    return options.sort((a, b) => a.label.localeCompare(b.label))
}
