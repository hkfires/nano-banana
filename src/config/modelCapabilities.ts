export type ModelFamily =
    | 'gemini-25-flash-image'
    | 'gemini-3-pro-image'
    | 'gpt-image-2'
    | 'gpt-image-2.5'
    | 'grok-imagine-image'
    | 'grok-imagine-image-quality'
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
    categoryLabel: string
    parameterCategory: string
    featureTags: string[]
    supportsAspectRatio: boolean
    supportsImageSize: boolean
    supportsQuality?: boolean
    supportsGoogleSearch: boolean
    supportsResolution: boolean
    aspectRatioParam: 'aspect_ratio' | 'size' | null
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
        '3:4': { width: 896, height: 1200 },
        '4:3': { width: 1200, height: 896 },
        '4:5': { width: 896, height: 1152 },
        '5:4': { width: 1152, height: 896 },
        '9:16': { width: 768, height: 1344 },
        '16:9': { width: 1344, height: 768 },
        '21:9': { width: 1536, height: 672 }
    },
    '2K': {
        '1:1': { width: 2048, height: 2048 },
        '2:3': { width: 1664, height: 2496 },
        '3:2': { width: 2496, height: 1664 },
        '3:4': { width: 1792, height: 2400 },
        '4:3': { width: 2400, height: 1792 },
        '4:5': { width: 1856, height: 2304 },
        '5:4': { width: 2304, height: 1856 },
        '9:16': { width: 1440, height: 2560 },
        '16:9': { width: 2560, height: 1440 },
        '21:9': { width: 2688, height: 1152 }
    },
    '4K': {
        '1:1': { width: 3840, height: 3840 },
        '2:3': { width: 2560, height: 3840 },
        '3:2': { width: 3840, height: 2560 },
        '3:4': { width: 2880, height: 3840 },
        '4:3': { width: 3840, height: 2880 },
        '4:5': { width: 3072, height: 3840 },
        '5:4': { width: 3840, height: 3072 },
        '9:16': { width: 2160, height: 3840 },
        '16:9': { width: 3840, height: 2160 },
        '21:9': { width: 3840, height: 1648 }
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
    { value: '4:5', label: '4:5 - 竖版' },
    { value: '5:4', label: '5:4 - 横版' },
    { value: '9:16', label: '9:16 - 手机竖屏' },
    { value: '16:9', label: '16:9 - 宽屏' },
    { value: '21:9', label: '21:9 - 超宽屏' }
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
        categoryLabel: 'Google Gemini 系列',
        parameterCategory: '动态宽高比 (Aspect Ratio)',
        featureTags: ['10种宽高比', '极速生成'],
        supportsAspectRatio: true,
        supportsImageSize: false,
        supportsGoogleSearch: false,
        supportsResolution: false,
        aspectRatioParam: 'aspect_ratio'
    },
    'gemini-3-pro-image': {
        family: 'gemini-3-pro-image',
        label: 'Gemini Pro Image',
        provider: 'Google',
        apiProtocol: 'chat-completions',
        categoryLabel: 'Google Gemini 系列',
        parameterCategory: '多档超清尺寸 (1K/2K/4K) · 宽高比联动 · 谷歌搜索增强',
        featureTags: ['4K超清画质', '谷歌搜索增强', '尺寸联动'],
        supportsAspectRatio: true,
        supportsImageSize: true,
        supportsGoogleSearch: true,
        supportsResolution: false,
        aspectRatioParam: 'aspect_ratio',
        imageSizeOptions: [
            { value: '1K', label: '1K - 标准清晰度' },
            { value: '2K', label: '2K - 高清晰度' },
            { value: '4K', label: '4K - 超高清晰度' }
        ]
    },
    'gpt-image-2': {
        family: 'gpt-image-2',
        label: 'GPT Image 2',
        provider: 'OpenAI',
        apiProtocol: 'images-api',
        categoryLabel: 'OpenAI 图像接口',
        parameterCategory: '多档清晰度 (1K/2K/4K) · 像素尺寸映射 · 渲染质量 (Quality) · 多图编辑',
        featureTags: ['1K/2K/4K清晰度', '10种尺寸比例', '质量调节(high/med/low)', '支持图生图'],
        supportsAspectRatio: true,
        supportsImageSize: true,
        supportsQuality: true,
        supportsGoogleSearch: false,
        supportsResolution: false,
        aspectRatioParam: 'size',
        imageSizeOptions: [
            { value: '1K', label: '1K - 标准清晰度' },
            { value: '2K', label: '2K - 高清晰度 (2K)' },
            { value: '4K', label: '4K - 超高清晰度 (4K)' }
        ],
        qualityOptions: [
            { value: 'high', label: 'high - 高精细节 (推荐)' },
            { value: 'medium', label: 'medium - 平衡速度' },
            { value: 'low', label: 'low - 极速模式' }
        ]
    },
    'gpt-image-2.5': {
        family: 'gpt-image-2.5',
        label: 'GPT Image 2.5',
        provider: 'OpenAI',
        apiProtocol: 'images-api',
        categoryLabel: 'OpenAI 图像接口',
        parameterCategory: '多档清晰度 (1K/2K/4K) · 像素尺寸映射 · 渲染质量 (Quality) · 多图编辑',
        featureTags: ['1K/2K/4K清晰度', '10种尺寸比例', '质量调节(high/med/low)', '新一代画质', '支持图生图'],
        supportsAspectRatio: true,
        supportsImageSize: true,
        supportsQuality: true,
        supportsGoogleSearch: false,
        supportsResolution: false,
        aspectRatioParam: 'size',
        imageSizeOptions: [
            { value: '1K', label: '1K - 标准清晰度' },
            { value: '2K', label: '2K - 高清晰度 (2K)' },
            { value: '4K', label: '4K - 超高清晰度 (4K)' }
        ],
        qualityOptions: [
            { value: 'high', label: 'high - 高精细节 (推荐)' },
            { value: 'medium', label: 'medium - 平衡速度' },
            { value: 'low', label: 'low - 极速模式' }
        ]
    },
    'grok-imagine-image': {
        family: 'grok-imagine-image',
        label: 'Grok Imagine Image',
        provider: 'xAI',
        apiProtocol: 'images-api',
        categoryLabel: 'xAI Grok 系列',
        parameterCategory: '动态宽高比 (Aspect Ratio)',
        featureTags: ['10种宽高比', '极速生成'],
        supportsAspectRatio: true,
        supportsImageSize: false,
        supportsGoogleSearch: false,
        supportsResolution: false,
        aspectRatioParam: 'aspect_ratio'
    },
    'grok-imagine-image-quality': {
        family: 'grok-imagine-image-quality',
        label: 'Grok Imagine Image Quality',
        provider: 'xAI',
        apiProtocol: 'images-api',
        categoryLabel: 'xAI Grok 系列',
        parameterCategory: '动态宽高比 (Aspect Ratio) · 输出质量档位 (1k/2k)',
        featureTags: ['1k/2k质量档位', '10种宽高比'],
        supportsAspectRatio: true,
        supportsImageSize: false,
        supportsGoogleSearch: false,
        supportsResolution: true,
        aspectRatioParam: 'aspect_ratio',
        resolutionOptions: [
            { value: '1k', label: '1k - 标准质量' },
            { value: '2k', label: '2k - 高质量' }
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
    if (modelName === 'grok-imagine-image-quality' || normalized.includes('grok-imagine-image-quality')) {
        return 'grok-imagine-image-quality'
    }
    if (modelName === 'grok-imagine-image' || normalized.includes('grok-imagine-image')) {
        return 'grok-imagine-image'
    }
    // 智能匹配 Google Gemini 系列生图模型（支持 2.5 / 3.0 / 3.1 等跨版本）
    if (normalized.includes('gemini') && normalized.includes('image')) {
        if (normalized.includes('pro')) {
            return 'gemini-3-pro-image'
        }
        return 'gemini-25-flash-image'
    }

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

    if (family === 'gemini-3-pro-image') {
        defaults.imageSize = '2K'
        defaults.enableGoogleSearch = false
    }

    if (family === 'gpt-image-2' || family === 'gpt-image-2.5') {
        defaults.imageSize = '1K'
        defaults.quality = 'high'
    }

    if (family === 'grok-imagine-image-quality') {
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
