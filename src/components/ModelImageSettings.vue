<template>
    <div v-if="capability" class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        <!-- 头部折叠触发条 -->
        <div class="flex items-center justify-between gap-3 cursor-pointer select-none" @click="isOpen = !isOpen">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-semibold">
                    📐
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-slate-800 leading-tight">生图尺寸与参数配置</h4>
                    <p class="text-xs text-slate-500">
                        画幅比例: <span class="font-semibold text-slate-700">{{ settings.aspectRatio }}</span>
                        <span v-if="settings.imageSize"> · {{ settings.imageSize }} 档位</span>
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <span class="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    {{ capability.categoryLabel }}
                </span>
                <svg
                    :class="['w-4 h-4 text-slate-400 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        <!-- 展开内容 -->
        <div v-show="isOpen" class="mt-3.5 pt-3.5 border-t border-slate-100 space-y-3.5">
            <!-- 比例快捷选择 -->
            <div v-if="capability.supportsAspectRatio">
                <div class="flex items-center justify-between text-xs text-slate-600 mb-2">
                    <span class="font-medium">画面画幅比例：</span>
                    <span class="text-[10px] text-slate-400 font-mono">
                        {{ capability.aspectRatioParam === 'size' ? '像素尺寸换算' : 'aspect_ratio 传参' }}
                    </span>
                </div>

                <!-- 常见比例药丸卡片 -->
                <div class="grid grid-cols-5 gap-1.5 mb-2.5">
                    <button
                        v-for="preset in quickRatios"
                        :key="preset.ratio"
                        @click="updateSettings({ aspectRatio: preset.ratio })"
                        :class="[
                            'py-1.5 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center',
                            settings.aspectRatio === preset.ratio
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-600'
                        ]"
                    >
                        <div
                            class="border rounded-xs mb-1"
                            :class="settings.aspectRatio === preset.ratio ? 'border-white bg-white/20' : 'border-slate-400 bg-white'"
                            :style="{ width: preset.boxW, height: preset.boxH }"
                        />
                        <span class="text-[11px] font-semibold">{{ preset.ratio }}</span>
                        <span class="text-[9px] opacity-75">{{ preset.label }}</span>
                    </button>
                </div>

                <!-- 完整比例下拉 -->
                <select
                    :value="settings.aspectRatio"
                    @change="updateSettings({ aspectRatio: ($event.target as HTMLSelectElement).value })"
                    class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                    <option v-for="option in aspectRatioOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>

            <!-- 清晰度/画质/扩展配置 -->
            <div
                v-if="capability.supportsImageSize || capability.supportsQuality || capability.supportsGoogleSearch || capability.supportsResolution"
                class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100"
            >
                <!-- 分辨率档位 -->
                <div v-if="capability.supportsImageSize">
                    <label class="block text-xs font-medium text-slate-700 mb-1">清晰度档位 (Image Size)</label>
                    <select
                        :value="settings.imageSize"
                        @change="handleImageSizeChange(($event.target as HTMLSelectElement).value)"
                        class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                        <option v-for="option in capability.imageSizeOptions || []" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <!-- 画质精细度 -->
                <div v-if="capability.supportsQuality">
                    <label class="block text-xs font-medium text-slate-700 mb-1">渲染画质 (Quality)</label>
                    <select
                        :value="settings.quality"
                        @change="updateSettings({ quality: ($event.target as HTMLSelectElement).value })"
                        class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                        <option v-for="option in capability.qualityOptions || []" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <!-- 分辨率 -->
                <div v-if="capability.supportsResolution">
                    <label class="block text-xs font-medium text-slate-700 mb-1">分辨率 (Resolution)</label>
                    <select
                        :value="settings.resolution"
                        @change="updateSettings({ resolution: ($event.target as HTMLSelectElement).value })"
                        class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                        <option v-for="option in capability.resolutionOptions || []" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <!-- 谷歌搜索联网开关 -->
                <div v-if="capability.supportsGoogleSearch" class="sm:col-span-2">
                    <label class="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/60 transition-colors">
                        <input
                            type="checkbox"
                            :checked="settings.enableGoogleSearch"
                            @change="updateSettings({ enableGoogleSearch: ($event.target as HTMLInputElement).checked })"
                            class="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-amber-500/20"
                        />
                        <span class="text-xs text-slate-700 font-medium">🔍 启用 Google 搜索 Grounding 辅助生成</span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAspectRatioOptions, getModelCapability, isSupportedModelFamily, normalizeModelImageSettings } from '../config/modelCapabilities'
import type { ModelImageSettings } from '../config/modelCapabilities'

const props = defineProps<{
    modelId: string
    settings: ModelImageSettings
}>()

const emit = defineEmits<{
    'update:settings': [value: ModelImageSettings]
}>()

const isOpen = ref(false)

const quickRatios = [
    { ratio: '1:1', label: '方形', boxW: '12px', boxH: '12px' },
    { ratio: '16:9', label: '横屏壁纸', boxW: '16px', boxH: '9px' },
    { ratio: '9:16', label: '手机竖屏', boxW: '9px', boxH: '16px' },
    { ratio: '4:3', label: '经典横版', boxW: '14px', boxH: '10px' },
    { ratio: '3:4', label: '经典竖版', boxW: '10px', boxH: '14px' }
]

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
