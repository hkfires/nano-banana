import type { ApiModel, GenerateRequest, GenerateResponse, ModelListResponse } from '../types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'

export async function generateImage(request: GenerateRequest, maxRetries: number = 5): Promise<GenerateResponse> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`尝试生成图片 (第 ${attempt}/${maxRetries} 次)...`)

            // 构建消息内容：如果没有图片，使用简单字符串；有图片则使用数组格式
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

            const payload: Record<string, unknown> = {
                model: request.model || DEFAULT_MODEL_ID,
                messages,
                modalities: ['image', 'text']
            }

            // 如果提供了 aspectRatio 参数，添加 image_config
            if (request.aspectRatio) {
                payload.image_config = {
                    aspect_ratio: request.aspectRatio
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
                console.log(`成功生成图片 (第 ${attempt} 次尝试)`)
                return { imageUrl: message.images[0].image_url.url }
            }

            // 检查content是否是base64图片
            if (typeof message.content === 'string' && message.content.startsWith('data:image/')) {
                console.log(`成功生成图片 (第 ${attempt} 次尝试)`)
                return { imageUrl: message.content }
            }

            // 如果是文本回复或空回复，记录错误并重试
            if (typeof message.content === 'string' && message.content.trim()) {
                lastError = new Error(`模型返回了文本而非图片: ${message.content}`)
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
