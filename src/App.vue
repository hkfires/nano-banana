<template>
    <div class="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-200 text-gray-900 relative overflow-hidden">
        <!-- 香蕉装饰元素 -->
        <div class="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🍌</div>
        <div class="absolute top-32 right-20 text-4xl opacity-30 animate-pulse">🍌</div>
        <div class="absolute bottom-20 left-32 text-5xl opacity-25 animate-bounce delay-1000">🍌</div>
        <div class="absolute bottom-40 right-10 text-3xl opacity-20 animate-pulse delay-500">🍌</div>

        <div class="container mx-auto px-3 py-4 relative z-10">
            <!-- Header -->
            <div class="relative mb-6">
                <div class="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-lg p-6 border-4 border-black shadow-lg">
                    <div class="text-center">
                        <h1 class="text-4xl font-black text-white mb-1 flex items-center justify-center gap-2">
                            🍌 Nano<br />
                            <span class="text-yellow-100 text-5xl">Banana</span>
                        </h1>
                        <p class="text-white text-base font-medium">上传你的图片，我来创造艺术！</p>
                    </div>
                </div>
            </div>

            <!-- API设置区域 -->
            <div class="mb-6">
                <div class="flex justify-center">
                    <button
                        @click="showApiSettings = !showApiSettings"
                        :class="[
                            'px-6 py-3 rounded-lg border-4 border-black font-bold text-sm transition-all flex items-center gap-2 shadow-lg',
                            apiKey ? 'bg-green-400 text-white hover:bg-green-500' : 'bg-red-400 text-white hover:bg-red-500 animate-pulse'
                        ]"
                    >
                        <span>🔑</span>
                        <span v-if="!apiKey">需要配置API密钥</span>
                        <span v-else>API密钥已配置</span>
                        <svg :class="['w-4 h-4 transition-transform', showApiSettings ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                <!-- API设置折叠面板 -->
                <div v-if="showApiSettings" class="mt-4 max-w-2xl mx-auto">
                    <ApiKeyInput
                        v-model="apiKey"
                        v-model:endpoint="apiEndpoint"
                        v-model:model="selectedModel"
                        :models="modelOptions"
                        :model-loading="isFetchingModels"
                        :model-error="modelsError"
                        @fetch-models="handleFetchModels"
                        @model-picked="handleModelPicked"
                    />
                </div>
            </div>

            <!-- 功能布局 -->
            <div class="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:items-start">
                <!-- 灵感工坊 -->
                <div class="flex flex-col h-full gap-4">
                    <div class="flex flex-col h-full">
                        <div class="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">
                            ✨ 文生图 · 灵感工坊
                        </div>
                        <div class="bg-white border-4 border-black border-t-0 rounded-b-lg p-5 shadow-lg flex flex-col h-full gap-4">
                            <div class="flex flex-col gap-3 flex-1">
                                <label class="font-bold flex items-center gap-2 text-base">🍌 输入你的创意描述：</label>
                                <textarea
                                    v-model="textToImagePrompt"
                                    placeholder="例如：阳光洒在香蕉形热气球上，漂浮在糖果色的天空中"
                                    class="w-full px-4 py-3 border-2 border-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[160px] flex-1"
                                />
                            </div>

                            <p class="text-sm text-gray-600 font-medium flex items-center gap-2">
                                <span>💡</span>
                                <span>填写描述后，使用下方按钮开始创作，生成的图片会展示在下方结果区，可直接下载或继续改图。</span>
                            </p>
                        </div>
                    </div>

                    <!-- 宽高比选择器（仅当选择 Gemini 2.5 Flash Image 系列模型时显示） -->
                    <div v-if="showAspectRatioSelector" class="flex flex-col">
                        <div class="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">
                            📐 图像宽高比
                        </div>
                        <AspectRatioSelector v-model="selectedAspectRatio" />
                    </div>
                </div>

                <!-- 图文生图流程 -->
                <div class="flex flex-col gap-4 h-full">
                    <div class="flex flex-col h-full">
                        <div class="bg-pink-400 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">🍌 图文生图 · 上传图片</div>
                        <div class="flex-1">
                            <ImageUpload v-model="selectedImages" />
                        </div>
                    </div>

                    <div class="flex flex-col h-full">
                        <div class="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">
                            🎨 图文生图 · 选择风格或自定义提示词
                        </div>
                        <div class="flex-1">
                            <StylePromptSelector v-model:selectedStyle="selectedStyle" v-model:customPrompt="customPrompt" :templates="styleTemplates" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 生成按钮 -->
            <div class="mb-6">
                <div class="flex flex-col gap-4 lg:flex-row lg:gap-6">
                    <button
                        @click="handleTextToImageGenerate"
                        :disabled="!canGenerateTextImage"
                        :class="[
                            'flex-1 px-6 py-4 rounded-lg font-bold text-white text-lg transition-all duration-200 flex items-center justify-center gap-3 border-4 border-black shadow-lg',
                            canGenerateTextImage
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:-translate-y-1 hover:shadow-xl'
                                : 'bg-gray-400 cursor-not-allowed'
                        ]"
                    >
                        <span v-if="!isTextToImageLoading" class="flex items-center gap-2 text-xl">🍌 施展魔法（文生图）</span>
                        <span v-else class="flex items-center gap-2 text-xl">🍌 正在施法...</span>
                        <div v-if="isTextToImageLoading" class="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    </button>
                    <button
                        @click="handleGenerate"
                        :disabled="!canGenerate"
                        :class="[
                            'flex-1 px-6 py-4 rounded-lg font-bold text-white text-lg transition-all duration-200 flex items-center justify-center gap-3 border-4 border-black shadow-lg',
                            canGenerate
                                ? 'bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 hover:-translate-y-1 hover:shadow-xl'
                                : 'bg-gray-400 cursor-not-allowed'
                        ]"
                    >
                        <span v-if="!isLoading" class="flex items-center gap-2 text-xl">🍌 施展魔法（图文生图）</span>
                        <span v-else class="flex items-center gap-2 text-xl">🍌 正在施法...</span>
                        <div v-if="isLoading" class="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    </button>
                </div>
            </div>

            <!-- 生成结果区域：全宽 -->
            <div class="w-full">
                <div class="bg-black text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">✨ 生成结果</div>
                <ResultDisplay
                    :result="displayResult"
                    :loading="displayLoading"
                    :error="displayError"
                    :can-push="canPushDisplayResult"
                    @download="handleDownloadResult"
                    @push="handlePushDisplayResult"
                />
            </div>

            <!-- Footer -->
            <Footer />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ApiKeyInput from './components/ApiKeyInput.vue'
