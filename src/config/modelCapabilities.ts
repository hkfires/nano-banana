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

const grokAspectRatios: AspectRatioOption[] = [
    { value: '1:1', label: '1:1 - 方形' },
    { value: '2:3', label: '2:3 - 竖版' },
    { value: '3:2', label: '3:2 - 横版' },
    { value: '3:4', label: '3:4 - 竖版' },
    { value: '4:3', label: '4:3 - 横版' },
    { value: '2:1', label: '2:1' },
    { value: '1:2', label: '1:2' },
    { value: '19.5:9', label: '19.5:9' },
    { value: '9:19.5', label: '9:19.5' },
    { value: '20:9', label: '20:9' },
    { value: '9:20', label: '9:20' },
    { value: '9:16', label: '9:16 - 手机竖屏' },
    { value: '16:9', label: '16:9 - 宽屏' },
    { value: 'auto', label: '自动比例' }
]

const gemini3ProImageData: Record<string, Record<string, { width: number; height: number }>> = {
    '1K': {
        '1:1': { width: 1024, height: 1024 },
        '2:3': { width: 848, height: 1264 },
        '3:2': { width: 1264, height: 848 },
        '3:4': { width: 896, height: 1200 },
        '4:3': { width: 1200, height: 896 },
        '4:5': { width: 928, height: 1152 },
        '5:4': { width: 1152, height: 928 },
        '9:16': { width: 768, height: 1376 },
        '16:9': { width: 1376, height: 768 },
        '21:9': { width: 1584, height: 672 }
    },
    '2K': {
        '1:1': { width: 2048, height: 2048 },
        '2:3': { width: 1696, height: 2528 },
        '3:2': { width: 2528, height: 1696 },
        '3:4': { width: 1792, height: 2400 },
        '4:3': { width: 2400, height: 1792 },
        '4:5': { width: 1856, height: 2304 },
        '5:4': { width: 2304, height: 1856 },
        '9:16': { width: 1536, height: 2752 },
        '16:9': { width: 2752, height: 1536 },
        '21:9': { width: 3168, height: 1344 }
    },
    '4K': {
        '1:1': { width: 4096, height: 4096 },
        '2:3': { width: 3392, height: 5056 },
        '3:2': { width: 5056, height: 3392 },
        '3:4': { width: 3584, height: 4800 },
        '4:3': { width: 4800, height: 3584 },
        '4:5': { width: 3712, height: 4608 },
        '5:4': { width: 4608, height: 3712 },
        '9:16': { width: 3072, height: 5504 },
        '16:9': { width: 5504, height: 3072 },
        '21:9': { width: 6336, height: 2688 }
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

    const segments = normalized.split('/')
    const modelName = segments[segments.length - 1] || normalized

    // 优先前缀/精准匹配 gpt-image-2.5，避免被 gpt-image-2 拦截
    if (modelName === 'gpt-image-2.5' || modelName.startsWith('gpt-image-2.5') || normalized.includes('gpt-image-2.5')) {
        return 'gpt-image-2.5'
    }
    if (modelName === 'gpt-image-2' || modelName.startsWith('gpt-image-2') || normalized.includes('gpt-image-2')) {
        return 'gpt-image-2'
    }
    if (/^grok-imagine-image-2\.0(?:-|$)/.test(modelName)) return 'grok-imagine-image-2.0'
    if (modelName === 'grok-imagine-image-quality' || normalized.includes('grok-imagine-image-quality')) {
        return 'grok-imagine-image-quality'
    }
    if (modelName === 'grok-imagine-image' || normalized.includes('grok-imagine-image')) {
        return 'grok-imagine-image'
    }
    // 智能匹配 Google Gemini 系列生图模型（支持 2.5 / 3.0 / 3.1 等跨版本）
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
    if (family === 'gemini-3-pro-image' && imageSize && gemini3ProImageData[imageSize]) {
        return Object.entries(gemini3ProImageData[imageSize]).map(([ratio, dimensions]) => ({
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
    if (family === 'gemini-31-flash-image') {
        return [...Object.keys(gemini3ProImageData['1K']), '1:4', '4:1', '1:8', '8:1'].map(value => ({ value, label: value }))
    }
    if (family === 'grok-imagine-image-2.0') {
        return [...grokAspectRatios, { value: '21:9', label: '21:9' }, { value: '5:2', label: '5:2' }]
    }
    if (family === 'grok-imagine-image' || family === 'grok-imagine-image-quality') return grokAspectRatios
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
    const cap = getModelCapability(modelId)
    if (cap) {
        return cap.apiProtocol === 'images-api'
    }
    const family = resolveModelFamily(modelId)
    return family === 'gpt-image-2' || family === 'gpt-image-2.5' || family === 'grok-imagine-image' || family === 'grok-imagine-image-quality'
}
