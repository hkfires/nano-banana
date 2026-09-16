<template>
    <div class="min-h-screen bg-slate-50/70 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900 pb-12">
        <!-- 顶栏：紧凑、精致、毛玻璃 -->
        <header class="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
                <!-- 品牌 Logo -->
                <div class="flex items-center gap-2.5 flex-shrink-0">
                    <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg border border-amber-200/50 shadow-xs">
                        🍌
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="font-bold text-slate-900 text-base tracking-tight">NanoBanana</span>
                        <span class="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                            Studio
                        </span>
                    </div>
                </div>

                <!-- 顶栏中间：端点图像模型选择器 (仅展示获取到的图像模型) -->
                <div class="flex-1 max-w-xl mx-2 hidden md:block">
                    <ModelSelector
                        v-model:model="selectedModel"
                        :models="modelOptions"
                        :model-loading="isFetchingModels"
                        :model-error="modelsError"
                        :has-api-key="Boolean(apiKey.trim())"
                        :can-fetch-models="Boolean(apiKey.trim() && apiEndpoint.trim())"
                        @fetch-models="handleFetchModels"
                    />
                </div>

                <!-- 顶栏右侧：API 状态配置 & GitHub -->
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button
                        @click="showApiModal = true"
                        :class="[
                            'px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border',
                            apiKey
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
                        ]"
                    >
                        <span class="w-1.5 h-1.5 rounded-full" :class="apiKey ? 'bg-emerald-500' : 'bg-rose-500'" />
                        <span class="hidden sm:inline">{{ apiKey ? 'API 已连接' : '配置 API 密钥' }}</span>
                        <span class="sm:hidden">{{ apiKey ? 'API' : '配置' }}</span>
                    </button>

                    <a
                        href="https://github.com/hkfires/nano-banana"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                        title="GitHub 仓库"
                    >
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </div>

            <!-- 移动端顶部模型栏 -->
            <div class="px-4 py-2 border-t border-slate-100 bg-white md:hidden">
                <ModelSelector
                    v-model:model="selectedModel"
                    :models="modelOptions"
                    :model-loading="isFetchingModels"
                    :model-error="modelsError"
                    :has-api-key="Boolean(apiKey.trim())"
                    :can-fetch-models="Boolean(apiKey.trim() && apiEndpoint.trim())"
                    @fetch-models="handleFetchModels"
                />
            </div>
        </header>

        <!-- 主内容创作空间 -->
        <main class="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 py-6">
            <div class="grid lg:grid-cols-12 gap-6 items-start">
                <!-- ================= 左侧：一体化创作 Studio（lg:6列 / xl:5列） ================= -->
                <div class="lg:col-span-6 xl:col-span-5 space-y-4">
                    <!-- 统一创作容器 (Unified Studio Container) -->
                    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
                        <!-- 1. 工作流模式切换 Tabs (文生图 / 图生图) -->
                        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                            <div class="flex bg-slate-100 p-0.5 rounded-xl">
                                <button
                                    @click="activeWorkflow = 'text'"
                                    :class="[
                                        'py-1.5 px-3 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-1.5',
                                        activeWorkflow === 'text'
                                            ? 'bg-white text-slate-900 shadow-xs font-semibold'
                                            : 'text-slate-500 hover:text-slate-900 font-medium'
                                    ]"
                                >
                                    <span>✨</span>
                                    <span>文生图 (Text to Image)</span>
                                </button>
                                <button
                                    @click="activeWorkflow = 'image'"
                                    :class="[
                                        'py-1.5 px-3 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-1.5',
                                        activeWorkflow === 'image'
                                            ? 'bg-white text-slate-900 shadow-xs font-semibold'
                                            : 'text-slate-500 hover:text-slate-900 font-medium'
                                    ]"
                                >
                                    <span>🖼️</span>
                                    <span>图文生图 (Image + Text)</span>
                                    <span
                                        v-if="selectedImages.length"
                                        class="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono font-medium"
                                    >
                                        {{ selectedImages.length }}
                                    </span>
                                </button>
                            </div>

                            <button
                                v-if="activeWorkflow === 'text' ? textToImagePrompt : customPrompt"
                                @click="activeWorkflow === 'text' ? textToImagePrompt = '' : customPrompt = ''"
                                class="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors"
                            >
                                清空
                            </button>
                        </div>

                        <!-- 2. 文生图模式主体 -->
                        <div v-show="activeWorkflow === 'text'" class="space-y-3">
                            <div class="relative">
                                <textarea
                                    v-model="textToImagePrompt"
                                    placeholder="描述期望生成的画面细节（主体、环境、光影、画风与材质等），例如：阳光穿透晨雾洒在金色微缩建筑上，丁达尔光效，吉卜力治愈手绘风，8K 细腻画质..."
                                    rows="4"
                                    class="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl resize-y min-h-[110px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm leading-relaxed transition-colors duration-150"
                                    @keydown.ctrl.enter="handleTextToImageGenerate"
                                    @keydown.meta.enter="handleTextToImageGenerate"
                                />
                                <div class="text-xs text-slate-400 text-right mt-1 font-mono">
                                    {{ textToImagePrompt.length }} 字符
                                </div>
                            </div>

                            <!-- 预置提示词卡片网格 (不再使用横向拉拽，采用卡片式呈现) -->
                            <PresetPrompts
                                @select="handlePresetSelect"
                                @append="handlePresetAppend"
                            />
                        </div>

                        <!-- 3. 图文生图模式主体 -->
                        <div v-show="activeWorkflow === 'image'" class="space-y-3">
                            <!-- 图文生图提示词输入框 (与文生图位置保持一致，视觉对称) -->
                            <div class="relative">
                                <textarea
                                    v-model="customPrompt"
                                    placeholder="输入定向改图要求（例如：保持主体面部特征一致，背景替换为赛博朋克雨夜街道，身披机能装甲，带有微弱霓虹光影...）"
                                    rows="3"
                                    class="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl resize-y min-h-[96px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm leading-relaxed transition-colors duration-150"
                                    @keydown.ctrl.enter="handleGenerate"
                                    @keydown.meta.enter="handleGenerate"
                                />
                                <div class="text-xs text-slate-400 text-right mt-1 font-mono">
                                    {{ customPrompt.length }} 字符
                                </div>
                            </div>

                            <!-- 参考图上传区 -->
                            <ImageUpload v-model="selectedImages" />

                            <!-- 风格预设卡片网格 -->
                            <div>
                                <div class="text-xs font-medium text-slate-600 mb-1.5 flex items-center justify-between">
                                    <span>艺术风格预设：</span>
                                    <span v-if="selectedStyle" class="text-xs text-amber-600 font-medium">
                                        已选: {{ selectedStyleTitle }}
                                    </span>
                                </div>

                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <div
                                        v-for="tpl in styleTemplates"
                                        :key="tpl.id"
                                        @click="selectStyleTemplate(tpl.id)"
                                        :class="[
                                            'p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between shadow-2xs',
                                            selectedStyle === tpl.id
                                                ? 'bg-amber-50/60 border-amber-500 ring-1 ring-amber-500/20'
                                                : 'bg-white hover:bg-slate-50 border-slate-200'
                                        ]"
                                    >
                                        <div class="flex items-center justify-between gap-1 mb-1">
                                            <span class="text-base">{{ tpl.icon || '🎨' }}</span>
                                            <span v-if="selectedStyle === tpl.id" class="text-xs text-amber-600 font-semibold">✓ 已选</span>
                                        </div>
                                        <div>
                                            <h5 class="text-xs font-semibold text-slate-800 truncate mb-0.5">{{ tpl.title }}</h5>
                                            <div class="relative group/tooltip">
                                                <p
                                                    :title="tpl.description"
                                                    class="text-xs text-slate-400 line-clamp-1 leading-tight"
                                                >
                                                    {{ tpl.description }}
                                                </p>

                                                <!-- 悬浮完整显示中文描述 -->
                                                <div
                                                    class="absolute left-0 bottom-full mb-1.5 z-40 w-60 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs leading-relaxed opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-150 pointer-events-none"
                                                >
                                                    <div class="font-semibold text-amber-300 mb-0.5 flex items-center gap-1">
                                                        <span>{{ tpl.icon || '🎨' }}</span>
                                                        <span>{{ tpl.title }}</span>
                                                    </div>
                                                    <div class="text-slate-200 font-normal">
                                                        {{ tpl.description }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Codex 反代渠道参数不生效客观提示 -->
                        <div v-if="showCodexProxyHint" class="mt-2.5 px-3 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>提示：若当前模型来自 Codex 反代渠道，尺寸、分辨率与质量参数均不会生效。</span>
                        </div>

                        <!-- 4. 底部内嵌控制栏（比例 / 参数 / 主生成按钮） -->
                        <div class="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                            <!-- 左侧：比例与高级参数胶囊 -->
                            <div class="flex flex-wrap items-center gap-1.5 text-xs">
                                <!-- 常用比例按钮组 -->
                                <div class="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                                    <button
                                        v-for="r in commonAspectRatios"
                                        :key="r.ratio"
                                        @click="setAspectRatio(r.ratio)"
                                        :class="[
                                            'px-2 py-0.5 rounded-md text-xs font-medium transition-all',
                                            currentAspectRatio === r.ratio
                                                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                                                : 'text-slate-500 hover:text-slate-800'
                                        ]"
                                    >
                                        {{ r.ratio }}
                                    </button>
                                </div>

                                <!-- 单次生成张数胶囊 -->
                                <div class="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg" title="单次生成图片张数">
                                    <span class="text-[10px] text-slate-400 pl-1 select-none font-medium">张数</span>
                                    <button
                                        v-for="count in [1, 2, 4]"
                                        :key="count"
                                        @click="batchCount = count"
                                        :class="[
                                            'px-2 py-0.5 rounded-md text-xs font-medium transition-all',
                                            batchCount === count
                                                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                                                : 'text-slate-500 hover:text-slate-800'
                                        ]"
                                    >
                                        {{ count }}张
                                    </button>
                                </div>

                                <!-- 清晰度档位 (若当前模型支持) -->
                                <div v-if="currentModelCapability?.supportsImageSize" class="relative">
                                    <select
                                        :value="currentModelSettings.imageSize"
                                        @change="handleImageSizeChange(($event.target as HTMLSelectElement).value)"
                                        class="block h-6 pl-2 pr-5 py-0 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none transition-colors"
                                    >
                                        <option v-for="opt in currentModelCapability.imageSizeOptions || []" :key="opt.value" :value="opt.value">
                                            {{ opt.label }}
                                        </option>
                                    </select>
                                    <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px]">
                                        ▼
                                    </div>
                                </div>

                                <!-- 渲染质量档位 (若当前模型支持，如 GPT-Image) -->
                                <div v-if="currentModelCapability?.supportsQuality" class="relative">
                                    <select
                                        :value="currentModelSettings.quality"
                                        @change="handleQualityChange(($event.target as HTMLSelectElement).value)"
                                        class="block h-6 pl-2 pr-5 py-0 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none transition-colors"
                                    >
                                        <option v-for="opt in currentModelCapability.qualityOptions || []" :key="opt.value" :value="opt.value">
                                            {{ opt.label }}
                                        </option>
                                    </select>
                                    <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px]">
                                        ▼
                                    </div>
                                </div>

                                <!-- 输出分辨率 (若当前模型支持，如 Grok Imagine) -->
                                <div v-if="currentModelCapability?.supportsResolution" class="relative">
                                    <select
                                        :value="currentModelSettings.resolution"
                                        @change="handleResolutionChange(($event.target as HTMLSelectElement).value)"
                                        class="block h-6 pl-2 pr-5 py-0 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none transition-colors"
                                    >
                                        <option v-for="opt in currentModelCapability.resolutionOptions || []" :key="opt.value" :value="opt.value">
                                            {{ opt.label }}
                                        </option>
                                    </select>
                                    <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px]">
                                        ▼
                                    </div>
                                </div>

                                <!-- 谷歌搜索联网开关 (若当前模型支持) -->
                                <label
                                    v-if="currentModelCapability?.supportsGoogleSearch"
                                    class="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 bg-slate-100 hover:bg-slate-200/70 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        :checked="currentModelSettings.enableGoogleSearch"
                                        @change="handleToggleGoogleSearch(($event.target as HTMLInputElement).checked)"
                                        class="w-3.5 h-3.5 text-slate-900 border-slate-300 rounded"
                                    />
                                    <span>Google 联网搜索</span>
                                </label>
                            </div>

                            <!-- 右侧：生成操作按钮 (靠右保持平齐) -->
                            <div class="flex items-center gap-2 ml-auto shrink-0">
                                <button
                                    v-if="activeWorkflow === 'text'"
                                    @click="handleTextToImageGenerate"
                                    :disabled="!canGenerateTextImage"
                                    :class="[
                                        'px-5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs',
                                        canGenerateTextImage
                                            ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-[0.98]'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                                    ]"
                                >
                                    <span v-if="!isTextToImageLoading" class="flex items-center gap-1.5">
                                        <span>✨</span>
                                        <span>{{ batchCount > 1 ? `立即生成 (${batchCount}张)` : '立即生成' }}</span>
                                        <span class="text-[10px] opacity-70 font-mono hidden sm:inline">(↵)</span>
                                    </span>
                                    <span v-else class="flex items-center gap-1.5">
                                        <svg class="w-3.5 h-3.5 animate-spin text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>正在生成...</span>
                                    </span>
                                </button>

                                <button
                                    v-else
                                    @click="handleGenerate"
                                    :disabled="!canGenerate"
                                    :class="[
                                        'px-5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs',
                                        canGenerate
                                            ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-[0.98]'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                                    ]"
                                >
                                    <span v-if="!isLoading" class="flex items-center gap-1.5">
                                        <span>🖼️</span>
                                        <span>{{ batchCount > 1 ? `开始重塑 (${batchCount}张)` : '开始图文重塑' }}</span>
                                        <span class="text-[10px] opacity-70 font-mono hidden sm:inline">(↵)</span>
                                    </span>
                                    <span v-else class="flex items-center gap-1.5">
                                        <svg class="w-3.5 h-3.5 animate-spin text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>正在重塑...</span>
                                    </span>
                                </button>
                            </div>
                        </div>

                        <!-- 缺省条件微提示 -->
                        <div v-if="validationTip" class="text-right mt-2 text-xs text-slate-400">
                            {{ validationTip }}
                        </div>
                    </div>
                </div>

                <!-- ================= 右侧：作品画廊 Showcase（lg:6列 / xl:7列） ================= -->
                <div class="lg:col-span-6 xl:col-span-7 sticky lg:top-20">
                    <ResultDisplay
                        :results="displayResults"
                        :loading="displayLoading"
                        :error="displayError"
                        :can-push="canPushDisplayResult"
                        :current-prompt="activeResultPrompt"
                        :history="generationHistory"
                        :batch-total="batchCount"
                        @download="handleDownloadResult"
                        @download-all="handleDownloadAllResults"
                        @push="handlePushDisplayResult"
                        @retry="handleRetry"
                        @open-api-modal="showApiModal = true"
                        @select-history="handleSelectHistory"
                    />
                </div>
            </div>

            <!-- 页脚 -->
            <Footer />
        </main>

        <!-- API 设置弹窗 -->
        <ApiKeyModal
            v-model:is-open="showApiModal"
            v-model:api-key="apiKey"
            v-model:endpoint="apiEndpoint"
            v-model:max-retries="maxRetries"
            :models-count="modelOptions.length"
            :is-fetching-models="isFetchingModels"
            :models-error="modelsError"
            @fetch-models="handleFetchModels"
            @clear-key="handleClearApiKey"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ModelSelector from './components/ModelSelector.vue'
