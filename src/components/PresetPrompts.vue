<template>
    <div class="space-y-2.5">
        <!-- 头部：标题、筛选分类、展开收起、随机灵感 -->
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div
                class="flex items-center gap-2 cursor-pointer select-none group/title"
                @click="isExpanded = !isExpanded"
                title="点击展开或收起提示词卡片"
            >
                <span class="text-xs font-semibold text-slate-700 group-hover/title:text-slate-900 transition-colors">
                    提示词灵感推荐
                </span>
                <span class="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full font-mono">
                    {{ filteredPrompts.length }}
                </span>
                <svg
                    :class="['w-3.5 h-3.5 text-slate-400 transition-transform duration-200', isExpanded ? 'rotate-180' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <button
                @click="applyRandomPrompt"
                class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 rounded-lg text-xs font-medium transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                title="随机挑选一个灵感填入"
            >
                <span>🎲</span>
                <span>随机灵感</span>
            </button>
        </div>

        <div v-show="isExpanded" class="space-y-2.5">
            <!-- 主题分类快速筛选 -->
            <div class="flex flex-wrap items-center gap-1.5">
                <button
                    v-for="cat in presetCategories"
                    :key="cat.id"
                    @click="activeCategory = cat.id"
                    :class="[
                        'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border flex items-center gap-1',
                        activeCategory === cat.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    ]"
                >
                    <span class="text-xs">{{ cat.icon }}</span>
                    <span>{{ cat.label }}</span>
                </button>
            </div>

            <!-- 提示词卡片网格：完全平铺自然展示，彻底去除局部滚动条 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div
                    v-for="item in filteredPrompts"
                    :key="item.id"
                    @click="emit('select', item.prompt)"
                    class="group bg-white hover:bg-slate-50/90 border border-slate-200 hover:border-amber-400 rounded-xl p-2.5 transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs relative"
                >
                    <div>
                        <div class="flex items-start justify-between gap-1 mb-1">
                            <div class="flex items-center gap-1.5 min-w-0">
                                <span class="text-sm flex-shrink-0">{{ item.icon }}</span>
                                <h4 class="font-semibold text-xs text-slate-800 truncate group-hover:text-amber-900 transition-colors">
                                    {{ item.title }}
                                </h4>
                            </div>
                            <span v-if="item.badge" class="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 px-1 py-0.2 rounded font-medium flex-shrink-0">
                                {{ item.badge }}
                            </span>
                        </div>

                        <!-- 中文描述：平时截断2行，鼠标悬浮时展示完整悬浮气泡 -->
                        <div class="relative group/tooltip mb-2">
                            <p
                                :title="item.description || item.prompt"
                                class="text-xs text-slate-500 line-clamp-2 leading-relaxed"
                            >
                                {{ item.description || item.prompt }}
                            </p>

                            <!-- 悬浮浮层：完整中文描述 -->
                            <div
                                class="absolute left-0 top-full mt-1.5 z-40 w-64 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs leading-relaxed opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-150 pointer-events-none"
                            >
                                <div class="font-semibold text-amber-300 mb-0.5 flex items-center gap-1">
                                    <span>{{ item.icon }}</span>
                                    <span>{{ item.title }}</span>
                                </div>
                                <div class="text-slate-200 font-normal">
                                    {{ item.description || item.prompt }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 卡片底部快捷操作 -->
                    <div class="flex items-center justify-between pt-1.5 border-t border-slate-100 gap-1 text-xs" @click.stop>
                        <span class="text-[11px] text-slate-400 font-mono truncate max-w-[100px]">
                            {{ item.prompt.slice(0, 20) }}...
                        </span>

                        <div class="flex items-center gap-1 flex-shrink-0">
                            <button
                                @click.stop="emit('append', item.prompt)"
                                class="px-2 py-0.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium transition-colors text-xs"
                                title="追加到现有描述后方"
                            >
                                追加
                            </button>
                            <button
                                @click.stop="emit('select', item.prompt)"
                                class="px-2.5 py-0.5 text-white bg-slate-900 hover:bg-slate-800 rounded font-medium transition-all shadow-2xs text-xs"
                                title="选用此灵感填入输入框"
                            >
                                选用
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { presetCategories, presetPrompts } from '../data/templates'

const emit = defineEmits<{
    select: [prompt: string]
    append: [prompt: string]
}>()

const isExpanded = ref(true)
const activeCategory = ref('all')

const filteredPrompts = computed(() => {
    if (activeCategory.value === 'all') {
        return presetPrompts
    }
    return presetPrompts.filter(item => item.category === activeCategory.value)
})

const applyRandomPrompt = () => {
    if (!presetPrompts.length) return
    const randomIndex = Math.floor(Math.random() * presetPrompts.length)
    const picked = presetPrompts[randomIndex]
    emit('select', picked.prompt)
}
</script>
