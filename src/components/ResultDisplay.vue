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

            <!-- Result Image -->
            <div v-else-if="result" class="w-full h-full flex items-center justify-center relative">
                <img :src="result" alt="生成的艺术作品" class="max-w-full max-h-[600px] rounded-lg border-2 border-black shadow-lg object-contain" />
                <div class="absolute bottom-4 right-4 flex flex-col gap-2 items-stretch">
                    <button
                        v-if="canPush"
                        @click="$emit('push')"
                        class="px-4 py-2 bg-green-300 text-black font-bold border-2 border-black rounded-lg shadow-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2"
                    >
                        🎨 二次创作
                    </button>
                    <button
                        @click="$emit('download')"
                        class="px-4 py-2 bg-yellow-300 text-black font-bold border-2 border-black rounded-lg shadow-lg hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                    >
                        ⬇️ 下载图片
                    </button>
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
defineProps<{
    result: string | null
    loading: boolean
    error: string | null
    canPush: boolean
}>()

defineEmits<{
    download: []
    push: []
}>()
</script>
