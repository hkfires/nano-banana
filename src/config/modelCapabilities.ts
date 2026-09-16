export type ModelFamily =
    | 'gemini-25-flash-image'
    | 'gemini-3-pro-image'
    | 'gemini-31-flash-image'
    | 'gpt-image-2'
    | 'gpt-image-2.5'
    | 'grok-imagine-image'
    | 'grok-imagine-image-quality'
    | 'grok-imagine-image-2.0'
    | 'unsupported'

export type SupportedModelFamily = Exclude<ModelFamily, 'unsupported'>
export type ModelProvider = 'Google' | 'OpenAI' | 'xAI' | 'Other'
export type ApiProtocol = 'chat-completions' | 'images-api'

export interface AspectRatioOption {
    value: string
    label: string
    resolution?: string
}

export interface ModelCapability {
    family: ModelFamily
    label: string
    provider: ModelProvider
    apiProtocol: ApiProtocol
    supportsAspectRatio: boolean
    supportsImageSize: boolean
    supportsQuality?: boolean
    supportsGoogleSearch: boolean
    supportsResolution: boolean
    resolutionOptions?: Array<{ value: string; label: string }>
    imageSizeOptions?: Array<{ value: string; label: string }>
    qualityOptions?: Array<{ value: string; label: string }>
}


export interface ModelImageSettings {
    aspectRatio: string
    imageSize?: string
    quality?: string
    enableGoogleSearch?: boolean
    resolution?: string
}

const gemini25AspectRatios: AspectRatioOption[] = [
    { value: '1:1', label: '1:1 - 1024x1024', resolution: '1024x1024' },
    { value: '2:3', label: '2:3 - 832x1248', resolution: '832x1248' },
    { value: '3:2', label: '3:2 - 1248x832', resolution: '1248x832' },
    { value: '3:4', label: '3:4 - 864x1184', resolution: '864x1184' },
    { value: '4:3', label: '4:3 - 1184x864', resolution: '1184x864' },
    { value: '4:5', label: '4:5 - 896x1152', resolution: '896x1152' },
    { value: '5:4', label: '5:4 - 1152x896', resolution: '1152x896' },
    { value: '9:16', label: '9:16 - 768x1344', resolution: '768x1344' },
    { value: '16:9', label: '16:9 - 1344x768', resolution: '1344x768' },
    { value: '21:9', label: '21:9 - 1536x672', resolution: '1536x672' }
]

export const gptImageData: Record<string, Record<string, { width: number; height: number }>> = {
    '1K': {
        '1:1': { width: 1024, height: 1024 },
        '2:3': { width: 1024, height: 1536 },
        '3:2': { width: 1536, height: 1024 },
        '3:4': { width: 864, height: 1152 },
        '4:3': { width: 1152, height: 864 },
        '4:5': { width: 896, height: 1120 },
        '5:4': { width: 1120, height: 896 },
        '9:16': { width: 864, height: 1536 },
        '16:9': { width: 1536, height: 864 },
        '21:9': { width: 1792, height: 768 }
    },
    '2K': {
        '1:1': { width: 2048, height: 2048 },
        '2:3': { width: 1664, height: 2496 },
        '3:2': { width: 2496, height: 1664 },
        '3:4': { width: 1536, height: 2048 },
        '4:3': { width: 2048, height: 1536 },
        '4:5': { width: 1792, height: 2240 },
        '5:4': { width: 2240, height: 1792 },
        '9:16': { width: 1440, height: 2560 },
        '16:9': { width: 2560, height: 1440 },
        '21:9': { width: 2688, height: 1152 }
    },
    '4K': {
        '1:1': { width: 2880, height: 2880 },
        '2:3': { width: 2336, height: 3504 },
        '3:2': { width: 3504, height: 2336 },
        '3:4': { width: 2448, height: 3264 },
        '4:3': { width: 3264, height: 2448 },
        '4:5': { width: 2560, height: 3200 },
        '5:4': { width: 3200, height: 2560 },
        '9:16': { width: 2160, height: 3840 },
        '16:9': { width: 3840, height: 2160 },
        '21:9': { width: 3808, height: 1632 }
    }
}

export function resolveGptImageSize(aspectRatio?: string, imageSize: string = '1K'): string | undefined {
    if (!aspectRatio) return undefined
    const tier = gptImageData[imageSize] || gptImageData['1K']
    const dimensions = tier[aspectRatio]
    return dimensions ? `${dimensions.width}x${dimensions.height}` : undefined
}