import PresetPrompts from './components/PresetPrompts.vue'
import ImageUpload from './components/ImageUpload.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import ApiKeyModal from './components/ApiKeyModal.vue'
import Footer from './components/Footer.vue'
import { fetchModels, generateImages } from './services/api'
import { styleTemplates } from './data/templates'
import { LocalStorage } from './utils/storage'
import type { GenerateRequest, ModelOption, HistoryRecord } from './types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID, normalizeApiBase } from './config/api'
import { getModelCapability, normalizeModelImageSettings, resolveModelFamily } from './config/modelCapabilities'
import { filterAndProcessRemoteModels, isImageModel } from './config/imageModels'
import type { ModelFamily, ModelImageSettings as ModelImageSettingsType } from './config/modelCapabilities'

const activeWorkflow = ref<'text' | 'image'>('text')

// 同步从本地存储读取初始值，避免异步时序差与无故弹窗
const savedInitKey = LocalStorage.getApiKey()
const savedInitEndpoint = normalizeApiBase(LocalStorage.getApiEndpoint()) || DEFAULT_API_ENDPOINT
const savedInitModel = LocalStorage.getModelId() || ''
const savedInitMaxRetries = LocalStorage.getMaxRetries()
const savedInitBatchCount = LocalStorage.getBatchCount()