import ImageUpload from './components/ImageUpload.vue'
import StylePromptSelector from './components/StylePromptSelector.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import Footer from './components/Footer.vue'
import AspectRatioSelector from './components/AspectRatioSelector.vue'
import { fetchModels, generateImage } from './services/api'
import { styleTemplates } from './data/templates'
import { LocalStorage } from './utils/storage'
import type { ApiModel, GenerateRequest, ModelOption } from './types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from './config/api'

const apiKey = ref('')
const apiEndpoint = ref('')  // 改为空字符串，避免初始化时触发 watch
const selectedImages = ref<string[]>([])
const selectedStyle = ref('')
const customPrompt = ref('')
const isLoading = ref(false)
const result = ref<string | null>(null)
const error = ref<string | null>(null)
const textToImagePrompt = ref('')
const textToImageResult = ref<string | null>(null)
const textToImageError = ref<string | null>(null)
const isTextToImageLoading = ref(false)
const latestResultSource = ref<'text' | 'image' | null>(null)
const showApiSettings = ref(false)
const modelOptions = ref<ModelOption[]>([])
const selectedModel = ref('')  // 改为空字符串，避免初始化时使用默认值
const isFetchingModels = ref(false)
const modelsError = ref<string | null>(null)
const selectedAspectRatio = ref('1:1')  // 默认宽高比为 1:1
let hasSyncedInitialEndpoint = false

