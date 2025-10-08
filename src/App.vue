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
                    />
                </div>
            </div>

            <!-- 主要内容区域：左右布局 -->
            <div class="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:items-stretch min-h-[400px]">
                <!-- 左侧：上传图片 -->
                <div class="flex flex-col h-full">
                    <div class="bg-pink-400 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">🍌 1. 上传图片</div>
                    <div class="flex-1">
                        <ImageUpload v-model="selectedImages" />
                    </div>
                </div>

                <!-- 右侧：选择风格或自定义提示词 -->
                <div class="flex flex-col h-full">
                    <div class="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">
                        🎨 2. 选择风格或自定义提示词
                    </div>
                    <div class="flex-1">
                        <StylePromptSelector v-model:selectedStyle="selectedStyle" v-model:customPrompt="customPrompt" :templates="styleTemplates" />
                    </div>
                </div>
            </div>

            <!-- 生成按钮 -->
            <div class="mb-6">
                <GenerateButton :loading="isLoading" :disabled="!canGenerate" @click="handleGenerate" />
            </div>

            <!-- 生成结果区域：全宽 -->
            <div class="w-full">
                <div class="bg-black text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">✨ 3. 生成结果</div>
                <ResultDisplay :result="result" :loading="isLoading" :error="error" />
            </div>
        </div>

        <!-- Footer -->
        <Footer />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ApiKeyInput from './components/ApiKeyInput.vue'
import ImageUpload from './components/ImageUpload.vue'
import StylePromptSelector from './components/StylePromptSelector.vue'
import GenerateButton from './components/GenerateButton.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import Footer from './components/Footer.vue'
import { fetchModels, generateImage } from './services/api'
import { styleTemplates } from './data/templates'
import { LocalStorage } from './utils/storage'
import type { ApiModel, GenerateRequest, ModelOption } from './types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from './config/api'

const apiKey = ref('')
const apiEndpoint = ref(DEFAULT_API_ENDPOINT)
const selectedImages = ref<string[]>([])
const selectedStyle = ref('')
const customPrompt = ref('')
const isLoading = ref(false)
const result = ref<string | null>(null)
const error = ref<string | null>(null)
const showApiSettings = ref(false)
const modelOptions = ref<ModelOption[]>([])
const selectedModel = ref(DEFAULT_MODEL_ID)
const isFetchingModels = ref(false)
const modelsError = ref<string | null>(null)

// 组件挂载时从本地存储读取API密钥
onMounted(() => {
    const savedApiKey = LocalStorage.getApiKey()
    const savedEndpoint = LocalStorage.getApiEndpoint()
    if (savedApiKey) {
        apiKey.value = savedApiKey
        showApiSettings.value = false
    } else {
        // 如果没有API密钥，自动展开设置面板
        showApiSettings.value = true
    }

    apiEndpoint.value = savedEndpoint.trim() || DEFAULT_API_ENDPOINT

    const savedModelId = LocalStorage.getModelId()
    selectedModel.value = savedModelId.trim() || DEFAULT_MODEL_ID
})

// 监听API密钥变化，自动保存到本地存储
watch(
    apiKey,
    (newApiKey: string) => {
        if (newApiKey.trim()) {
            LocalStorage.saveApiKey(newApiKey)
            // 当API密钥配置成功后，延迟关闭设置面板
            setTimeout(() => {
                showApiSettings.value = false
            }, 1500)
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

        if (trimmed !== previousTrimmed) {
            modelOptions.value = []
            modelsError.value = null
            if (previousTrimmed) {
                selectedModel.value = ''
            }
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
        }
    },
    { immediate: false }
)

// 监听风格和提示词变化，清除之前的生成结果
watch([selectedStyle, customPrompt], () => {
    // 当用户改变风格或提示词时，清除之前的结果和错误
    if (result.value || error.value) {
        result.value = null
        error.value = null
    }
})

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

        const preferred =
            options.find(option => option.id === selectedModel.value) ||
            options.find(option => option.id === DEFAULT_MODEL_ID) ||
            options.find(option => option.supportsImages) ||
            options[0]

        selectedModel.value = preferred.id
    } catch (fetchError) {
        modelsError.value = fetchError instanceof Error ? fetchError.message : '无法获取模型列表'
        modelOptions.value = []
        selectedModel.value = ''
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

const canGenerate = computed(
    () =>
        apiKey.value.trim() &&
        apiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        selectedImages.value.length > 0 &&
        (selectedStyle.value || customPrompt.value.trim()) &&
        !isLoading.value
)

const handleGenerate = async () => {
    if (!canGenerate.value) return

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

        const response = await generateImage(request)
        result.value = response.imageUrl
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