const apiKey = ref(savedInitKey)
const apiEndpoint = ref(savedInitEndpoint)
const selectedModel = ref(savedInitModel)
const maxRetries = ref(savedInitMaxRetries)
const batchCount = ref(savedInitBatchCount)
const showApiModal = ref(false)

const modelOptions = ref<ModelOption[]>([])
const isFetchingModels = ref(false)
const modelsError = ref<string | null>(null)
const modelImageSettingsMap = ref<Partial<Record<ModelFamily, ModelImageSettingsType>>>({})

// 文生图
const textToImagePrompt = ref('')
const textToImageResult = ref<string[]>([])
const textToImageError = ref<string | null>(null)
const isTextToImageLoading = ref(false)

// 图生图
const selectedImages = ref<string[]>([])
const customPrompt = ref('')
const selectedStyle = computed(() => styleTemplates.find(template => template.prompt === customPrompt.value)?.id || '')
const result = ref<string[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)

const latestResultSource = ref<'text' | 'image' | null>(null)
const activeResultPrompt = ref('')
const generationHistory = ref<HistoryRecord[]>([])

const showCodexProxyHint = computed(() => {
    const family = currentModelCapability.value?.family
    return family === 'gpt-image-2' || family === 'gpt-image-2.5'
})

const commonAspectRatios = [
    { ratio: '1:1', label: '方形' },
    { ratio: '16:9', label: '横屏' },
    { ratio: '9:16', label: '竖屏' },
    { ratio: '4:3', label: '4:3' },
    { ratio: '3:4', label: '3:4' }
]

