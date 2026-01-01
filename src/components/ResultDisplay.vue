<template>
    <div class="bg-white border-4 border-black border-t-0 rounded-b-lg p-4 shadow-lg min-h-[400px] flex flex-col">
        <div class="flex-1 bg-gray-50 border-2 border-black rounded-lg p-6 flex items-center justify-center">
            <!-- Loading State -->
            <div v-if="loading" class="text-center">
                <div class="w-12 h-12 border-4 border-yellow-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                <p class="font-bold text-base flex items-center justify-center gap-2">🍌 正在创造魔法...</p>
                <p class="text-gray-600">请稍等片刻</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center">
                <div class="text-red-500 text-6xl mb-4">🍌💥</div>
                <p class="text-red-600 font-bold text-base mb-2">哎呀！出了点问题</p>
                <p class="text-gray-600 text-sm">{{ error }}</p>
            </div>

            <!-- Result Images -->
            <div v-else-if="results && results.length > 0" class="w-full">
                <div class="grid gap-4" :class="gridClass">
                    <div v-for="(img, index) in results" :key="index" class="relative group">
                        <img :src="img" alt="生成的艺术作品" class="w-full rounded-lg border-2 border-black shadow-lg object-contain" />
                        <div class="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                v-if="canPush"
                                @click="$emit('push', img)"
                                class="px-3 py-1 bg-green-300 text-black font-bold border-2 border-black rounded-lg shadow-lg hover:bg-green-400 text-sm"
                            >
                                🎨 二次创作
                            </button>
                            <button
                                @click="$emit('download', img)"
                                class="px-3 py-1 bg-yellow-300 text-black font-bold border-2 border-black rounded-lg shadow-lg hover:bg-yellow-400 text-sm"
                            >
                                ⬇️ 下载
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center">
                <div class="w-12 h-12 border-4 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span class="text-2xl">🍌</span>
                </div>
                <h3 class="font-bold text-base mb-2 flex items-center justify-center gap-2">🍌 等待魔法开始...</h3>
                <p class="text-gray-600">上传图片并选择风格开始创作</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    results: string[]
    loading: boolean
    error: string | null
    canPush: boolean
}>()

const gridClass = computed(() => {
    const count = props.results.length
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    return 'grid-cols-3'
})

defineEmits<{
    download: [image: string]
    push: [image: string]
}>()
</script>
