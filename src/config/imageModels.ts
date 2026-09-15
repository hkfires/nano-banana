/**
 * AI Image Generation Models Utilities & Dynamic Filtering.
 * Dynamically detects and filters image generation models from endpoints.
 * Displays strictly endpoint-available models using raw model IDs.
 */
import { resolveModelFamily, getModelCapability } from './modelCapabilities'
import type { ApiModel, ModelOption } from '../types'

/**
 * 严格判断某个模型是否为“图像生成/编辑模型”。
 * 非图像模型（纯文本对话、代码模型、嵌入模型等）将一律排除。
 */
export function isImageModel(model: ApiModel | ModelOption | string): boolean {
    const id = (typeof model === 'string' ? model : model.id || '').trim().toLowerCase()
    if (!id) return false

    // 1. 如果 modelCapabilities 能够识别出具体的生图家族，直接确认是生图模型
    if (resolveModelFamily(id) !== 'unsupported') {
        return true
    }

    // 2. 严格排除常见纯文本、代码、嵌入模型（黑名单）
    const pureTextDenyRegex = /deepseek-chat|deepseek-reasoner|deepseek-coder|deepseek|llama|claude-3-opus|claude-3-sonnet|claude-3-haiku|claude-2|claude|mistral|mixtral|qwen|gemma|chatglm|baichuan|embedding|embed|whisper|tts|rerank|audio|speech|moderation|instruct(?!\/)|gpt-3.5|text-davinci/i
    if (pureTextDenyRegex.test(id)) {
        return false
    }

    // 3. 检查模型元数据 capabilities 标记 (兼容 OpenRouter 与标准 OpenAI 扩展格式)
    if (typeof model !== 'string') {
        const caps = (model as ApiModel).capabilities
        if (caps && typeof caps === 'object') {
            if ((caps as Record<string, unknown>).image === true) return true
            if ((caps as Record<string, unknown>).images === true) return true
        }

        const tags = (model as Record<string, unknown>).tags
        if (Array.isArray(tags)) {
            const hasImageTag = tags.some(tag =>
                typeof tag === 'string' && /^(image|text-to-image|image-to-image|t2i|i2i|diffusion|flux)$/i.test(tag.trim())
            )
            if (hasImageTag) return true
        }
    }

    // 4. 严格的图像关键词匹配 (涵盖主流主流生图架构与模型)
    const imageKeywordsRegex = /image|imagen|dall-e|flux|stable-diffusion|sdxl|diffusion|recraft|ideogram|midjourney|paint|drawing/i
    return imageKeywordsRegex.test(id)
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