let hasSyncedInitialEndpoint = false

onMounted(() => {
    modelImageSettingsMap.value = LocalStorage.getModelImageSettingsMap()

    // 启动时直接从本地缓存恢复端点真实图像模型
    restoreModelOptionsFromCache(apiEndpoint.value)

    hasSyncedInitialEndpoint = true

    window.addEventListener('keydown', onGlobalKeyDown)

    // 如果用户已配置端点和密钥，且当前没有模型缓存，在后台自动静默拉取真实模型，无需手动弹窗！
    if (apiKey.value.trim() && apiEndpoint.value.trim() && modelOptions.value.length === 0) {
        handleFetchModels()
    }
})

onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKeyDown)
})

const onGlobalKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (activeWorkflow.value === 'text' && canGenerateTextImage.value) {
            e.preventDefault()
            handleTextToImageGenerate()
        } else if (activeWorkflow.value === 'image' && canGenerate.value) {
            e.preventDefault()
            handleGenerate()
        }
    }
}

watch(
    maxRetries,
    (val: number) => {
        LocalStorage.saveMaxRetries(val)
    }
)

watch(
    batchCount,
    (val: number) => {
        LocalStorage.saveBatchCount(val)
    }
)

watch(
    apiKey,
    (newApiKey: string) => {
        if (!hasSyncedInitialEndpoint) return
        const trimmed = newApiKey.trim()
        if (trimmed) {
            LocalStorage.saveApiKey(trimmed)
        } else {
            LocalStorage.clearApiKey()
        }
    },
    { immediate: false }
)