// 组件挂载时从本地存储读取API密钥
onMounted(() => {
    const savedApiKey = LocalStorage.getApiKey()
    const savedEndpoint = LocalStorage.getApiEndpoint()
    const savedModelId = LocalStorage.getModelId()

    if (savedApiKey) {
        apiKey.value = savedApiKey
        showApiSettings.value = false
    } else {
        // 如果没有API密钥，自动展开设置面板
        showApiSettings.value = true
    }

    // 先设置端点，再恢复模型缓存，最后设置模型ID
    const endpointToUse = savedEndpoint.trim() || DEFAULT_API_ENDPOINT
    const modelIdToUse = savedModelId.trim() || DEFAULT_MODEL_ID

    // 恢复模型缓存
    restoreModelOptionsFromCache(endpointToUse)

    // 设置值（这些赋值会触发 watch，但此时 hasSyncedInitialEndpoint 还是 false）
    selectedModel.value = modelIdToUse
    apiEndpoint.value = endpointToUse

    ensureSelectedOptionPresent()

    // 最后才标记初始化完成，这样后续的 watch 触发才会被当作用户操作
    hasSyncedInitialEndpoint = true
})

// 监听API密钥变化，自动保存到本地存储
watch(
    apiKey,
    (newApiKey: string, previousApiKey?: string) => {
        const trimmed = newApiKey.trim()
        if (trimmed) {
            LocalStorage.saveApiKey(trimmed)
        } else {
            LocalStorage.clearApiKey()
            if ((previousApiKey || '').trim()) {
                LocalStorage.clearModelCache()
                modelOptions.value = []
                selectedModel.value = DEFAULT_MODEL_ID
                modelsError.value = null
            }
            showApiSettings.value = true
        }
    },
    { immediate: false }
)

watch(
    apiEndpoint,
    (newEndpoint: string, previousEndpoint?: string) => {
        const trimmed = newEndpoint.trim()
        const previousTrimmed = (previousEndpoint || '').trim()

        if (trimmed) {
            LocalStorage.saveApiEndpoint(trimmed)
        } else {
            LocalStorage.clearApiEndpoint()
        }

        // 如果是初始化阶段（在 onMounted 中），直接返回，不做任何处理
        if (!hasSyncedInitialEndpoint) {
            return
        }

        // 只有在初始化完成后，用户主动修改端点时才重置模型
        if (trimmed !== previousTrimmed) {
            modelOptions.value = []
            modelsError.value = null
            if (previousTrimmed) {
                selectedModel.value = DEFAULT_MODEL_ID
                LocalStorage.clearModelCache(previousTrimmed)
            }
            showApiSettings.value = true
        }
    },
    { immediate: false }
)

watch(
    selectedModel,
    (newModel: string) => {
        const trimmed = newModel.trim()
        if (trimmed) {
            LocalStorage.saveModelId(trimmed)
        } else {
            LocalStorage.clearModelId()
            LocalStorage.clearModelCache(apiEndpoint.value)
            // 避免在初始化时重置
            if (hasSyncedInitialEndpoint) {
                selectedModel.value = DEFAULT_MODEL_ID
                showApiSettings.value = true
            }
        }
        // 只在初始化完成后才调用 ensureSelectedOptionPresent
        if (hasSyncedInitialEndpoint) {
            ensureSelectedOptionPresent()
        }
    },
    { immediate: false }
)

// 注释掉：监听风格和提示词变化时清除结果的逻辑
// 改进：保留已生成的图片，让用户可以参考上次结果来调整参数
// watch([selectedStyle, customPrompt], () => {
//     if (result.value || error.value) {
//         result.value = null
//         error.value = null
//     }
// })

watch(
    textToImagePrompt,
    () => {
        if (textToImageError.value) {
            textToImageError.value = null
        }
    },
    { immediate: false }
)

const handleFetchModels = async () => {
    if (!apiKey.value.trim() || !apiEndpoint.value.trim()) return

    isFetchingModels.value = true
    modelsError.value = null

    try {
        const rawModels = await fetchModels(apiKey.value, apiEndpoint.value)
        const options = mapModelsToOptions(rawModels)

        if (!options.length) {
            throw new Error('未找到可用模型')
        }

        modelOptions.value = options
        LocalStorage.saveModelCache(apiEndpoint.value, options)

        const preferred =
            options.find(option => option.id === selectedModel.value) ||
            options.find(option => option.id === DEFAULT_MODEL_ID) ||
            options.find(option => option.supportsImages) ||
            options[0]

        selectedModel.value = preferred.id
        ensureSelectedOptionPresent()
    } catch (fetchError) {
        modelsError.value = fetchError instanceof Error ? fetchError.message : '无法获取模型列表'
        modelOptions.value = []
        selectedModel.value = DEFAULT_MODEL_ID
    } finally {
        isFetchingModels.value = false
    }
}

