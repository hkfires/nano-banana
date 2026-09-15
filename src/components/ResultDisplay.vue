<template>
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-full min-h-[460px] transition-all">
        <!-- 头部轻量状态栏 -->
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800">生成画廊</span>
                <span v-if="results && results.length" class="text-xs text-slate-400 font-mono">
                    {{ results.length }} 张
                </span>
            </div>

            <div class="flex items-center gap-2">
                <button
                    v-if="currentPrompt && results && results.length > 0"
                    @click="showPromptModal = true"
                    class="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors flex items-center gap-1"
                    title="查看并复制本次生成所使用的提示词"
                >
                    <span>📜</span>
                    <span>查看 Prompt</span>
                </button>
            </div>
        </div>

        <!-- 主内容画廊展示区 -->
        <div class="flex-1 flex flex-col justify-center items-center rounded-xl bg-slate-50/50 border border-slate-100 p-3 sm:p-4 relative overflow-hidden min-h-[340px]">
            <!-- 1. 加载中状态 (Loading) -->
            <div v-if="loading" class="flex flex-col items-center justify-center text-center py-12 px-4">
                <div class="w-10 h-10 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-3" />
                <h4 class="text-sm font-medium text-slate-800 mb-1">正在生成画面...</h4>
                <p class="text-xs text-slate-400 mb-2 font-mono">已用时 {{ elapsedTime }} 秒</p>
                <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-3 py-0.5">
                    {{ currentFunTip }}
                </p>
            </div>

            <!-- 2. 错误状态 (Error) -->
            <div v-else-if="error" class="flex flex-col items-center justify-center text-center py-8 px-4 max-w-md">
                <div class="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-base mb-2">
                    ✕
                </div>
                <h4 class="text-sm font-semibold text-rose-700 mb-1">生成失败</h4>
                <p class="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-xs text-rose-600 font-mono mb-3 text-left max-h-32 overflow-y-auto w-full leading-relaxed break-words">
                    {{ error }}
                </p>
                <div class="flex gap-2">
                    <button
                        @click="$emit('retry')"
                        class="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition-all shadow-xs"
                    >
                        重试一次
                    </button>
                    <button
                        @click="$emit('open-api-modal')"
                        class="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-medium text-xs transition-all"
                    >
                        检查 API
                    </button>
                </div>
            </div>

            <!-- 3. 结果展示状态 (Results) -->
            <div v-else-if="results && results.length > 0" class="w-full h-full flex flex-col justify-center">
                <div class="grid gap-3.5 w-full" :class="gridClass">
                    <div
                        v-for="(img, index) in results"
                        :key="`${img}-${index}`"
                        class="relative group bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col items-center"
                    >
                        <!-- 图片展示，点击全屏放大 -->
                        <div
                            class="w-full flex items-center justify-center bg-slate-950/5 cursor-zoom-in min-h-[220px] max-h-[460px] overflow-hidden"
                            @click="openLightbox(img)"
                        >
                            <img
                                :src="img"
                                alt="生成的艺术作品"
                                class="w-full h-full object-contain max-h-[460px] transition-transform duration-200 group-hover:scale-[1.01]"
                                @load="e => onImageLoad(e, img)"
                            />
                        </div>

                        <!-- 底部悬浮或常驻控制条 -->
                        <div class="w-full bg-white border-t border-slate-100 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                            <span v-if="imageSizes[img]" class="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {{ imageSizes[img] }}
                            </span>
                            <span v-else class="text-xs text-slate-400 font-mono">加载分辨率...</span>

                            <div class="flex items-center gap-1.5">
                                <button
                                    v-if="canPush"
                                    @click="$emit('push', img)"
                                    class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                                    title="将此图作为参考图推送到图文生图继续编辑"
                                >
                                    <span>🎨</span>
                                    <span>二次创作</span>
                                </button>
                                <button
                                    @click="copyImage(img)"
                                    class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all"
                                    :title="copiedImage === img ? '已复制！' : '复制图片数据'"
                                >
                                    <span>{{ copiedImage === img ? '✓ 已复制' : '复制图片' }}</span>
                                </button>
                                <button
                                    @click="$emit('download', img)"
                                    class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1"
                                    title="下载高清原图"
                                >
                                    <span>⬇️</span>
                                    <span>下载原图</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. 空状态 (Empty) -->
            <div v-else class="flex flex-col items-center justify-center text-center py-12 px-4">
                <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-lg mb-2">
                    🖼️
                </div>
                <h4 class="text-xs sm:text-sm font-medium text-slate-700 mb-0.5">作品展示区</h4>
                <p class="text-xs text-slate-400 max-w-xs leading-relaxed">
                    在左侧输入画面描述或上传参考图，生成的作品将在此高清呈现。
                </p>
            </div>
        </div>

        <!-- 历史生成记录 Filmstrip -->
        <div v-if="history && history.length > 0" class="mt-3 pt-3 border-t border-slate-100">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <span>🕒 生成历史</span>
                    <span class="text-xs text-slate-400 font-mono">({{ history.length }})</span>
                </span>
                <span class="text-xs text-slate-400">点击可切换查看</span>
            </div>

            <!-- 历史生成记录（网格换行排列，彻底无横向滚动） -->
            <div class="flex flex-wrap gap-2 pt-1">
                <div
                    v-for="item in history"
                    :key="item.id"
                    @click="$emit('select-history', item)"
                    class="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20 transition-all relative group bg-slate-100 shadow-2xs"
                >
                    <img :src="item.imageUrls[0]" alt="历史生成" class="w-full h-full object-cover" />
                    <span class="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 font-mono rounded-tl">
                        {{ item.type === 'text' ? '文' : '图文' }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Lightbox 全屏放大查看 -->
        <div
            v-if="lightboxImage"
            class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
            @click.self="closeLightbox"
        >
            <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
                <img
                    :src="lightboxImage"
                    alt="大图全屏查看"
                    class="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl"
                />

                <div class="mt-3 flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700 text-xs">
                    <button
                        v-if="canPush"
                        @click="$emit('push', lightboxImage)"
                        class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg"
                    >
                        🎨 二次创作
                    </button>
                    <button
                        @click="$emit('download', lightboxImage)"
                        class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg"
                    >
                        ⬇️ 下载原图
                    </button>
                    <button
                        @click="closeLightbox"
                        class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg"
                    >
                        ✕ 关闭 (ESC)
                    </button>
                </div>
            </div>
        </div>

        <!-- 查看 Prompt 弹窗 -->
        <div
            v-if="showPromptModal"
            class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
            @click.self="showPromptModal = false"
        >
            <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 shadow-xl">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                        <span>📜</span>
                        <span>生成所用的 Prompt 提示词</span>
                    </h4>
                    <button
                        @click="showPromptModal = false"
                        class="text-slate-400 hover:text-slate-700 text-sm font-bold"
                    >
                        ✕
                    </button>
                </div>
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono max-h-56 overflow-y-auto leading-relaxed text-slate-700 break-words mb-3">
                    {{ currentPrompt }}
                </div>
                <div class="flex justify-end">
                    <button
                        @click="copyPromptText"
                        class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium shadow-xs"
                    >
                        {{ copiedPrompt ? '✓ 已复制' : '复制此提示词' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { HistoryRecord } from '../types'

const props = defineProps<{
    results: string[]
    loading: boolean
    error: string | null
    canPush: boolean
    currentPrompt?: string
    history?: HistoryRecord[]
}>()

defineEmits<{
    download: [image: string]
    push: [image: string]
    retry: []
    'open-api-modal': []
    'select-history': [item: HistoryRecord]
}>()

const imageSizes = ref<Record<string, string>>({})
const lightboxImage = ref<string | null>(null)
const showPromptModal = ref(false)
const copiedPrompt = ref(false)
const copiedImage = ref<string | null>(null)
const elapsedTime = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const funTips = [
    '✨ 正在构建全局空间透视与构图...',
    '🎨 正在渲染光影漫反射与材质细节...',
    '⚡ 执行多模态条件扩散推理...',
    '🔍 深度去噪与高清像素重建中...',
    '🚀 画面渲染即将完成，请稍候...'
]

const currentFunTip = computed(() => {
    const idx = Math.floor(elapsedTime.value / 3) % funTips.length
    return funTips[idx]
})

watch(
    () => props.loading,
    val => {
        if (val) {
            elapsedTime.value = 0
            if (timer) clearInterval(timer)
            timer = setInterval(() => {
                elapsedTime.value++
            }, 1000)
        } else {
            if (timer) {
                clearInterval(timer)
                timer = null
            }
        }
    }
)

watch(
    () => props.results,
    () => {
        imageSizes.value = {}
    },
    { deep: true }
)

const gridClass = computed(() => {
    const count = props.results.length
    if (count === 1) return 'grid-cols-1'
    return 'grid-cols-1 sm:grid-cols-2'
})

const onImageLoad = (event: Event, image: string) => {
    const img = event.currentTarget as HTMLImageElement | null
    if (img?.naturalWidth && img.naturalHeight) {
        imageSizes.value[image] = `${img.naturalWidth} × ${img.naturalHeight}`
    }
}

const openLightbox = (image: string) => {
    lightboxImage.value = image
}

const closeLightbox = () => {
    lightboxImage.value = null
}

const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        closeLightbox()
        showPromptModal.value = false
    }
}

const copyPromptText = async () => {
    if (!props.currentPrompt) return
    try {
        await navigator.clipboard.writeText(props.currentPrompt)
        copiedPrompt.value = true
        setTimeout(() => {
            copiedPrompt.value = false
        }, 1500)
    } catch {
        // ignore
    }
}

const copyImage = async (imageUrl: string) => {
    try {
        if (imageUrl.startsWith('data:image/')) {
            const res = await fetch(imageUrl)
            const blob = await res.blob()
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ])
            copiedImage.value = imageUrl
        } else {
            await navigator.clipboard.writeText(imageUrl)
            copiedImage.value = imageUrl
        }
        setTimeout(() => {
            copiedImage.value = null
        }, 1500)
    } catch {
        await navigator.clipboard.writeText(imageUrl)
        copiedImage.value = imageUrl
        setTimeout(() => {
            copiedImage.value = null
        }, 1500)
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    if (timer) clearInterval(timer)
})
</script>