watch(
    apiEndpoint,
    (newEndpoint: string, previousEndpoint?: string) => {
        const trimmed = newEndpoint.trim()
        const previousTrimmed = (previousEndpoint || '').trim()

        if (trimmed) {
            LocalStorage.saveApiEndpoint(trimmed)
        } else {
            LocalStorage.clearApiEndpoint()
        }

        if (!hasSyncedInitialEndpoint) return

        if (trimmed !== previousTrimmed) {
            modelOptions.value = []
            modelsError.value = null
            if (previousTrimmed) {
                selectedModel.value = DEFAULT_MODEL_ID
                LocalStorage.clearModelCache(previousTrimmed)
            }
        }
    },
    { immediate: false }
)

watch(
    selectedModel,
    (newModel: string) => {
        const trimmed = newModel.trim()
        if (trimmed) {
            LocalStorage.saveModelId(trimmed)
            // 关键：切换模型时立即主动同步并规范化该模型的专有配置，立刻触发视图响应式刷新！
            const family = resolveModelFamily(trimmed)
            if (family !== 'unsupported') {
                const existing = modelImageSettingsMap.value[family]
                const normalized = normalizeModelImageSettings(family, existing)
                modelImageSettingsMap.value = {
                    ...modelImageSettingsMap.value,
                    [family]: normalized
                }
                LocalStorage.saveModelImageSettings(family, normalized)
            }
        } else {
            LocalStorage.clearModelId()
        }
    },
    { immediate: false }
)

