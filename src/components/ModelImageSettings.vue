<template>
    <div v-if="capability" class="flex flex-col gap-4">
        <div v-if="capability.supportsAspectRatio" class="flex flex-col">
            <div class="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">
                📐 图像宽高比
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
                <p class="text-xs text-gray-500 mt-2">💡 该设置会单独保存到当前模型：{{ capability.label }}</p>
            </div>
        </div>

        <div v-if="capability.supportsImageSize || capability.supportsGoogleSearch || capability.supportsResolution" class="flex flex-col">
            <div class="bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold px-4 py-2 rounded-t-lg border-4 border-black border-b-0 flex items-center gap-2">
                ⚙️ 模型专属参数
            </div>
            <div class="bg-white border-4 border-black border-t-0 rounded-b-lg p-4 shadow-lg space-y-4">
                <div v-if="capability.supportsImageSize">
                    <label class="block text-sm font-bold text-gray-800 mb-2">📏 图像尺寸</label>
                    <select
                        :value="settings.imageSize"
                        @change="handleImageSizeChange(($event.target as HTMLSelectElement).value)"
                        class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
                    >
                        <option v-for="option in capability.imageSizeOptions || []" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div v-if="capability.supportsResolution">
                    <label class="block text-sm font-bold text-gray-800 mb-2">✨ 输出质量</label>
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
                        <span class="text-sm font-bold text-gray-800">🔍 启用谷歌搜索</span>
                    </label>
                    <p class="text-xs text-gray-500 mt-1 ml-7">允许模型使用谷歌搜索获取最新信息来生成图像</p>
                </div>

                <p class="text-xs text-gray-500">💡 这些参数只对 {{ capability.label }} 生效，并会单独记住</p>
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