export const grokImageData: Record<string, Record<string, { width: number; height: number }>> = {
    '1k': {
        '1:1': { width: 1024, height: 1024 },
        '4:3': { width: 1152, height: 864 },
        '3:4': { width: 864, height: 1152 },
        '3:2': { width: 1248, height: 832 },
        '2:3': { width: 832, height: 1248 },
        '16:9': { width: 1280, height: 720 },
        '9:16': { width: 720, height: 1280 }
    },
    '2k': {
        '1:1': { width: 2048, height: 2048 },
        '4:3': { width: 2304, height: 1728 },
        '3:4': { width: 1728, height: 2304 },
        '3:2': { width: 2496, height: 1664 },
        '2:3': { width: 1664, height: 2496 },
        '16:9': { width: 2816, height: 1584 },
        '9:16': { width: 1584, height: 2816 }
    }
}

const gemini3ProImageData: Record<string, Record<string, { width: number; height: number }>> = {
    '512': {
        '1:1': { width: 512, height: 512 },
        '16:9': { width: 688, height: 384 },
        '9:16': { width: 384, height: 688 },
        '4:3': { width: 592, height: 448 },
        '3:4': { width: 448, height: 592 },
        '3:2': { width: 624, height: 416 },
        '2:3': { width: 416, height: 624 },
        '5:4': { width: 576, height: 464 },
        '4:5': { width: 464, height: 576 },
        '21:9': { width: 784, height: 336 },
        '1:4': { width: 256, height: 1024 },
        '4:1': { width: 1024, height: 256 },
        '1:8': { width: 176, height: 1456 },
        '8:1': { width: 1456, height: 176 }
    },
    '1K': {
        '1:1': { width: 1024, height: 1024 },
        '16:9': { width: 1376, height: 768 },
        '9:16': { width: 768, height: 1376 },
        '4:3': { width: 1200, height: 896 },
        '3:4': { width: 896, height: 1200 },
        '3:2': { width: 1264, height: 848 },
        '2:3': { width: 848, height: 1264 },
        '5:4': { width: 1152, height: 928 },
        '4:5': { width: 928, height: 1152 },
        '21:9': { width: 1584, height: 672 },
        '1:4': { width: 512, height: 2064 },
        '4:1': { width: 2064, height: 512 },
        '1:8': { width: 352, height: 2928 },
        '8:1': { width: 2928, height: 352 }
    },
    '2K': {
        '1:1': { width: 2048, height: 2048 },
        '16:9': { width: 2752, height: 1536 },
        '9:16': { width: 1536, height: 2752 },
        '4:3': { width: 2400, height: 1792 },
        '3:4': { width: 1792, height: 2400 },
        '3:2': { width: 2528, height: 1696 },
        '2:3': { width: 1696, height: 2528 },
        '5:4': { width: 2304, height: 1856 },
        '4:5': { width: 1856, height: 2304 },
        '21:9': { width: 3168, height: 1344 },
        '1:4': { width: 1024, height: 4128 },
        '4:1': { width: 4128, height: 1024 },
        '1:8': { width: 704, height: 5856 },
        '8:1': { width: 5856, height: 704 }
    },
    '4K': {
        '1:1': { width: 4096, height: 4096 },
        '16:9': { width: 5504, height: 3072 },
        '9:16': { width: 3072, height: 5504 },
        '4:3': { width: 4800, height: 3584 },
        '3:4': { width: 3584, height: 4800 },
        '3:2': { width: 5056, height: 3392 },
        '2:3': { width: 3392, height: 5056 },
        '5:4': { width: 4608, height: 3712 },
        '4:5': { width: 3712, height: 4608 },
        '21:9': { width: 6336, height: 2688 },
        '1:4': { width: 2048, height: 8256 },
        '4:1': { width: 8256, height: 2048 },
        '1:8': { width: 1408, height: 11712 },
        '8:1': { width: 11712, height: 1408 }
    }
}

