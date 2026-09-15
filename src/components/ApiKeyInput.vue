<template>
    <div class="bg-white border-4 border-black rounded-lg p-3 sm:p-4 shadow-lg">
        <div class="mb-3">
            <h3 class="font-bold text-gray-800 flex items-center gap-2 mb-1">
                🔑 API 配置
                <span v-if="modelValue" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">密钥已保存</span>
            </h3>
            <p class="text-xs sm:text-sm text-gray-600">支持 OpenRouter、CLIProxyAPI 或任何 OpenAI / Gemini 兼容图像端点</p>
        </div>

        <div class="space-y-3 sm:space-y-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">API 密钥</label>
                <div class="flex gap-2">
                    <input
                        type="password"
                        :value="modelValue"
                        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                        placeholder="输入你的 API 密钥..."
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                        v-if="modelValue"
                        @click="clearApiKey"
                        class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-bold"
                        title="清除缓存的API密钥"
                    >
                        🗑️
                    </button>
                </div>
                <div class="flex items-center justify-between mt-1">
                    <p class="text-xs text-gray-500">
                        默认端点可从 <a href="https://openrouter.ai/" target="_blank" class="text-orange-500 hover:underline font-medium">OpenRouter.ai</a> 获取密钥
                    </p>
                    <p v-if="modelValue" class="text-xs text-green-600 flex items-center gap-1 font-medium">💾 已自动保存到本地</p>
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">API 端点</label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        :value="endpoint"
                        @input="$emit('update:endpoint', ($event.target as HTMLInputElement).value)"
                        placeholder="例如 https://openrouter.ai/api/v1 或 http://localhost:8314/v1"
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                        v-if="isCustomEndpoint"
                        @click="resetEndpoint"
                        class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                        title="恢复默认端点"
                    >
                        ♻️
                    </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">只需填写到 /v1，程序会根据模型能力自动切换 chat/completions 或 images/generations/edits</p>
            </div>

            <div>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                        @click="$emit('fetch-models')"
                        :disabled="!canFetchModels || modelLoading"
                        :class="[
                            'px-3 py-2 rounded-lg border-2 border-black font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2',
                            modelLoading
                                ? 'bg-gray-300 text-gray-600 cursor-wait'
                                : canFetchModels
                                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        ]"
                    >
                        <span v-if="modelLoading">⏳ 正在获取...</span>
                        <span v-else>📥 从端点获取全部模型</span>
                    </button>
                    <span v-if="models.length" class="text-xs text-gray-600 font-medium">已从当前端点载入 {{ models.length }} 个模型</span>
                </div>
                <p v-if="modelError" class="text-xs text-red-600 mt-2">⚠️ {{ modelError }}</p>

                <!-- 模型分类选择下拉框 -->
                <div class="mt-3">
                    <label class="block text-xs font-semibold text-gray-600 mb-1">选择当前生图模型</label>
                    <select
                        :value="model"
                        @change="handleModelChange"
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white font-medium"
                    >
                        <!-- 未拉取模型时：仅显示当前配置的模型项 -->
                        <template v-if="!hasFetchedModels">
                            <option :value="currentFallbackOption.id">
                                {{ currentFallbackOption.supportsImages ? '🖼️ ' : '' }}{{ currentFallbackOption.label }}
                            </option>
                        </template>

                        <!-- 已从端点拉取模型：严格从端点返回的模型进行分类匹配展示 -->
                        <template v-else>
                            <!-- OpenAI / GPT Image 系列 -->
                            <optgroup v-if="groupedRemoteModels.openai.length" label="🟢 OpenAI / GPT Image 系列">
                                <option v-for="item in groupedRemoteModels.openai" :key="item.id" :value="item.id">
                                    🖼️ {{ item.label }}
                                </option>
                            </optgroup>

                            <!-- Google Gemini 系列 -->
                            <optgroup v-if="groupedRemoteModels.google.length" label="🔵 Google Gemini 系列">
                                <option v-for="item in groupedRemoteModels.google" :key="item.id" :value="item.id">
                                    🖼️ {{ item.label }}
                                </option>
                            </optgroup>

                            <!-- xAI Grok 系列 -->
                            <optgroup v-if="groupedRemoteModels.xai.length" label="⚫ xAI Grok 系列">
                                <option v-for="item in groupedRemoteModels.xai" :key="item.id" :value="item.id">
                                    🖼️ {{ item.label }}
                                </option>
                            </optgroup>

                            <!-- 其他多模态 / 生图模型 -->
                            <optgroup v-if="groupedRemoteModels.otherImage.length" label="🟣 其他多模态 / 生图模型">
                                <option v-for="item in groupedRemoteModels.otherImage" :key="item.id" :value="item.id">
                                    🖼️ {{ item.label }}
                                </option>
                            </optgroup>

                            <!-- 其他文本 / 对话模型 -->
                            <optgroup v-if="groupedRemoteModels.text.length" label="💬 其他文本 / 对话模型">
                                <option v-for="item in groupedRemoteModels.text" :key="item.id" :value="item.id">
                                    {{ item.label }}
                                </option>
                            </optgroup>

                            <!-- 当前配置的模型不在端点拉取列表中时的回退项 -->
                            <optgroup v-if="customFallbackOption" label="✏️ 当前选定模型（未在端点返回列表中）">
                                <option :value="customFallbackOption.id">
                                    🖼️ {{ customFallbackOption.label }}
                                </option>
                            </optgroup>
                        </template>
                    </select>

                    <p v-if="!hasFetchedModels" class="text-xs text-gray-500 mt-1">
                        💡 尚未拉取模型列表，点击上方“📥 从端点获取全部模型”以匹配并载入端点支持的模型
                    </p>

                    <!-- 当前选中模型能力详情展示卡片 -->
                    <div v-if="currentCapabilityInfo" class="mt-2.5 p-2.5 bg-orange-50 border border-orange-200 rounded-lg text-xs space-y-1.5">
                        <div class="flex flex-wrap items-center justify-between gap-1">
                            <span class="font-bold text-orange-900 flex items-center gap-1">
                                <span>{{ getProviderIcon(currentCapabilityInfo.provider) }}</span>
                                <span>{{ currentCapabilityInfo.label }}</span>
                            </span>
                            <span class="px-2 py-0.5 rounded-full font-semibold text-[11px] bg-white border border-orange-300 text-orange-800">
                                {{ currentCapabilityInfo.categoryLabel }}
                            </span>
                        </div>

                        <p class="text-gray-700">
                            <span class="font-semibold text-gray-900">⚙️ 参数分类：</span>
                            {{ currentCapabilityInfo.parameterCategory }}
                        </p>

                        <div v-if="currentCapabilityInfo.featureTags?.length" class="flex flex-wrap gap-1 pt-0.5">
                            <span
                                v-for="tag in currentCapabilityInfo.featureTags"
                                :key="tag"
                                class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[11px] font-medium"
                            >
                                ✓ {{ tag }}
                            </span>
                        </div>
                    </div>
                    <p v-else-if="selectedModelInfo" class="text-xs text-gray-500 mt-1.5">{{ selectedModelInfo }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'
import { getModelCapability } from '../config/modelCapabilities'
import { LocalStorage } from '../utils/storage'
import type { ModelOption } from '../types'

const props = defineProps<{
    modelValue: string
    endpoint: string
    models: ModelOption[]
    model: string
    modelLoading: boolean
    modelError: string | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'update:endpoint': [value: string]
    'update:model': [value: string]
    'fetch-models': []
    'model-picked': []
}>()

const { modelValue, endpoint, models, model } = toRefs(props)

const clearApiKey = () => {
    LocalStorage.clearApiKey()
    LocalStorage.clearModelId()
    emit('update:modelValue', '')
    emit('update:model', '')
}

const resetEndpoint = () => {
    emit('update:endpoint', DEFAULT_API_ENDPOINT)
    emit('update:model', '')
}

const isCustomEndpoint = computed(() => endpoint.value !== '' && endpoint.value !== DEFAULT_API_ENDPOINT)
const canFetchModels = computed(() => modelValue.value.trim() !== '' && endpoint.value.trim() !== '')

const hasFetchedModels = computed(() => models.value.length > 0)

// 未拉取模型时的单项回退展示
const currentFallbackOption = computed<ModelOption>(() => {
    const currentId = model.value.trim() || DEFAULT_MODEL_ID
    const cap = getModelCapability(currentId)
    return {
        id: currentId,
        label: cap ? `${currentId} - ${cap.label}` : buildFallbackLabel(currentId),
        description: cap?.parameterCategory || '',
        supportsImages: true
    }
})

// 纯基于从端点拉取到的模型，进行规则匹配与分类
const groupedRemoteModels = computed(() => {
    const google: ModelOption[] = []
    const openai: ModelOption[] = []
    const xai: ModelOption[] = []
    const otherImage: ModelOption[] = []
    const text: ModelOption[] = []

    for (const item of models.value) {
        if (!item.supportsImages) {
            text.push(item)
            continue
        }

        const idLower = item.id.toLowerCase()
        const cap = getModelCapability(item.id)
        const provider = item.provider || cap?.provider

        if (provider === 'OpenAI' || item.category === 'openai' || idLower.includes('gpt-image') || idLower.includes('dall-e')) {
            openai.push(item)
        } else if (provider === 'Google' || item.category === 'google' || idLower.includes('gemini')) {
            google.push(item)
        } else if (provider === 'xAI' || item.category === 'xai' || idLower.includes('grok')) {
            xai.push(item)
        } else {
            otherImage.push(item)
        }
    }

    return { google, openai, xai, otherImage, text }
})

const customFallbackOption = computed<ModelOption | null>(() => {
    const currentId = model.value.trim()
    if (!currentId) return null

    const inModels = models.value.some(m => m.id === currentId)
    if (inModels) return null

    const cap = getModelCapability(currentId)
    return {
        id: currentId,
        label: cap ? `${currentId} - ${cap.label}` : buildFallbackLabel(currentId),
        supportsImages: true
    }
})

const currentCapabilityInfo = computed(() => {
    return getModelCapability(model.value)
})

const selectedModelInfo = computed(() => {
    const current = models.value.find(option => option.id === model.value)
    if (!current) return ''
    if (current.description) {
        return current.description
    }
    return current.supportsImages ? '支持生成图片' : ''
})

const handleModelChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    emit('update:model', value)
    emit('model-picked')
}

function getProviderIcon(provider?: string): string {
    if (provider === 'OpenAI') return '🟢'
    if (provider === 'Google') return '🔵'
    if (provider === 'xAI') return '⚫'
    return '🟣'
}

function buildFallbackLabel(modelId: string): string {
    const segments = modelId.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment || modelId
}
</script>
