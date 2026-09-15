<template>
    <div class="flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
        <!-- 模型选择下拉栏（仅展示端点获取到的图像模型） -->
        <div class="flex items-center gap-2 flex-1 min-w-[240px]">
            <span class="text-slate-400 font-medium whitespace-nowrap text-xs sm:text-sm">当前模型:</span>

            <!-- 1. 已获取到端点图像模型 -->
            <div v-if="hasModels" class="relative flex-1 max-w-md">
                <select
                    :value="model"
                    @change="handleModelChange"
                    class="w-full pl-3 pr-8 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer truncate"
                >
                    <option v-for="item in models" :key="item.id" :value="item.id">
                        {{ item.id }}
                    </option>
                </select>
                <div class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            <!-- 2. 尚未获取到模型时的状态 -->
            <div v-else class="flex items-center gap-2 flex-1">
                <span class="text-slate-400 text-xs">未载入模型</span>
                <button
                    @click="$emit('fetch-models')"
                    :disabled="!canFetchModels || modelLoading"
                    class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg font-medium text-xs transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
                >
                    <svg v-if="modelLoading" class="w-3.5 h-3.5 animate-spin text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span v-else>📥</span>
                    <span>{{ modelLoading ? '正在载入...' : '载入模型列表' }}</span>
                </button>
            </div>

            <!-- 刷新当前端点模型按钮 -->
            <button
                v-if="hasModels"
                @click="$emit('fetch-models')"
                :disabled="!canFetchModels || modelLoading"
                class="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all disabled:opacity-40"
                title="刷新端点模型列表"
            >
                <svg :class="['w-3.5 h-3.5', modelLoading ? 'animate-spin text-amber-600' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>

        <!-- 错误提示 -->
        <span v-if="modelError" class="text-rose-500 text-xs font-medium">
            ⚠️ {{ modelError }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import type { ModelOption } from '../types'

const props = defineProps<{
    model: string
    models: ModelOption[]
    modelLoading: boolean
    modelError: string | null
    hasApiKey: boolean
    canFetchModels: boolean
}>()

const emit = defineEmits<{
    'update:model': [value: string]
    'fetch-models': []
}>()

const { model, models } = toRefs(props)

const hasModels = computed(() => models.value.length > 0)

const handleModelChange = (event: Event) => {
    const target = event.target as HTMLSelectElement | null
    if (!target) return
    emit('update:model', target.value)
}
</script>