watch(
    textToImagePrompt,
    () => {
        if (textToImageError.value) {
            textToImageError.value = null
        }
    },
    { immediate: false }
)

// 核心：仅从端点拉取模型，并严格过滤非图像模型！只显示获取到的模型！
const handleFetchModels = async () => {
    if (!apiKey.value.trim() || !apiEndpoint.value.trim()) {
        showApiModal.value = true
        return
    }

    isFetchingModels.value = true
    modelsError.value = null

    try {
        const rawModels = await fetchModels(apiKey.value, apiEndpoint.value)
        // 关键过滤：仅保留端点返回的真实图像模型
        const filtered = filterAndProcessRemoteModels(rawModels)

        if (!filtered.length) {
            throw new Error('端点已响应，但未检测到支持图像生成的模型')
        }

        modelOptions.value = filtered
        LocalStorage.saveModelCache(apiEndpoint.value, filtered)

        // 如果当前选中的模型不在端点返回列表中，自动切换到端点第一个可用图像模型
        const exists = filtered.some(o => o.id === selectedModel.value)
        if (!exists) {
            selectedModel.value = filtered[0].id
        }
    } catch (fetchError) {
        modelsError.value = fetchError instanceof Error ? fetchError.message : '无法获取模型列表'
    } finally {
        isFetchingModels.value = false
    }
}

const handleClearApiKey = () => {
    LocalStorage.clearApiKey()
    LocalStorage.clearModelId()
    apiKey.value = ''
    selectedModel.value = DEFAULT_MODEL_ID
}

const restoreModelOptionsFromCache = (endpoint: string) => {
    const trimmedEndpoint = endpoint.trim()
    if (!trimmedEndpoint) return

    const cached = LocalStorage.getModelCache(trimmedEndpoint)
    if (!cached.length) return

    // 严格确保缓存中的模型也是图像模型
    const valid = cached.filter(m => isImageModel(m))
    modelOptions.value = valid

    // 恢复用户保存的模型ID，前提是该模型必须在获取到的图像模型列表中
    const savedModelId = (LocalStorage.getModelId() || '').trim().toLowerCase()
    const matched = valid.find(m => m.id.toLowerCase() === savedModelId)
    if (matched) {
        selectedModel.value = matched.id
    } else if (valid.length > 0) {
        selectedModel.value = valid[0].id
    } else {
        selectedModel.value = ''
    }
}

const handlePresetSelect = (prompt: string) => {
    if (activeWorkflow.value === 'text') {
        textToImagePrompt.value = prompt
    } else {
        customPrompt.value = prompt
    }
}

const handlePresetAppend = (prompt: string) => {
    const targetRef = activeWorkflow.value === 'text' ? textToImagePrompt : customPrompt
    const current = targetRef.value.trimEnd()
    if (!current) {
        targetRef.value = prompt
        return
    }
    // 智能检测标点符号，自然追加到末尾
    if (/[,，;；\n]$/.test(current)) {
        targetRef.value = `${current} ${prompt}`
    } else {
        targetRef.value = `${current}, ${prompt}`
    }
}

const selectStyleTemplate = (id: string) => {
    const template = styleTemplates.find(template => template.id === id)
    if (template) customPrompt.value = template.prompt
}

const selectedStyleTitle = computed(() => {
    const found = styleTemplates.find(t => t.id === selectedStyle.value)
    return found ? found.title : ''
})

const displayLoading = computed(() => {
    if (latestResultSource.value === 'image') return isLoading.value
    if (latestResultSource.value === 'text') return isTextToImageLoading.value
    return isLoading.value || isTextToImageLoading.value
})

const displayResults = computed(() => {
    if (latestResultSource.value === 'image') return result.value
    if (latestResultSource.value === 'text') return textToImageResult.value
    return result.value.length > 0 ? result.value : textToImageResult.value
})

const displayError = computed(() => {
    if (latestResultSource.value === 'image') return error.value
    if (latestResultSource.value === 'text') return textToImageError.value
    return error.value || textToImageError.value
})

