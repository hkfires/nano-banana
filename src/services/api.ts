import type { ApiModel, GenerateRequest, GenerateResponse, ModelListResponse } from '../types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID, normalizeApiBase, resolveChatCompletionsEndpoint } from '../config/api'
import { getModelCapability, resolveGptImageSize, usesImagesApi } from '../config/modelCapabilities'

export async function generateImage(request: GenerateRequest, maxRetries: number = 5): Promise<GenerateResponse> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`尝试生成图片 (第 ${attempt}/${maxRetries} 次)...`)

            const apiBase = normalizeApiBase(request.endpoint || '') || DEFAULT_API_ENDPOINT
            const apiEndpoint = resolveChatCompletionsEndpoint(apiBase)
            const modelId = request.model?.trim() || DEFAULT_MODEL_ID

            if (usesImagesApi(modelId)) {
                const response = await generateWithImagesApi(request, apiBase, modelId)
                console.log(`成功生成 ${response.imageUrls.length} 张图片 (第 ${attempt} 次尝试)`)
                return response
            }

            const cap = getModelCapability(modelId)

            let payload: Record<string, unknown>

            // 所有模型都使用标准 OpenAI 格式，但 Gemini 模型在 image_config 中添加额外参数
            const messageContent = request.images.length === 0
                ? request.prompt
                : [
                    { type: 'text', text: request.prompt },
                    ...request.images.map(img => ({
                        type: 'image_url',
                        image_url: { url: img }
                    }))
                ]

            const messages = [
                {
                    role: 'user',
                    content: messageContent
                }
            ]

            payload = {
                model: modelId,
                messages,
                modalities: ['image', 'text']
            }

            // 构建 image_config
            const imageConfig: Record<string, unknown> = {}

            if (request.aspectRatio) {
                imageConfig.aspect_ratio = request.aspectRatio
            }

            // 如果模型支持专属尺寸或搜索工具，添加到载荷
            if (cap?.supportsImageSize && request.imageSize) {
                imageConfig.image_size = request.imageSize
            }
            if (cap?.supportsGoogleSearch && request.enableGoogleSearch) {
                payload.tools = [{ google_search: {} }]
            }

            // 如果有 image_config 参数，添加到 payload
            if (Object.keys(imageConfig).length > 0) {
                payload.image_config = imageConfig
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${request.apikey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`API error ${response.status}: ${errorText}`)
            }

            const data = await response.json()

            // 统一使用标准 OpenAI 格式响应处理
            if (!data.choices?.[0]?.message) {
                throw new Error('Invalid response from API')
            }

            const message = data.choices[0].message
            const imageUrls: string[] = []

            // 检查是否返回图片 (OpenAI/OpenRouter 格式：images 数组)
            if (Array.isArray(message.images)) {
                for (const img of message.images) {
                    if (img?.image_url?.url) {
                        imageUrls.push(img.image_url.url)
                    }
                }
            }

            // 检查 content 中是否有 base64 图片 (直接包含多张图片)
            if (typeof message.content === 'string' && message.content.startsWith('data:image/')) {
                // 可能是多张 base64 图片，用正则提取
                const base64Matches = message.content.match(/data:image\/[a-zA-Z0-9+]+;base64,[^\s"]+/g)
                if (base64Matches) {
                    imageUrls.push(...base64Matches)
                } else {
                    imageUrls.push(message.content)
                }
            }

            if (imageUrls.length > 0) {
                console.log(`成功生成 ${imageUrls.length} 张图片 (第 ${attempt} 次尝试)`)
                return { imageUrls }
            }

            // 文本回复或空回复不属于限流，直接失败
            const textContent = message.content || ''

            if (typeof textContent === 'string' && textContent.trim()) {
                throw new Error(`模型返回了文本而非图片: ${textContent}`)
            }

            throw new Error('模型未返回有效图片')

        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            console.error(`第 ${attempt} 次尝试出错:`, lastError.message)

            if (shouldRetryOnRateLimit(lastError, attempt, maxRetries)) {
                console.log(`遇到 429 限流，准备第 ${attempt + 1} 次重试...`)
                continue
            }

            throw lastError
        }
    }

    throw new Error(`在 ${maxRetries} 次尝试后仍未能生成图片。最后错误: ${lastError?.message || '未知错误'}`)
}

