<template>
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-full transition-all">
        <!-- 模式分段控制器 (Segmented Switcher) -->
        <div class="flex mb-3.5 bg-slate-100 p-1 rounded-xl">
            <button
                @click="activeTab = 'style'"
                :class="[
                    'flex-1 py-1.5 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5',
                    activeTab === 'style'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                ]"
            >
                <span>🎨</span>
                <span>艺术风格预设</span>
            </button>
            <button
                @click="activeTab = 'custom'"
                :class="[
                    'flex-1 py-1.5 px-3 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5',
                    activeTab === 'custom'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                ]"
            >
                <span>✏️</span>
                <span>自定义改图描述</span>
            </button>
        </div>

        <!-- 艺术风格预设模式 -->
        <div v-if="activeTab === 'style'" class="space-y-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
            <div
                v-for="template in templates"
                :key="template.id"
                @click="selectStyle(template.id)"
                :class="[
                    'p-3 rounded-xl border transition-all cursor-pointer relative',
                    selectedStyle === template.id
                        ? 'bg-amber-50/50 border-amber-500 ring-1 ring-amber-500/20 shadow-xs'
                        : 'bg-slate-50/40 hover:bg-slate-50 border-slate-200/80'
                ]"
            >
                <div class="flex items-start gap-3">
                    <!-- 缩略图或图标 -->
                    <div class="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                        <img v-if="template.image" :src="template.image" :alt="template.title" class="w-full h-full object-cover" />
                        <span v-else class="text-xl">{{ template.icon || '🎨' }}</span>
                    </div>

                    <!-- 文本内容 -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1 mb-0.5">
                            <h4 class="font-semibold text-xs sm:text-sm text-slate-800 truncate">{{ template.title }}</h4>
                            <span v-if="template.badge" class="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium flex-shrink-0">
                                {{ template.badge }}
                            </span>
                        </div>

                        <div class="relative group/tooltip mb-1.5">
                            <p
                                :title="template.description"
                                class="text-xs text-slate-500 line-clamp-2 leading-relaxed"
                            >
                                {{ template.description }}
                            </p>

                            <!-- 悬浮浮层：完整中文描述 -->
                            <div
                                class="absolute left-0 top-full mt-1.5 z-40 w-64 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs leading-relaxed opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-150 pointer-events-none"
                            >
                                <div class="font-semibold text-amber-300 mb-0.5 flex items-center gap-1">
                                    <span>{{ template.icon || '🎨' }}</span>
                                    <span>{{ template.title }}</span>
                                </div>
                                <div class="text-slate-200 font-normal">
                                    {{ template.description }}
                                </div>
                            </div>
                        </div>

                        <details class="group" @click.stop>
                            <summary class="cursor-pointer text-[10px] text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 select-none">
                                <span>查看详细 Prompt</span>
                                <svg class="w-3 h-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div class="mt-1 p-2 bg-white rounded border border-slate-200 text-[10px] text-slate-600 font-mono leading-relaxed select-text">
                                {{ template.prompt }}
                            </div>
                        </details>
                    </div>

                    <!-- 选中对勾 -->
                    <div
                        :class="[
                            'w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-colors',
                            selectedStyle === template.id ? 'bg-amber-500 text-white' : 'border border-slate-300 text-transparent'
                        ]"
                    >
                        ✓
                    </div>
                </div>
            </div>
        </div>

        <!-- 自定义提示词模式 -->
        <div v-else class="flex flex-col gap-2.5 flex-1">
            <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-700">
                    改图要求与画面指令：
                </label>
                <button
                    v-if="customPrompt"
                    @click="updateCustomPrompt('')"
                    class="text-xs text-slate-400 hover:text-rose-600 font-medium"
                >
                    清空
                </button>
            </div>

            <div class="relative flex-1 flex flex-col">
                <textarea
                    :value="customPrompt"
                    @input="updateCustomPrompt(($event.target as HTMLTextAreaElement).value)"
                    placeholder="描述你希望对参考图进行的改动，例如：保持人物外貌特征不变，换成赛博朋克雨夜背景，身穿机甲，带有霓虹反光..."
                    class="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm flex-1 transition-colors duration-150 leading-relaxed"
                />
                <div class="text-[10px] text-slate-400 text-right mt-1 font-mono">
                    {{ customPrompt.length }} 字符
                </div>
            </div>

            <!-- 快捷常用修饰词标签 -->
            <div>
                <span class="text-[11px] font-medium text-slate-400 block mb-1">快捷添加常用描述：</span>
                <div class="flex flex-wrap gap-1">
                    <button
                        v-for="chip in quickModifiers"
                        :key="chip"
                        @click="appendModifier(chip)"
                        class="text-[11px] bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md transition-colors"
                    >
                        + {{ chip }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { StyleTemplate } from '../types'

const props = defineProps<{
    selectedStyle: string
    customPrompt: string
    templates: StyleTemplate[]
}>()

const emit = defineEmits<{
    'update:selectedStyle': [value: string]
    'update:customPrompt': [value: string]
}>()

const activeTab = ref<'style' | 'custom'>('style')

const quickModifiers = [
    '保持人物面部特征一致',
    '35mm电影胶片质感',
    '赛博朋克霓虹光影',
    '吉卜力唯美动画风',
    '写实8K超清',
    '虚幻引擎5渲染'
]

watch(
    () => props.selectedStyle,
    newValue => {
        if (newValue && activeTab.value !== 'style') {
            activeTab.value = 'style'
        }
    }
)

watch(
    () => props.customPrompt,
    newValue => {
        if (newValue && activeTab.value !== 'custom') {
            activeTab.value = 'custom'
        }
    }
)

const selectStyle = (styleId: string) => {
    emit('update:customPrompt', '')
    emit('update:selectedStyle', props.selectedStyle === styleId ? '' : styleId)
}

const updateCustomPrompt = (value: string) => {
    emit('update:selectedStyle', '')
    emit('update:customPrompt', value)
}

const appendModifier = (modifier: string) => {
    const current = props.customPrompt.trim()
    const separator = current ? '，' : ''
    updateCustomPrompt(`${current}${separator}${modifier}`)
}
</script>
