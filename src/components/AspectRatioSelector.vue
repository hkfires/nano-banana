<template>
    <div class="bg-white border-4 border-black border-t-0 rounded-b-lg p-4 shadow-lg">
        <label class="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            📐 图像宽高比
        </label>
        <select
            :value="modelValue"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
        >
            <option v-for="option in aspectRatioOptions" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
        <p class="text-xs text-gray-500 mt-2">
            💡 该设置同时作用于「文生图」与「图文生图」功能
        </p>
    </div>
</template>

<script setup lang="ts">
interface AspectRatioOption {
    value: string
    label: string
    resolution: string
}

defineProps<{
    modelValue: string
}>()

defineEmits<{
    'update:modelValue': [value: string]
}>()

const aspectRatioOptions: AspectRatioOption[] = [
    { value: '1:1', label: '1:1 - 1024x1024', resolution: '1024x1024' },
    { value: '2:3', label: '2:3 - 832x1248', resolution: '832x1248' },
    { value: '3:2', label: '3:2 - 1248x832', resolution: '1248x832' },
    { value: '3:4', label: '3:4 - 864x1184', resolution: '864x1184' },
    { value: '4:3', label: '4:3 - 1184x864', resolution: '1184x864' },
    { value: '4:5', label: '4:5 - 896x1152', resolution: '896x1152' },
    { value: '5:4', label: '5:4 - 1152x896', resolution: '1152x896' },
    { value: '9:16', label: '9:16 - 768x1344', resolution: '768x1344' },
    { value: '16:9', label: '16:9 - 1344x768', resolution: '1344x768' },
    { value: '21:9', label: '21:9 - 1536x672', resolution: '1536x672' }
]
</script>