const canPushDisplayResult = computed(() => Boolean(displayResults.value.length > 0))

// 严格验证当前选择的模型是否有效且真正存在于端点返回的图像模型列表中
const isModelValid = computed(() => {
    const cur = selectedModel.value.trim().toLowerCase()
    if (!cur) return false
    return modelOptions.value.some(m => m.id.trim().toLowerCase() === cur)
})

const canGenerateTextImage = computed(
    () =>
        apiKey.value.trim() !== '' &&
        apiEndpoint.value.trim() !== '' &&
        isModelValid.value &&
        textToImagePrompt.value.trim() !== '' &&
        !isTextToImageLoading.value
)

const canGenerate = computed(
    () =>
        apiKey.value.trim() !== '' &&
        apiEndpoint.value.trim() !== '' &&
        isModelValid.value &&
        selectedImages.value.length > 0 &&
        customPrompt.value.trim() !== '' &&
        !isLoading.value
)

const validationTip = computed(() => {
    if (!apiKey.value.trim()) return '请先配置 API 密钥'
    if (!apiEndpoint.value.trim()) return '请先配置 API 服务端点'
    if (!isModelValid.value) return '请选择生图模型'
    if (activeWorkflow.value === 'text') {
        if (!textToImagePrompt.value.trim()) return '请输入画面描述或点选上方灵感'
    } else {
        if (selectedImages.value.length === 0) return '请先上传至少一张参考原图'
        if (!customPrompt.value.trim()) return '请选择预设风格或填写改图要求'
    }
    return null
})

// 模型参数
const currentModelFamily = computed(() => resolveModelFamily(selectedModel.value))
const currentModelCapability = computed(() => getModelCapability(selectedModel.value))

const currentModelSettings = computed(() => {
    const family = currentModelFamily.value
    if (family === 'unsupported') {
        return { aspectRatio: '1:1' }
    }

    const cached = modelImageSettingsMap.value[family]
    return normalizeModelImageSettings(family, cached)
})

const currentAspectRatio = computed(() => currentModelSettings.value.aspectRatio || '1:1')

const setAspectRatio = (ratio: string) => {
    handleModelSettingsUpdate({ ...currentModelSettings.value, aspectRatio: ratio })
}

const handleImageSizeChange = (imageSize: string) => {
    handleModelSettingsUpdate({ ...currentModelSettings.value, imageSize })
}

const handleQualityChange = (quality: string) => {
    handleModelSettingsUpdate({ ...currentModelSettings.value, quality })
}

const handleResolutionChange = (resolution: string) => {
    handleModelSettingsUpdate({ ...currentModelSettings.value, resolution })
}

const handleToggleGoogleSearch = (enableGoogleSearch: boolean) => {
    handleModelSettingsUpdate({ ...currentModelSettings.value, enableGoogleSearch })
}

const handleModelSettingsUpdate = (settings: ModelImageSettingsType) => {
    const family = currentModelFamily.value
    if (family === 'unsupported') return

    const normalized = normalizeModelImageSettings(family, settings)
    modelImageSettingsMap.value = {
        ...modelImageSettingsMap.value,
        [family]: normalized
    }
    LocalStorage.saveModelImageSettings(family, normalized)
}

const applyModelSettingsToRequest = (request: GenerateRequest) => {
    const capability = currentModelCapability.value
    if (!capability) return

    const settings = currentModelSettings.value

    if (capability.supportsAspectRatio) {
        request.aspectRatio = settings.aspectRatio
    }
    if (capability.supportsImageSize && settings.imageSize) {
        request.imageSize = settings.imageSize
    }
    if (capability.supportsQuality && settings.quality) {
        request.quality = settings.quality
    }
    if (capability.supportsGoogleSearch) {
        request.enableGoogleSearch = Boolean(settings.enableGoogleSearch)
    }
    if (capability.supportsResolution && settings.resolution) {
        request.resolution = settings.resolution
    }
}

