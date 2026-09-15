<template>
    <div
        ref="uploadArea"
        class="min-w-0 rounded-xl transition-colors"
        :class="isDragOver ? 'bg-amber-50 ring-2 ring-amber-400' : ''"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
    >
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />

        <button
            v-if="!thumbnails.length"
            type="button"
            @click="fileInput?.click()"
            class="w-full min-h-[40px] px-3 py-2 border border-dashed border-slate-300 rounded-xl flex flex-wrap items-center gap-x-2 gap-y-1 text-left text-xs text-slate-500 hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
        >
            <span class="font-medium text-slate-700">＋ 添加参考图片</span>
            <span>支持拖拽或 Ctrl / ⌘ + V 粘贴</span>
        </button>

        <div v-else class="space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="font-medium text-slate-600">参考素材 · {{ thumbnails.length }} 张</span>
                    <span class="text-slate-400">支持拖拽或粘贴</span>
                </div>
                <button type="button" @click="clearAllImages" class="text-slate-400 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded transition-colors">
                    清空全部
                </button>
            </div>

            <div class="flex flex-wrap items-start gap-2">
                <div
                    v-for="(thumbnail, index) in thumbnails"
                    :key="index"
                    class="relative w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                >
                    <img :src="thumbnail" :alt="`参考图 ${index + 1}`" class="w-full h-full object-contain" />
                    <span class="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white font-mono">{{ index + 1 }}</span>
                    <button
                        type="button"
                        @click="removeThumbnail(index)"
                        :aria-label="`移除参考图 ${index + 1}`"
                        title="移除此图"
                        class="absolute top-0 right-0 w-6 h-6 bg-black/60 hover:bg-rose-600 text-white rounded-bl-lg flex items-center justify-center text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white transition-colors"
                    >✕</button>
                </div>
                <button
                    type="button"
                    @click="fileInput?.click()"
                    class="w-[72px] h-[72px] shrink-0 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
                >
                    <span class="text-lg leading-none" aria-hidden="true">＋</span>
                    <span class="text-[11px]">继续添加</span>
                </button>
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

// Serialize batches to preserve reference order and avoid lost concurrent updates.
let pendingUploads = Promise.resolve()
let uploadVersion = 0
const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    const version = uploadVersion
    pendingUploads = pendingUploads.then(async () => {
        const images = await Promise.all(imageFiles.map(file => new Promise<string | null>(resolve => {
            const reader = new FileReader()
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
            reader.onerror = () => resolve(null)
            reader.onabort = () => resolve(null)
            reader.readAsDataURL(file)
        })))
        if (version !== uploadVersion) return
        const loaded = images.filter((image): image is string => image !== null)
        if (loaded.length) emit('update:modelValue', [...props.modelValue, ...loaded])
    })
}

const removeThumbnail = (index: number) => {
    emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

const clearAllImages = () => {
    uploadVersion++
    emit('update:modelValue', [])
}

const onGlobalPaste = (event: ClipboardEvent) => {
    // v-show keeps this component mounted; ignore paste while its workflow is hidden.
    if (!uploadArea.value?.getClientRects().length || event.defaultPrevented) return
    const files = Array.from(event.clipboardData?.items || [])
        .filter(item => item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter((file): file is File => file !== null)
    if (files.length) {
        event.preventDefault()
        handleFiles(files)
    }
}

onMounted(() => window.addEventListener('paste', onGlobalPaste))
onUnmounted(() => {
    uploadVersion++
    window.removeEventListener('paste', onGlobalPaste)
})
</script>