const capabilities: Record<Exclude<ModelFamily, 'unsupported'>, ModelCapability> = {
    'gemini-25-flash-image': {
        family: 'gemini-25-flash-image',
        label: 'Gemini Flash Image',
        provider: 'Google',
        apiProtocol: 'chat-completions',
        supportsAspectRatio: true,
        supportsImageSize: false,
        supportsGoogleSearch: false,
        supportsResolution: false
    },
    'gemini-3-pro-image': {
        family: 'gemini-3-pro-image',
        label: 'Gemini Pro Image',
        provider: 'Google',
        apiProtocol: 'chat-completions',
        supportsAspectRatio: true,
        supportsImageSize: true,
        supportsGoogleSearch: true,
        supportsResolution: false,
        imageSizeOptions: [
            { value: '1K', label: '1K 标准' },
            { value: '2K', label: '2K 高清' },
            { value: '4K', label: '4K 超清' }
        ]
    },
    'gemini-31-flash-image': {
        family: 'gemini-31-flash-image',
        label: 'Gemini 3.1 Flash Image',
        provider: 'Google',
        apiProtocol: 'chat-completions',
        supportsAspectRatio: true,
        supportsImageSize: true,
        supportsGoogleSearch: true,
        supportsResolution: false,
        imageSizeOptions: [
            { value: '512', label: '512 像素' },
            { value: '1K', label: '1K 标准' },
            { value: '2K', label: '2K 高清' },
            { value: '4K', label: '4K 超清' }
        ]
    },
    'grok-imagine-image-2.0': {
        family: 'grok-imagine-image-2.0',
        label: 'Grok Imagine Image 2.0',
        provider: 'xAI',
        apiProtocol: 'images-api',
        supportsAspectRatio: true,
        supportsImageSize: false,
        supportsGoogleSearch: false,
        supportsResolution: true,
        resolutionOptions: [
            { value: '1k', label: '1K 分辨率' },
            { value: '2k', label: '2K 分辨率' }
        ]
    },
    'gpt-image-2': {
        family: 'gpt-image-2',
        label: 'GPT Image 2',
        provider: 'OpenAI',
        apiProtocol: 'images-api',
        supportsAspectRatio: true,
        supportsImageSize: true,
        supportsQuality: true,
        supportsGoogleSearch: false,
        supportsResolution: false,
        imageSizeOptions: [
            { value: '1K', label: '1K 标准' },
            { value: '2K', label: '2K 高清' },
            { value: '4K', label: '4K 超清' }
        ],
        qualityOptions: [
            { value: 'high', label: '画质: 高精' },
            { value: 'medium', label: '画质: 标准' },
            { value: 'low', label: '画质: 极速' }
        ]
    },
    'gpt-image-2.5': {
        family: 'gpt-image-2.5',
        label: 'GPT Image 2.5',
        provider: 'OpenAI',
        apiProtocol: 'images-api',
        supportsAspectRatio: true,
        supportsImageSize: true,
        supportsQuality: true,
        supportsGoogleSearch: false,
        supportsResolution: false,
        imageSizeOptions: [
            { value: '1K', label: '1K 标准' },
            { value: '2K', label: '2K 高清' },
            { value: '4K', label: '4K 超清' }
        ],
        qualityOptions: [
            { value: 'high', label: '画质: 高精' },
            { value: 'medium', label: '画质: 标准' },
            { value: 'low', label: '画质: 极速' }
        ]
    },
    'grok-imagine-image': {
        family: 'grok-imagine-image',
        label: 'Grok Imagine Image',
        provider: 'xAI',
        apiProtocol: 'images-api',
        supportsAspectRatio: true,
        supportsImageSize: false,
        supportsGoogleSearch: false,
        supportsResolution: false
    },
    'grok-imagine-image-quality': {
        family: 'grok-imagine-image-quality',
        label: 'Grok Imagine Image Quality',
        provider: 'xAI',
        apiProtocol: 'images-api',
        supportsAspectRatio: true,
        supportsImageSize: false,
        supportsGoogleSearch: false,
        supportsResolution: true,
        resolutionOptions: [
            { value: '1k', label: '1k 质量' },
            { value: '2k', label: '2k 质量' }
        ]
    }
}


export function resolveModelFamily(modelId: string): ModelFamily {
    const normalized = modelId.toLowerCase().trim()
    if (!normalized) return 'unsupported'

    // 严格排除视频模型 (如 grok-imagine-video, veo, sora 等)
    if (normalized.includes('video')) return 'unsupported'

    const segments = normalized.split('/')
    const modelName = segments[segments.length - 1] || normalized

    // 1. OpenAI 官方生图模型 (支持 gpt-image-2.5, gpt-image-2.5-super, gpt-image-2.5-flare, gpt-5.4-image-2 等全系列子型号)
    if (/gpt.*image-2\.5/i.test(modelName) || /gpt.*image-2\.5/i.test(normalized)) return 'gpt-image-2.5'
    if (/gpt.*image-2/i.test(modelName) || /gpt.*image-2/i.test(normalized)) return 'gpt-image-2'

    // 2. xAI Grok 官方生图白名单 (精准排他，绝无 video)
    if (/^grok-imagine-image-2\.0/i.test(modelName) || /^grok-2-image-2\.0/i.test(modelName)) return 'grok-imagine-image-2.0'
    if (modelName === 'grok-imagine-image-quality' || normalized.includes('grok-imagine-image-quality')) {
        return 'grok-imagine-image-quality'
    }
    if (/^grok-imagine-image/i.test(modelName) || /^grok-2-image/i.test(modelName) || modelName === 'grok-imagine') {
        return 'grok-imagine-image'
    }

    // 3. Google Gemini 官方生图白名单
    if (/^gemini-3\.1-flash-image(?:-|$)/.test(modelName)) return 'gemini-31-flash-image'
    if (/^gemini-3(?:\.1)?-pro-image(?:-|$)/.test(modelName)) return 'gemini-3-pro-image'
    if (/^gemini-2\.5-flash-image(?:-|:|$)/.test(modelName)) return 'gemini-25-flash-image'

    return 'unsupported'
}

