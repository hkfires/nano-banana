<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        @click.self="closeModal"
    >
        <div
            class="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
        >
            <!-- 头部 -->
            <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-semibold border border-amber-200/60">
                        🔑
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-slate-900">API 接口与服务端点配置</h3>
                        <p class="text-xs text-slate-400">配置 OpenRouter、CLIProxyAPI 或其他兼容端点</p>
                    </div>
                </div>

                <button
                    @click="closeModal"
                    class="w-7 h-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors text-xs"
                >
                    ✕
                </button>
            </div>

            <!-- 主体表单 -->
            <div class="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
                <!-- API 密钥 -->
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                        API 密钥 (API Key)
                    </label>
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <input
                                :type="showKey ? 'text' : 'password'"
                                :value="apiKey"
                                @input="onKeyInput(($event.target as HTMLInputElement).value)"
                                placeholder="sk-or-v1-xxxxxxxx 或自定义密钥..."
                                class="w-full pl-3 pr-10 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                            <button
                                type="button"
                                @click="showKey = !showKey"
                                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-medium p-1"
                                title="切换密钥可见性"
                            >
                                {{ showKey ? '隐藏' : '显示' }}
                            </button>
                        </div>
                        <button
                            v-if="apiKey"
                            @click="clearKey"
                            class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-medium text-xs transition-colors"
                            title="清除已保存的密钥"
                        >
                            清除
                        </button>
                    </div>
                    <div class="flex items-center justify-between mt-1 text-xs text-slate-400">
                        <span>支持标准 Bearer Token 鉴权，填入对应服务商的 API 密钥</span>
                        <span v-if="apiKey" class="text-emerald-600 font-medium flex items-center gap-1">✓ 仅存储于当前浏览器本地</span>
                    </div>
                </div>

                <!-- API 端点 -->
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">
                        API 服务端点 (Endpoint Base)
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            :value="endpoint"
                            @input="$emit('update:endpoint', ($event.target as HTMLInputElement).value)"
                            placeholder="例如 http://localhost:8317/v1"
                            class="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                        <button
                            v-if="isCustomEndpoint"
                            @click="resetEndpoint"
                            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-medium text-xs transition-colors"
                            title="恢复为默认 OpenRouter 端点"
                        >
                            恢复默认
                        </button>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">
                        只需填写根路径到 <code class="bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">/v1</code>，系统会自动匹配对应生图接口。
                    </p>
                </div>

                <!-- 自动重试设置 (全局请求策略) -->
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="block text-xs font-semibold text-slate-700">
                            全局自动重试次数 (Auto Retry)
                        </label>
                        <span class="text-[11px] text-slate-400 font-mono">默认 3 次</span>
                    </div>
                    <select
                        v-model.number="selectedMaxRetries"
                        class="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                    >
                        <option :value="1" :selected="selectedMaxRetries === 1">关闭重试 (单次尝试)</option>
                        <option :value="2" :selected="selectedMaxRetries === 2">重试 1 次 (最多 2 次尝试)</option>
                        <option :value="3" :selected="selectedMaxRetries === 3">重试 2 次 (最多 3 次尝试，默认)</option>
                        <option :value="4" :selected="selectedMaxRetries === 4">重试 3 次 (最多 4 次尝试)</option>
                        <option :value="5" :selected="selectedMaxRetries === 5">重试 4 次 (最多 5 次尝试)</option>
                    </select>
                    <p class="text-xs text-slate-400 mt-1">
                        全局配置：遇到 429 限流或瞬态网络抖动时自动重新发起请求，默认 3 次。
                    </p>
                </div>

                <!-- 从端点拉取模型 -->
                <div class="pt-2.5 border-t border-slate-100">
                    <div class="flex flex-wrap items-center justify-between gap-2.5">
                        <div>
                            <span class="text-xs font-medium text-slate-700">模型列表载入状态</span>
                            <p v-if="modelsCount" class="text-xs text-emerald-600 font-medium mt-0.5">
                                已从当前端点载入 {{ modelsCount }} 个模型
                            </p>
                            <p v-else class="text-xs text-slate-400 mt-0.5">
                                尚未获取模型，可点击右侧拉取该端点支持的模型
                            </p>
                        </div>

                        <button
                            @click="$emit('fetch-models')"
                            :disabled="!canFetch || isFetchingModels"
                            class="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5"
                        >
                            <svg :class="['w-3.5 h-3.5', isFetchingModels ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{{ isFetchingModels ? '拉取中...' : '从端点获取模型' }}</span>
                        </button>
                    </div>

                    <p v-if="modelsError" class="text-xs text-rose-600 mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg">
                        {{ modelsError }}
                    </p>
                </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="bg-slate-50/70 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3">
                <span class="text-xs text-slate-400">密钥数据严格保存在本地浏览器</span>
                <button
                    @click="handleSaveAndClose"
                    class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs sm:text-sm transition-all shadow-xs"
                >
                    完成配置
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DEFAULT_API_ENDPOINT } from '../config/api'
import { LocalStorage } from '../utils/storage'

const props = withDefaults(defineProps<{
    isOpen: boolean
    apiKey: string
    endpoint: string
    modelsCount: number
    isFetchingModels: boolean
    modelsError: string | null
    maxRetries?: number
    'max-retries'?: number
}>(), {
    maxRetries: 3
})

const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    'update:apiKey': [value: string]
    'update:api-key': [value: string]
    'update:endpoint': [value: string]
    'update:maxRetries': [value: number]
    'update:max-retries': [value: number]
    'fetch-models': []
    'clear-key': []
}>()

const showKey = ref(false)

const selectedMaxRetries = computed({
    get: () => {
        const val = props.maxRetries ?? props['max-retries']
        return Number.isFinite(Number(val)) && Number(val) >= 1 ? Number(val) : 3
    },
    set: (value: number) => {
        const num = Math.max(1, Math.floor(Number(value) || 3))
        emit('update:maxRetries', num)
        emit('update:max-retries', num)
    }
})

const isCustomEndpoint = computed(() => props.endpoint !== '' && props.endpoint !== DEFAULT_API_ENDPOINT)
const canFetch = computed(() => props.apiKey.trim() !== '' && props.endpoint.trim() !== '')

const onKeyInput = (value: string) => {
    emit('update:apiKey', value)
    emit('update:api-key', value)
}

const closeModal = () => {
    emit('update:isOpen', false)
}

const handleSaveAndClose = () => {
    if (props.apiKey.trim()) {
        LocalStorage.saveApiKey(props.apiKey.trim())
    }
    if (props.endpoint.trim()) {
        LocalStorage.saveApiEndpoint(props.endpoint.trim())
    }
    LocalStorage.saveMaxRetries(selectedMaxRetries.value)
    closeModal()
}

const clearKey = () => {
    emit('clear-key')
}

const resetEndpoint = () => {
    emit('update:endpoint', DEFAULT_API_ENDPOINT)
}
</script>
