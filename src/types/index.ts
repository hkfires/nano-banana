export interface GenerateRequest {
    prompt: string
    images: string[]
    apikey: string
    endpoint: string
    model: string
    aspectRatio?: string
    imageSize?: string
    quality?: string
    enableGoogleSearch?: boolean
    resolution?: string
    maxRetries?: number
}

export interface GenerateResponse {
    imageUrls: string[]
}

export interface ApiModel {
    id: string
    name?: string
    description?: string
    capabilities?: {
        image?: boolean
        [key: string]: unknown
    }
    [key: string]: unknown
}

export interface ModelListResponse {
    data?: ApiModel[]
    models?: ApiModel[]
}

export interface ModelOption {
    id: string
    label: string
    description?: string
    supportsImages: boolean
    provider?: string
    category?: 'featured' | 'google' | 'openai' | 'xai' | 'other-image' | 'other'
}

export interface StyleTemplate {
    id: string
    title: string
    prompt: string
    image?: string
    icon?: string
    badge?: string
    description: string
}

export interface PresetPrompt {
    id: string
    title: string
    category: string
    prompt: string
    icon: string
    description?: string
    badge?: string
}

export interface HistoryRecord {
    id: string
    timestamp: number
    type: 'text' | 'image'
    prompt: string
    imageUrls: string[]
    model: string
    inputImages?: string[]
    aspectRatio?: string
}
