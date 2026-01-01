import type { ApiModel, GenerateRequest, GenerateResponse, ModelListResponse } from '../types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'

export async function generateImage(request: GenerateRequest, maxRetries: number = 5): Promise<GenerateResponse> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`尝试生成图片 (第 ${attempt}/${maxRetries} 次)...`)

            const apiEndpoint = request.endpoint?.trim() || DEFAULT_API_ENDPOINT
            const modelId = request.model?.trim() || DEFAULT_MODEL_ID

            // 检查是否是 Gemini 3 Pro Image 模型
            const isGemini3ProImage = modelId.toLowerCase().includes('gemini-3-pro-image')

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
            const imageConfig: any = {}

            if (request.aspectRatio) {
                imageConfig.aspect_ratio = request.aspectRatio
            }

            // 如果是 Gemini 3 Pro Image 模型，添加额外参数
            if (isGemini3ProImage) {
                if (request.imageSize) {
                    imageConfig.image_size = request.imageSize
                }
                if (request.enableGoogleSearch) {
                    payload.tools = [{ google_search: {} }]
                }
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

            // 如果是文本回复或空回复，记录错误并重试
            const textContent = message.content || ''

            if (typeof textContent === 'string' && textContent.trim()) {
                lastError = new Error(`模型返回了文本而非图片: ${textContent}`)
                console.warn(`第 ${attempt} 次尝试失败:`, lastError.message)
            } else {
                lastError = new Error('模型未返回有效图片')
                console.warn(`第 ${attempt} 次尝试失败:`, lastError.message)
            }

            // 如果还有重试次数，继续下一次尝试
            if (attempt < maxRetries) {
                console.log(`准备第 ${attempt + 1} 次重试...`)
                continue
            }

        } catch (err) {
            // 对于网络错误或API错误，也进行重试
            lastError = err instanceof Error ? err : new Error(String(err))
            console.error(`第 ${attempt} 次尝试出错:`, lastError.message)

            // 如果是最后一次尝试，直接抛出错误
            if (attempt >= maxRetries) {
                break
            }

            // 否则继续重试
            console.log(`准备第 ${attempt + 1} 次重试...`)
        }
    }

    // 所有重试都失败后，抛出最后一次的错误
    throw new Error(`在 ${maxRetries} 次尝试后仍未能生成图片。最后错误: ${lastError?.message || '未知错误'}`)
}

export async function fetchModels(apikey: string, endpoint: string): Promise<ApiModel[]> {
    const apiEndpoint = endpoint?.trim() || DEFAULT_API_ENDPOINT
    const modelsUrl = resolveModelsEndpoint(apiEndpoint)

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

function resolveModelsEndpoint(endpoint: string): string {
    try {
        const url = new URL(endpoint)
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
        return endpoint.replace(/\/$/, '') + '/models'
    }
}
