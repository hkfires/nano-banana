<template>
    <div class="bg-white border-4 border-black rounded-lg p-3 shadow-lg">
        <div class="mb-2">
            <h3 class="font-bold text-gray-800 flex items-center gap-2 mb-2">
                🔑 API 配置
                <span v-if="modelValue" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">密钥已保存</span>
            </h3>
            <p class="text-sm text-gray-600">可自定义 API 密钥与端点，默认使用 OpenRouter</p>
        </div>

        <div class="space-y-3">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">API 密钥</label>
                <div class="flex gap-2">
                    <input
                        type="password"
                        :value="modelValue"
                        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                        placeholder="输入你的 OpenRouter API 密钥..."
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                        v-if="modelValue"
                        @click="clearApiKey"
                        class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        title="清除缓存的API密钥"
                    >
                        🗑️
                    </button>
                </div>
                <div class="flex items-center justify-between mt-1">
                    <p class="text-xs text-gray-500">
                        从 <a href="https://openrouter.ai/" target="_blank" class="text-orange-500 hover:underline font-medium">OpenRouter.ai</a> 获取你的 API 密钥
                    </p>
                    <p v-if="modelValue" class="text-xs text-green-600 flex items-center gap-1">💾 已自动保存到本地</p>
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">API 端点</label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        :value="endpoint"
                        @input="$emit('update:endpoint', ($event.target as HTMLInputElement).value)"
                        placeholder="例如 https://openrouter.ai/api/v1"
                        class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                        v-if="isCustomEndpoint"
                        @click="resetEndpoint"
                        class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        title="恢复默认端点"
                    >
                        ♻️
                    </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">只需填写到 /v1，程序会自动拼接 chat/completions、models、images 等路径</p>
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
                        <span v-else>📥 获取模型列表</span>
                    </button>
                    <span v-if="models.length" class="text-xs text-gray-600">已载入 {{ models.length }} 个模型</span>
                </div>
                <p v-if="modelError" class="text-xs text-red-600 mt-2">⚠️ {{ modelError }}</p>

                <div class="mt-3">
                    <label class="block text-xs font-semibold text-gray-600 mb-1">选择文生图模型</label>
                    <select
                        :value="model"
                        @change="handleModelChange"
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    >
                        <option v-for="item in optionList" :key="item.id" :value="item.id">
                            {{ item.supportsImages ? '🖼️ ' : '' }}{{ item.label }}
                        </option>
                    </select>
                    <p v-if="selectedModelInfo" class="text-xs text-gray-500 mt-1">{{ selectedModelInfo }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'
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
const optionList = computed<ModelOption[]>(() => {
    if (models.value.length) {
        return models.value
    }

    const fallbackId = model.value || DEFAULT_MODEL_ID

    return [
        {
            id: fallbackId,
            label: buildFallbackLabel(fallbackId),
            description: '',
            supportsImages: true
        }
    ]
})

const selectedModelInfo = computed(() => {
    const current = optionList.value.find(option => option.id === model.value)
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

function buildFallbackLabel(modelId: string): string {
    const segments = modelId.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment || modelId
}
</script>