const mapModelsToOptions = (models: ApiModel[]): ModelOption[] => {
    const uniqueIds = new Set<string>()
    const options: ModelOption[] = []

    models.forEach(model => {
        if (!model?.id || uniqueIds.has(model.id)) return
        uniqueIds.add(model.id)

        const supportsImages = detectImageSupport(model)
        const label = buildModelLabel(model)
        const description = (typeof model.description === 'string' && model.description.trim()) ||
            (typeof (model as Record<string, unknown>).about === 'string' && String((model as Record<string, unknown>).about).trim()) ||
            ''

        options.push({
            id: model.id,
            label,
            description,
            supportsImages
        })
    })

    return options.sort((a, b) => {
        if (a.supportsImages !== b.supportsImages) {
            return a.supportsImages ? -1 : 1
        }
        return a.label.localeCompare(b.label)
    })
}

const detectImageSupport = (model: ApiModel): boolean => {
    const caps = model.capabilities
    if (caps && typeof caps === 'object') {
        if ((caps as Record<string, unknown>).image === true) return true
        if ((caps as Record<string, unknown>).images === true) return true
        if ((caps as Record<string, unknown>).vision === true) return true
        if ((caps as Record<string, unknown>).multimodal === true) return true
    }

    const tags = (model as Record<string, unknown>).tags
    if (Array.isArray(tags) && tags.some(tag => typeof tag === 'string' && /image|vision|photo|picture|art|draw/i.test(tag))) {
        return true
    }

    return /image|vision|flux|art|picture|photo|illustration/i.test(model.id)
}

const buildModelLabel = (model: ApiModel): string => {
    if (model.name && typeof model.name === 'string' && model.name.trim()) {
        return model.name.trim()
    }
    const segments = model.id.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment || model.id
}

const handleModelPicked = () => {
    if (!selectedModel.value.trim()) return
    modelsError.value = null
    if (!showApiSettings.value) return

    setTimeout(() => {
        if (selectedModel.value.trim()) {
            showApiSettings.value = false
        }
    }, 600)
}

const restoreModelOptionsFromCache = (endpoint: string) => {
    const trimmedEndpoint = endpoint.trim()
    if (!trimmedEndpoint) return

    const cached = LocalStorage.getModelCache(trimmedEndpoint)
    if (!cached.length) return

    modelOptions.value = cached
    ensureSelectedOptionPresent()
}

const ensureSelectedOptionPresent = () => {
    const currentId = selectedModel.value.trim()
    if (!currentId) return

    const exists = modelOptions.value.some(option => option.id === currentId)
    if (!exists) {
        modelOptions.value = [
            ...modelOptions.value,
            {
                id: currentId,
                label: buildFallbackLabel(currentId),
                description: '',
                supportsImages: true
            }
        ]
    }

    modelOptions.value = modelOptions.value.sort((a, b) => {
        if (a.supportsImages !== b.supportsImages) {
            return a.supportsImages ? -1 : 1
        }
        return a.label.localeCompare(b.label)
    })
}

const buildFallbackLabel = (modelId: string): string => {
    const segments = modelId.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment || modelId
}

const pushImageToUpload = (image: string | null) => {
    if (!image) return
    const filtered = selectedImages.value.filter(existing => existing !== image)
    selectedImages.value = [image, ...filtered]
}

const displayLoading = computed(() => {
    if (latestResultSource.value === 'image') return isLoading.value
    if (latestResultSource.value === 'text') return isTextToImageLoading.value
    return isLoading.value || isTextToImageLoading.value
})

const displayResult = computed(() => {
    if (latestResultSource.value === 'image') return result.value
    if (latestResultSource.value === 'text') return textToImageResult.value
    return result.value || textToImageResult.value
})

const displayError = computed(() => {
    if (latestResultSource.value === 'image') return error.value
    if (latestResultSource.value === 'text') return textToImageError.value
    return error.value || textToImageError.value
})

const canPushDisplayResult = computed(() => Boolean(displayResult.value))