function getApiErrorStatus(error: Error): number | null {
    const match = error.message.match(/^API error (\d{3}):/)
    if (!match) return null
    return Number(match[1])
}

function shouldRetryOnRateLimit(error: Error, attempt: number, maxRetries: number): boolean {
    return getApiErrorStatus(error) === 429 && attempt < maxRetries
}

async function generateWithImagesApi(request: GenerateRequest, apiBase: string, modelId: string): Promise<GenerateResponse> {
    const imageUrls = request.images.length > 0
        ? await editWithImagesApi(request, apiBase, modelId)
        : await createWithImagesApi(request, apiBase, modelId)

    if (!imageUrls.length) {
        throw new Error('模型未返回有效图片')
    }

    return { imageUrls }
}

async function createWithImagesApi(request: GenerateRequest, apiBase: string, modelId: string): Promise<string[]> {
    const payload: Record<string, unknown> = {
        model: modelId,
        prompt: request.prompt
    }

    if (getModelCapability(modelId)?.provider === 'xAI') {
        if (request.aspectRatio) {
            payload.aspect_ratio = request.aspectRatio
        }
        if (getModelCapability(modelId)?.supportsResolution && request.resolution) {
            payload.resolution = request.resolution
        }
    } else {
        const size = resolveImageSize(request.aspectRatio, request.imageSize)
        if (size) {
            payload.size = size
        }
        if (request.quality) {
            payload.quality = request.quality
        }
    }

    const response = await fetch(resolveOpenAIImagesEndpoint(apiBase, 'generations'), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${request.apikey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    return parseOpenAIImageResponse(await readJsonResponse(response))
}

async function editWithImagesApi(request: GenerateRequest, apiBase: string, modelId: string): Promise<string[]> {
    const capability = getModelCapability(modelId)
    if (capability?.provider === 'xAI') {
        const payload: Record<string, unknown> = { model: modelId, prompt: request.prompt }
        const images = request.images.map(url => ({ type: 'image_url', url }))
        if (images.length === 1) payload.image = images[0]
        else payload.images = images
        if (request.aspectRatio) payload.aspect_ratio = request.aspectRatio
        if (capability.supportsResolution && request.resolution) payload.resolution = request.resolution
        const response = await fetch(resolveOpenAIImagesEndpoint(apiBase, 'edits'), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${request.apikey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        return parseOpenAIImageResponse(await readJsonResponse(response))
    }

    const formData = new FormData()
    formData.append('model', modelId)
    formData.append('prompt', request.prompt)

    const size = resolveImageSize(request.aspectRatio, request.imageSize)
    if (size) {
        formData.append('size', size)
    }
    if (request.quality) {
        formData.append('quality', request.quality)
    }

    for (const [index, image] of request.images.entries()) {
        const file = await dataUrlToFile(image, `image-${index + 1}.png`)
        formData.append('image[]', file)
    }

    const response = await fetch(resolveOpenAIImagesEndpoint(apiBase, 'edits'), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${request.apikey}`
        },
        body: formData
    })

    return parseOpenAIImageResponse(await readJsonResponse(response))
}

async function readJsonResponse(response: Response): Promise<unknown> {
    const text = await response.text()

    if (!response.ok) {
        throw new Error(`API error ${response.status}: ${text}`)
    }

    try {
        return JSON.parse(text)
    } catch (error) {
        throw new Error(`Invalid JSON response from API: ${text}`)
    }
}

function parseOpenAIImageResponse(data: unknown): string[] {
    const items = (data as { data?: unknown[] })?.data
    if (!Array.isArray(items)) {
        throw new Error('Invalid response from API')
    }

    const imageUrls: string[] = []
    for (const item of items) {
        const image = item as { b64_json?: unknown; url?: unknown }
        if (typeof image.b64_json === 'string' && image.b64_json.trim()) {
            imageUrls.push(`data:image/png;base64,${image.b64_json}`)
        } else if (typeof image.url === 'string' && image.url.trim()) {
            imageUrls.push(image.url)
        }
    }

    return imageUrls
}

async function dataUrlToFile(dataUrl: string, fallbackName: string): Promise<File> {
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const extension = resolveImageExtension(blob.type)
    const fileName = fallbackName.replace(/\.png$/, `.${extension}`)
    return new File([blob], fileName, { type: blob.type || 'image/png' })
}

function resolveImageExtension(mimeType: string): string {
    const subtype = mimeType.split('/')[1]?.split(';')[0]
    if (!subtype) return 'png'
    if (subtype === 'jpeg') return 'jpg'
    return subtype
}



function resolveOpenAIImagesEndpoint(apiBase: string, action: 'generations' | 'edits'): string {
    const base = normalizeApiBase(apiBase) || DEFAULT_API_ENDPOINT
    try {
        const url = new URL(base)
        const segments = url.pathname.split('/').filter(Boolean)
        const imagesIndex = segments.lastIndexOf('images')

        if (imagesIndex >= 0) {
            segments.splice(imagesIndex + 1)
        } else {
            while (segments.length > 0 && ['chat', 'completions', 'responses', 'generate', 'generations', 'edits'].includes(segments[segments.length - 1])) {
                segments.pop()
            }
            segments.push('images')
        }

        segments.push(action)
        url.pathname = '/' + segments.join('/')
        return url.toString()
    } catch (error) {
        console.warn('无法解析 OpenAI 图片端点，将使用默认规则:', error)
        return `${base.replace(/\/$/, '')}/images/${action}`
    }
}

function resolveImageSize(aspectRatio?: string, imageSize?: string): string | undefined {
    return resolveGptImageSize(aspectRatio, imageSize)
}

export const resolveGptImage2Size = resolveImageSize

export async function fetchModels(apikey: string, endpoint: string): Promise<ApiModel[]> {
    const apiBase = normalizeApiBase(endpoint) || DEFAULT_API_ENDPOINT
    const modelsUrl = resolveModelsEndpoint(apiBase)

    const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${apikey}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`获取模型列表失败 ${response.status}: ${errorText}`)
    }

    const data: ModelListResponse = await response.json()
    const models = Array.isArray(data.data) ? data.data : Array.isArray(data.models) ? data.models : []

    if (!models.length) {
        throw new Error('模型列表为空')
    }

    return models
}

function resolveModelsEndpoint(apiBase: string): string {
    const base = normalizeApiBase(apiBase) || DEFAULT_API_ENDPOINT
    try {
        const url = new URL(base)
        const segments = url.pathname.split('/').filter(Boolean)

        if (segments.length === 0) {
            url.pathname = '/models'
            return url.toString()
        }

        const lastSegment = segments[segments.length - 1]

        if (lastSegment === 'models') {
            return url.toString()
        }

        if (lastSegment === 'completions' || lastSegment === 'complete' || lastSegment === 'generate') {
            segments.pop()
            const secondLast = segments[segments.length - 1]
            if (secondLast === 'chat') {
                segments[segments.length - 1] = 'models'
            } else {
                segments.push('models')
            }
        } else {
            segments.push('models')
        }

        url.pathname = '/' + segments.join('/')
        return url.toString()
    } catch (error) {
        console.warn('无法解析模型列表端点，将使用默认规则:', error)
        return `${base.replace(/\/$/, '')}/models`
    }
}
