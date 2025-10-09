import type { ApiModel, GenerateRequest, GenerateResponse, ModelListResponse } from '../types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'

export async function generateImage(request: GenerateRequest): Promise<GenerateResponse> {
    // 构建通用聊天补全请求格式
    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: request.prompt },
                ...request.images.map(img => ({
                    type: 'image_url',
                    image_url: { url: img }
                }))
            ]
        }
    ]

    const payload: Record<string, unknown> = {
        model: request.model || DEFAULT_MODEL_ID,
        messages
    }

    // 如果提供了 aspectRatio 参数（用于 Gemini 模型），添加 generationConfig
    if (request.aspectRatio) {
        payload.generationConfig = {
            imageConfig: {
                aspectRatio: request.aspectRatio
            }
        }
    }

    const apiEndpoint = request.endpoint?.trim() || DEFAULT_API_ENDPOINT

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

    if (!data.choices?.[0]?.message) {
        throw new Error('Invalid response from API')
    }

    const message = data.choices[0].message

    // 检查是否返回图片
    if (message.images?.[0]?.image_url?.url) {
        return { imageUrl: message.images[0].image_url.url }
    }

    // 检查content是否是base64图片
    if (typeof message.content === 'string' && message.content.startsWith('data:image/')) {
        return { imageUrl: message.content }
    }

    // 如果是文本回复，抛出错误或返回文本
    if (typeof message.content === 'string' && message.content.trim()) {
        throw new Error(`Model returned text instead of image: ${message.content}`)
    }

    throw new Error('Model did not return a valid image')
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