const canGenerateTextImage = computed(
    () =>
        apiKey.value.trim() &&
        apiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        textToImagePrompt.value.trim() &&
        !isTextToImageLoading.value
)

const canGenerate = computed(
    () =>
        apiKey.value.trim() &&
        apiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        selectedImages.value.length > 0 &&
        (selectedStyle.value || customPrompt.value.trim()) &&
        !isLoading.value
)

// 判断是否显示宽高比选择器（仅当模型为 Gemini 2.5 Flash Image 系列时显示）
const showAspectRatioSelector = computed(() => {
    const modelId = selectedModel.value.toLowerCase().trim()
    if (!modelId) return false

    const segments = modelId.split('/')
    const normalizedId = segments[segments.length - 1]
    return normalizedId === 'gemini-2.5-flash-image' || normalizedId === 'gemini-2.5-flash-image-preview'
})

const handleTextToImageGenerate = async () => {
    if (!canGenerateTextImage.value) return

    latestResultSource.value = 'text'
    isTextToImageLoading.value = true
    textToImageError.value = null
    textToImageResult.value = null

    try {
        const request: GenerateRequest = {
            prompt: textToImagePrompt.value,
            images: [],
            apikey: apiKey.value,
            endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
            model: selectedModel.value.trim() || DEFAULT_MODEL_ID
        }

        // 如果显示宽高比选择器（Gemini 模型），则添加 aspectRatio 参数
        if (showAspectRatioSelector.value) {
            request.aspectRatio = selectedAspectRatio.value
        }

        const response = await generateImage(request)
        textToImageResult.value = response.imageUrl
        latestResultSource.value = 'text'
    } catch (err) {
        textToImageError.value = err instanceof Error ? err.message : '生成失败'
        textToImageResult.value = null
    } finally {
        isTextToImageLoading.value = false
    }
}

const handlePushTextImageToUpload = () => {
    pushImageToUpload(textToImageResult.value)
}

const handlePushDisplayResult = () => {
    pushImageToUpload(displayResult.value)
}

const handleDownloadResult = async () => {
    const image = displayResult.value
    if (!image) return
    if (typeof window === 'undefined') return

    let downloadUrl = image
    let revokeUrl: string | null = null

    try {
        if (!image.startsWith('data:')) {
            const response = await fetch(image)
            const blob = await response.blob()
            downloadUrl = URL.createObjectURL(blob)
            revokeUrl = downloadUrl
        }

        const link = document.createElement('a')
        const dataMatch = image.match(/^data:image\/([a-zA-Z0-9+]+);/)
        const extension = dataMatch ? dataMatch[1] : 'png'

        link.href = downloadUrl
        link.download = `nano-banana-${Date.now()}.${extension}`
        link.rel = 'noopener'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        if (revokeUrl) {
            URL.revokeObjectURL(revokeUrl)
        }
    } catch (downloadError) {
        window.open(image, '_blank', 'noopener')
    }
}

const handleGenerate = async () => {
    if (!canGenerate.value) return

    latestResultSource.value = 'image'
    isLoading.value = true
    error.value = null
    // 立即清除之前的结果，确保用户看到新的生成过程
    result.value = null

    try {
        // 使用选中的样式模板或自定义提示词
        const prompt = selectedStyle.value ? styleTemplates.find(t => t.id === selectedStyle.value)?.prompt || customPrompt.value : customPrompt.value

        const request: GenerateRequest = {
            prompt,
            images: selectedImages.value,
            apikey: apiKey.value,
            endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
            model: selectedModel.value.trim() || DEFAULT_MODEL_ID
        }

        // 如果显示宽高比选择器（Gemini 模型），则添加 aspectRatio 参数
        if (showAspectRatioSelector.value) {
            request.aspectRatio = selectedAspectRatio.value
        }

        const response = await generateImage(request)
        result.value = response.imageUrl
        latestResultSource.value = 'image'
    } catch (err) {
        error.value = err instanceof Error ? err.message : '生成失败'
        // 生成失败时也要清除结果
        result.value = null
    } finally {
        isLoading.value = false
    }
}

const handleReset = () => {
    selectedImages.value = []
    selectedStyle.value = ''
    customPrompt.value = ''
    result.value = null
    error.value = null
}
</script>
