<template>
    <div
        class="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-full transition-all"
        @paste="handlePaste"
    >
        <!-- 头部信息 -->
        <div class="flex items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center gap-1.5">
                <div class="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-semibold">
                    🖼️
                </div>
                <span class="text-sm font-semibold text-slate-800">参考图片</span>
                <span v-if="thumbnails.length" class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full font-mono">
                    {{ thumbnails.length }} 张
                </span>
            </div>

            <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 hidden sm:inline">支持直接按 Ctrl+V 粘贴截图</span>
                <button
                    v-if="thumbnails.length > 0"
                    @click="clearAllImages"
                    class="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors"
                >
                    清空全部
                </button>
            </div>
        </div>

        <!-- 拖拽上传区域 -->
        <div
            ref="uploadArea"
            @click="fileInput?.click()"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            :class="[
                'border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col justify-center items-center select-none',
                isDragOver
                    ? 'border-amber-500 bg-amber-50/40 scale-[0.99]'
                    : 'border-slate-200/90 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50'
            ]"
        >
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />

            <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-1.5 shadow-2xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>

            <h4 class="text-xs sm:text-sm font-medium text-slate-700 mb-0.5">点击上传或将图片拖拽至此</h4>
            <p class="text-xs text-slate-400">支持多张图片 (JPG/PNG/WEBP)，亦可直接按 Ctrl+V 粘贴截图</p>
        </div>

        <!-- 缩略图网格预览 -->
        <div v-if="thumbnails.length > 0" class="mt-3">
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <div
                    v-for="(thumbnail, index) in thumbnails"
                    :key="index"
                    class="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group border border-slate-200 shadow-xs"
                >
                    <img :src="thumbnail" :alt="`参考图 ${index + 1}`" class="w-full h-full object-cover" />

                    <!-- 序号标签 -->
                    <span class="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-1 rounded">
                        #{{ index + 1 }}
                    </span>

                    <!-- 移除按钮 -->
                    <button
                        @click.stop="removeThumbnail(index)"
                        class="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all sm:opacity-0 group-hover:opacity-100"
                        title="移除此图"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    modelValue: string[]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string[]]
}>()

const fileInput = ref<HTMLInputElement>()
const uploadArea = ref<HTMLElement>()
const isDragOver = ref(false)

const thumbnails = computed(() => props.modelValue)

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        handleFiles(Array.from(target.files))
        target.value = ''
    }
}

const handleDragEnter = () => {
    isDragOver.value = true
}

const handleDragOver = () => {
    isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
    if (!uploadArea.value?.contains(event.relatedTarget as Node)) {
        isDragOver.value = false
    }
}

const handleDrop = (event: DragEvent) => {
    isDragOver.value = false
    if (event.dataTransfer?.files) {
        handleFiles(Array.from(event.dataTransfer.files))
    }
}

const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    imageFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
            if (e.target?.result) {
                const newImages = [...props.modelValue, e.target.result as string]
                emit('update:modelValue', newImages)
            }
        }
        reader.readAsDataURL(file)
    })
}

const removeThumbnail = (index: number) => {
    const newImages = props.modelValue.filter((_, i) => i !== index)
    emit('update:modelValue', newImages)
}

const clearAllImages = () => {
    emit('update:modelValue', [])
}

const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) files.push(file)
        }
    }

    if (files.length > 0) {
        handleFiles(files)
    }
}

const onGlobalPaste = (event: ClipboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return
    }
    handlePaste(event)
}

onMounted(() => {
    window.addEventListener('paste', onGlobalPaste)
})

onUnmounted(() => {
    window.removeEventListener('paste', onGlobalPaste)
})
</script>
