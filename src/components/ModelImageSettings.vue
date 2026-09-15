<template>
    <div v-if="capability" class="flex flex-col gap-4">
        <!-- 宽高比 / 尺寸模式配置卡片 -->
        <div v-if="capability.supportsAspectRatio" class="flex flex-col">
            <div class="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <span>📐</span>
                    <span>图像比例与尺寸</span>
                </div>
                <span class="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
                    {{ capability.aspectRatioParam === 'size' ? '像素尺寸映射 (Size)' : '动态比例 (aspect_ratio)' }}
                </span>
            </div>
            <div class="bg-white border-4 border-black border-t-0 rounded-b-lg p-4 shadow-lg">
                <select
                    :value="settings.aspectRatio"
                    @change="updateSettings({ aspectRatio: ($event.target as HTMLSelectElement).value })"
                    class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
                >
                    <option v-for="option in aspectRatioOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>

                <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>💡 参数模型：{{ capability.label }}</span>
                    <span v-if="capability.aspectRatioParam === 'size'" class="text-purple-600 font-medium">
                        自动换算为像素分辨率传参
                    </span>
                </div>
            </div>
        </div>

        <!-- 模型专属参数配置卡片 -->
        <div v-if="capability.supportsImageSize || capability.supportsQuality || capability.supportsGoogleSearch || capability.supportsResolution" class="flex flex-col">
            <div class="bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <span>⚙️</span>
                    <span>模型专属画质与扩展参数</span>
                </div>
                <span class="text-xs bg-white/20 px-2 py-0.5 rounded">
                    {{ capability.categoryLabel }}
                </span>
            </div>
            <div class="bg-white border-4 border-black border-t-0 rounded-b-lg p-4 shadow-lg space-y-4">
                <div v-if="capability.supportsImageSize">
                    <label class="block text-sm font-bold text-gray-800 mb-2">📏 图像清晰度档位 (Image Size)</label>
                    <select
                        :value="settings.imageSize"
                        @change="handleImageSizeChange(($event.target as HTMLSelectElement).value)"
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
                    >
                        <option v-for="option in capability.imageSizeOptions || []" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">切换 1K/2K/4K 档位将联动改变上述各种比例的实际生成像素</p>
                </div>

                <div v-if="capability.supportsQuality">
                    <label class="block text-sm font-bold text-gray-800 mb-2">🎨 渲染画质精细度 (Quality)</label>
                    <select
                        :value="settings.quality"
                        @change="updateSettings({ quality: ($event.target as HTMLSelectElement).value })"
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
                    >
                        <option v-for="option in capability.qualityOptions || []" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">控制模型生成细节算力投入：high 细节丰富、medium 平衡、low 极速低开销</p>
                </div>

                <div v-if="capability.supportsResolution">
                    <label class="block text-sm font-bold text-gray-800 mb-2">✨ 渲染质量 (Resolution)</label>
                    <select
                        :value="settings.resolution"
                        @change="updateSettings({ resolution: ($event.target as HTMLSelectElement).value })"
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
                    >
                        <option v-for="option in capability.resolutionOptions || []" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div v-if="capability.supportsGoogleSearch">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            :checked="settings.enableGoogleSearch"
                            @change="updateSettings({ enableGoogleSearch: ($event.target as HTMLInputElement).checked })"
                            class="w-4 h-4 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span class="text-sm font-bold text-gray-800">🔍 启用谷歌搜索 (Google Search Grounding)</span>
                    </label>
                    <p class="text-xs text-gray-500 mt-1 ml-7">允许模型在生图前通过谷歌搜索获取最新资讯与现实特征</p>
                </div>

                <p class="text-xs text-gray-500 border-t border-gray-100 pt-2">
                    💡 该分类参数仅对 {{ capability.label }} 生效，已在本地独立记忆。
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAspectRatioOptions, getModelCapability, isSupportedModelFamily, normalizeModelImageSettings } from '../config/modelCapabilities'
import type { ModelImageSettings } from '../config/modelCapabilities'

const props = defineProps<{
    modelId: string
    settings: ModelImageSettings
}>()

const emit = defineEmits<{
    'update:settings': [value: ModelImageSettings]
}>()

const capability = computed(() => getModelCapability(props.modelId))

const aspectRatioOptions = computed(() => {
    if (!capability.value || !isSupportedModelFamily(capability.value.family)) return []
    return getAspectRatioOptions(capability.value.family, props.settings.imageSize)
})

const updateSettings = (patch: Partial<ModelImageSettings>) => {
    if (!capability.value || !isSupportedModelFamily(capability.value.family)) return
    const next = normalizeModelImageSettings(capability.value.family, {
        ...props.settings,
        ...patch
    })
    emit('update:settings', next)
}

const handleImageSizeChange = (imageSize: string) => {
    updateSettings({ imageSize })
}
</script>