export function getModelCapability(modelId: string): ModelCapability | null {
    const family = resolveModelFamily(modelId)
    if (family === 'unsupported') return null
    return capabilities[family]
}

export function getDefaultModelImageSettings(family: SupportedModelFamily): ModelImageSettings {
    const defaults: ModelImageSettings = {
        aspectRatio: '1:1'
    }

    if (family === 'gemini-31-flash-image') {
        defaults.imageSize = '1K'
        defaults.enableGoogleSearch = false
    }

    if (family === 'gemini-3-pro-image') {
        defaults.imageSize = '2K'
        defaults.enableGoogleSearch = false
    }

    if (family === 'gpt-image-2' || family === 'gpt-image-2.5') {
        defaults.imageSize = '1K'
        defaults.quality = 'high'
    }

    if (family === 'grok-imagine-image-quality' || family === 'grok-imagine-image-2.0') {
        defaults.resolution = '2k'
    }

    return defaults
}

export function getAspectRatioOptions(family: SupportedModelFamily, imageSize?: string): AspectRatioOption[] {
    if (family === 'gemini-31-flash-image' || family === 'gemini-3-pro-image') {
        const tier = (imageSize && gemini3ProImageData[imageSize]) ? gemini3ProImageData[imageSize] : gemini3ProImageData['1K']
        return Object.entries(tier).map(([ratio, dimensions]) => ({
            value: ratio,
            label: `${ratio} - ${dimensions.width}x${dimensions.height}`,
            resolution: `${dimensions.width}x${dimensions.height}`
        }))
    }

    if (family === 'gpt-image-2' || family === 'gpt-image-2.5') {
        const tier = (imageSize && gptImageData[imageSize]) ? gptImageData[imageSize] : gptImageData['1K']
        return Object.entries(tier).map(([ratio, dimensions]) => ({
            value: ratio,
            label: `${ratio} - ${dimensions.width}x${dimensions.height}`,
            resolution: `${dimensions.width}x${dimensions.height}`
        }))
    }

    if (family === 'grok-imagine-image' || family === 'grok-imagine-image-quality' || family === 'grok-imagine-image-2.0') {
        const tierName = (imageSize && imageSize.toLowerCase() === '2k') ? '2k' : '1k'
        const tier = grokImageData[tierName] || grokImageData['1k']
        return Object.entries(tier).map(([ratio, dim]) => ({
            value: ratio,
            label: `${ratio} - ${dim.width}x${dim.height}`,
            resolution: `${dim.width}x${dim.height}`
        }))
    }

    return gemini25AspectRatios
}

export function normalizeModelImageSettings(
    family: SupportedModelFamily,
    settings: Partial<ModelImageSettings> | undefined
): ModelImageSettings {
    const defaults = getDefaultModelImageSettings(family)
    const merged: ModelImageSettings = {
        ...defaults,
        ...settings,
        aspectRatio: settings?.aspectRatio || defaults.aspectRatio
    }

    const capability = capabilities[family]
    for (const [key, options] of [
        ['imageSize', capability.imageSizeOptions],
        ['quality', capability.qualityOptions],
        ['resolution', capability.resolutionOptions]
    ] as const) {
        if (!options?.length) delete merged[key]
        else if (!options.some(option => option.value === merged[key])) {
            merged[key] = defaults[key] || options[0].value
        }
    }

    const options = getAspectRatioOptions(family, merged.imageSize)
    if (!options.some(option => option.value === merged.aspectRatio)) {
        merged.aspectRatio = options[0]?.value || defaults.aspectRatio
    }

    return merged
}

export function isSupportedModelFamily(family: ModelFamily): family is SupportedModelFamily {
    return family !== 'unsupported'
}
export function usesImagesApi(modelId: string): boolean {
    const normalized = modelId.toLowerCase().trim()
    if (normalized.includes('video')) return false

    const cap = getModelCapability(modelId)
    if (cap) {
        return cap.apiProtocol === 'images-api'
    }
    const family = resolveModelFamily(modelId)
    if (family === 'gpt-image-2' || family === 'gpt-image-2.5' || family === 'grok-imagine-image' || family === 'grok-imagine-image-quality' || family === 'grok-imagine-image-2.0') {
        return true
    }
    return (normalized.includes('grok') && normalized.includes('image')) || normalized.includes('dall-e') || normalized.includes('gpt-image')
}