const handleTextToImageGenerate = async () => {
    if (!canGenerateTextImage.value) return

    latestResultSource.value = 'text'
    isTextToImageLoading.value = true
    textToImageError.value = null
    textToImageResult.value = []
    activeResultPrompt.value = textToImagePrompt.value

    try {
        const request: GenerateRequest = {
            prompt: textToImagePrompt.value,
            images: [],
            apikey: apiKey.value,
            endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
            model: selectedModel.value.trim(),
            maxRetries: maxRetries.value,
            numOutputs: batchCount.value
        }

        applyModelSettingsToRequest(request)

        const response = await generateImages(request, maxRetries.value, (urls) => {
            textToImageResult.value = urls
        })
        textToImageResult.value = response.imageUrls
        latestResultSource.value = 'text'

        if (response.imageUrls.length > 0) {
            generationHistory.value.unshift({
                id: `history-${Date.now()}`,
                timestamp: Date.now(),
                type: 'text',
                prompt: textToImagePrompt.value,
                imageUrls: response.imageUrls,
                model: selectedModel.value,
                aspectRatio: currentModelSettings.value.aspectRatio
            })
            if (generationHistory.value.length > 10) {
                generationHistory.value.pop()
            }
        }
    } catch (err) {
        textToImageError.value = err instanceof Error ? err.message : '生成失败'
        textToImageResult.value = []
    } finally {
        isTextToImageLoading.value = false
    }
}

const handleGenerate = async () => {
    if (!canGenerate.value) return

    latestResultSource.value = 'image'
    isLoading.value = true
    error.value = null
    result.value = []

    try {
        const prompt = customPrompt.value

        activeResultPrompt.value = prompt

        const request: GenerateRequest = {
            prompt,
            images: selectedImages.value,
            apikey: apiKey.value,
            endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
            model: selectedModel.value.trim(),
            maxRetries: maxRetries.value,
            numOutputs: batchCount.value
        }

        applyModelSettingsToRequest(request)

        const response = await generateImages(request, maxRetries.value, (urls) => {
            result.value = urls
        })
        result.value = response.imageUrls
        latestResultSource.value = 'image'

        if (response.imageUrls.length > 0) {
            generationHistory.value.unshift({
                id: `history-${Date.now()}`,
                timestamp: Date.now(),
                type: 'image',
                prompt,
                imageUrls: response.imageUrls,
                model: selectedModel.value,
                inputImages: [...selectedImages.value],
                aspectRatio: currentModelSettings.value.aspectRatio
            })
            if (generationHistory.value.length > 10) {
                generationHistory.value.pop()
            }
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : '生成失败'
        result.value = []
    } finally {
        isLoading.value = false
    }
}

const handleRetry = () => {
    if (latestResultSource.value === 'text') {
        handleTextToImageGenerate()
    } else {
        handleGenerate()
    }
}

const handlePushDisplayResult = (image: string) => {
    if (!image) return
    const filtered = selectedImages.value.filter(existing => existing !== image)
    selectedImages.value = [image, ...filtered]
    activeWorkflow.value = 'image'
}

const handleSelectHistory = (item: HistoryRecord) => {
    latestResultSource.value = item.type
    activeResultPrompt.value = item.prompt

    if (item.type === 'text') {
        textToImageResult.value = item.imageUrls
        textToImagePrompt.value = item.prompt
    } else {
        result.value = item.imageUrls
        if (item.inputImages?.length) {
            selectedImages.value = item.inputImages
        }
        customPrompt.value = item.prompt
    }

    if (item.model) {
        selectedModel.value = item.model
    }
}

const handleDownloadResult = async (image: string) => {
    if (!image || typeof window === 'undefined') return

    let downloadUrl = image
    let revokeUrl: string | null = null

    try {
        if (!image.startsWith('data:')) {
            const response = await fetch(image)
            const blob = await response.blob()
            downloadUrl = URL.createObjectURL(blob)
            revokeUrl = downloadUrl
        }

        const link = document.createElement('a')
        const dataMatch = image.match(/^data:image\/([a-zA-Z0-9+]+);/)
        const extension = dataMatch ? dataMatch[1] : 'png'

        link.href = downloadUrl
        link.download = `nanobanana-${Date.now()}.${extension}`
        link.rel = 'noopener'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        if (revokeUrl) {
            URL.revokeObjectURL(revokeUrl)
        }
    } catch {
        window.open(image, '_blank', 'noopener')
    }
}

const handleDownloadAllResults = async (images: string[]) => {
    if (!images || !images.length) return
    for (let i = 0; i < images.length; i++) {
        await handleDownloadResult(images[i])
        if (i < images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 350))
        }
    }
}
</script>
