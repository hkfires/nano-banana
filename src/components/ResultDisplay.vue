<template>
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col h-full min-h-[500px] transition-all">
        <!-- 头部轻量状态栏：操作与视图切换 -->
        <div class="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
            <!-- 左侧：标题与数量/进度徽章 -->
            <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center gap-1.5">
                    <span class="text-sm font-semibold text-slate-800 tracking-tight">作品画廊</span>
                    <span v-if="results && results.length" class="text-xs font-mono font-medium px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full">
                        {{ results.length }} 张作品
                    </span>
                </div>

                <!-- 生成中微进度 -->
                <span
                    v-if="loading && batchTotal && batchTotal > 1"
                    class="text-[11px] text-amber-600 bg-amber-50/80 px-2 py-0.5 rounded-md font-mono flex items-center gap-1"
                >
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>并行渲染中 ({{ results.length }}/{{ batchTotal }})</span>
                </span>
            </div>

            <!-- 右侧：工具按钮与视图模式切换 -->
            <div class="flex items-center gap-2 flex-wrap">
                <!-- 多图模式切换器 (当有2张及以上成果时展示) -->
                <div v-if="results && results.length > 1" class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                    <button
                        @click="viewMode = 'grid'"
                        :class="[
                            'px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
                            viewMode === 'grid'
                                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                                : 'text-slate-500 hover:text-slate-800'
                        ]"
                        title="平铺查看全部图片"
                    >
                        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                        </svg>
                        <span>平铺</span>
                    </button>
                    <button
                        @click="viewMode = 'focus'"
                        :class="[
                            'px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
                            viewMode === 'focus'
                                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                                : 'text-slate-500 hover:text-slate-800'
                        ]"
                        title="大图逐张查看"
                    >
                        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                            <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2z"/>
                            <path d="M10.648 7.646a.5.5 0 0 1 .577-.093L14 9.15v2.35H2V10.5l3.146-3.146a.5.5 0 0 1 .708 0l2.5 2.5 2.294-2.208z"/>
                            <circle cx="5" cy="5.5" r="1"/>
                        </svg>
                        <span>大图</span>
                    </button>
                </div>

                <!-- 一键打包/全部下载 -->
                <button
                    v-if="results && results.length > 1"
                    @click="handleDownloadAll"
                    :disabled="isDownloadingAll"
                    class="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg transition-colors flex items-center gap-1 border border-slate-200/50"
                    title="一次性下载当前生成的所有图片"
                >
                    <span>{{ isDownloadingAll ? '⏳' : '⬇️' }}</span>
                    <span>{{ isDownloadingAll ? '下载中...' : '全部下载' }}</span>
                </button>

                <!-- 查看 Prompt 按钮 -->
                <button
                    v-if="currentPrompt && results && results.length > 0"
                    @click="showPromptModal = true"
                    class="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg font-medium transition-colors flex items-center gap-1"
                    title="查看并复制本次生成所使用的提示词"
                >
                    <span>📜</span>
                    <span class="hidden sm:inline">Prompt</span>
                </button>
            </div>
        </div>

        <!-- 主内容画廊展示区 -->
        <div class="flex-1 flex flex-col justify-center items-center rounded-xl bg-slate-50/50 border border-slate-100 p-3 sm:p-4 relative overflow-hidden min-h-[380px]">
            <!-- 1. 加载中状态 (Loading) -->
            <div v-if="loading && results.length === 0" class="flex flex-col items-center justify-center text-center py-12 px-4 w-full">
                <!-- 单张或未拿到任何图片时的加载骨架 -->
                <div class="w-11 h-11 border-3 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-3.5" />
                <h4 class="text-sm font-semibold text-slate-800 mb-1">
                    {{ batchTotal && batchTotal > 1 ? `正在并行渲染 ${batchTotal} 张艺术画面...` : '正在生成画面...' }}
                </h4>
                <p class="text-xs text-slate-400 mb-3 font-mono">已用时 {{ elapsedTime }} 秒</p>

                <!-- 多图并发骨架占位屏 (自适应 1-8 张) -->
                <div
                    v-if="batchTotal && batchTotal > 1"
                    class="grid gap-2.5 w-full max-w-lg my-2"
                    :class="batchTotal > 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'"
                >
                    <div
                        v-for="n in batchTotal"
                        :key="n"
                        class="h-24 rounded-xl bg-slate-200/60 animate-pulse border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1"
                    >
                        <span class="text-sm">🎨</span>
                        <span class="text-[10px] font-mono">#{{ n }} 运算中</span>
                    </div>
                </div>

                <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-3.5 py-1 mt-2 shadow-2xs">
                    {{ currentFunTip }}
                </p>
            </div>

            <!-- 2. 错误状态 (Error) -->
            <div v-else-if="error && results.length === 0" class="flex flex-col items-center justify-center text-center py-8 px-4 max-w-md">
                <div class="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-base mb-2 border border-rose-200/60 shadow-2xs">
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
            <div v-else-if="results && results.length > 0" class="w-full h-full flex flex-col justify-start">
                <!-- ================= 模式 A：网格平铺对比 (Grid View) ================= -->
                <div v-if="viewMode === 'grid' || results.length === 1" class="w-full">
                    <div class="grid gap-3.5 w-full" :class="gridColumnsClass">
                        <div
                            v-for="(img, index) in results"
                            :key="`${img}-${index}`"
                            class="relative group bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col"
                        >
                            <!-- 卡片顶端浮动信息条：序号与尺寸 -->
                            <div class="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
                                <span class="bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-xs">
                                    #{{ index + 1 }}
                                </span>
                                <span v-if="imageSizes[img]" class="bg-slate-900/75 backdrop-blur-xs text-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded-md shadow-xs">
                                    {{ imageSizes[img] }}
                                </span>
                            </div>

                            <!-- 图片主体容器：双击/单击放大 -->
                            <div
                                class="w-full flex items-center justify-center bg-slate-950/5 cursor-zoom-in min-h-[220px] max-h-[440px] overflow-hidden relative"
                                @click="openLightbox(index)"
                            >
                                <img
                                    :src="img"
                                    :alt="`生成艺术作品 #${index + 1}`"
                                    class="w-full h-full object-contain max-h-[440px] transition-transform duration-300 group-hover:scale-[1.015]"
                                    @load="e => onImageLoad(e, img)"
                                />

                                <!-- 放大提示浮层 -->
                                <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span class="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-xs rounded-lg shadow-md flex items-center gap-1">
                                        <span>🔍</span>
                                        <span>点击放大</span>
                                    </span>
                                </div>
                            </div>

                            <!-- 卡片底部紧凑交互栏：杜绝长按钮导致的挤压错行 -->
                            <div class="w-full bg-white border-t border-slate-100 px-2.5 py-2 flex items-center justify-between gap-1.5 text-xs">
                                <div class="flex items-center gap-1">
                                    <button
                                        v-if="canPush"
                                        @click="$emit('push', img)"
                                        class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                                        title="将此图作为参考图推送到图文生图继续重塑"
                                    >
                                        <span>🎨</span>
                                        <span class="hidden sm:inline">二创</span>
                                    </button>
                                    <button
                                        @click="copyImage(img)"
                                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-medium transition-all"
                                        :title="copiedImage === img ? '已复制！' : '复制图片数据/链接'"
                                    >
                                        <span>{{ copiedImage === img ? '✓' : '📋' }}</span>
                                        <span class="hidden sm:inline">{{ copiedImage === img ? '已复制' : '复制' }}</span>
                                    </button>
                                </div>

                                <div class="flex items-center gap-1">
                                    <button
                                        @click="$emit('download', img)"
                                        class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shadow-2xs flex items-center gap-1"
                                        title="下载高清原图文件"
                                    >
                                        <span>⬇️</span>
                                        <span>下载</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================= 模式 B：焦点大图与胶卷缩略条 (Focus View) ================= -->
                <div v-else class="w-full flex flex-col items-center">
                    <!-- 主焦点大图展示卡 -->
                    <div class="relative group w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col items-center mb-3">
                        <!-- 顶端状态 -->
                        <div class="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                            <span class="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-mono px-2.5 py-1 rounded-lg shadow-sm">
                                {{ focusedIndex + 1 }} / {{ results.length }}
                            </span>
                            <span v-if="imageSizes[currentFocusedImage]" class="bg-slate-900/80 backdrop-blur-xs text-slate-200 text-xs font-mono px-2 py-1 rounded-lg shadow-sm">
                                {{ imageSizes[currentFocusedImage] }}
                            </span>
                        </div>

                        <!-- 左右快速切图浮动箭头 -->
                        <button
                            v-if="results.length > 1"
                            @click="prevFocused"
                            class="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center text-lg backdrop-blur-xs transition-all shadow-md active:scale-95"
                            title="上一张 (方向键 ←)"
                        >
                            ‹
                        </button>
                        <button
                            v-if="results.length > 1"
                            @click="nextFocused"
                            class="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center text-lg backdrop-blur-xs transition-all shadow-md active:scale-95"
                            title="下一张 (方向键 →)"
                        >
                            ›
                        </button>

                        <!-- 大图容器 -->
                        <div
                            class="w-full flex items-center justify-center bg-slate-950/5 cursor-zoom-in min-h-[280px] max-h-[500px] overflow-hidden"
                            @click="openLightbox(focusedIndex)"
                        >
                            <img
                                :src="currentFocusedImage"
                                :alt="`焦点艺术作品 #${focusedIndex + 1}`"
                                class="w-full h-full object-contain max-h-[500px] transition-transform duration-300 group-hover:scale-[1.01]"
                                @load="e => onImageLoad(e, currentFocusedImage)"
                            />
                        </div>

                        <!-- 焦点图底部完整控制条 -->
                        <div class="w-full bg-white border-t border-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                            <span class="text-xs text-slate-400 font-mono">
                                {{ imageSizes[currentFocusedImage] || '正在解析分辨率...' }}
                            </span>

                            <div class="flex items-center gap-2">
                                <button
                                    v-if="canPush"
                                    @click="$emit('push', currentFocusedImage)"
                                    class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                                >
                                    <span>🎨</span>
                                    <span>二次创作</span>
                                </button>
                                <button
                                    @click="copyImage(currentFocusedImage)"
                                    class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
                                >
                                    <span>{{ copiedImage === currentFocusedImage ? '✓ 已复制' : '复制图片' }}</span>
                                </button>
                                <button
                                    @click="$emit('download', currentFocusedImage)"
                                    class="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
                                >
                                    <span>⬇️</span>
                                    <span>下载原图</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 底部缩略图胶卷条 (Thumbnails Filmstrip) -->
                    <div class="flex items-center justify-center gap-2.5 w-full overflow-x-auto py-1">
                        <div
                            v-for="(img, idx) in results"
                            :key="`thumb-${idx}`"
                            @click="focusedIndex = idx"
                            :class="[
                                'relative w-16 h-16 rounded-xl border-2 overflow-hidden cursor-pointer transition-all shrink-0 bg-slate-100 shadow-2xs',
                                focusedIndex === idx
                                    ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                                    : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                            ]"
                            :title="`查看第 ${idx + 1} 张图片`"
                        >
                            <img :src="img" :alt="`缩略图 #${idx + 1}`" class="w-full h-full object-cover" />
                            <span class="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 font-mono rounded-tl">
                                #{{ idx + 1 }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. 空状态 (Empty) -->
            <div v-else class="flex flex-col items-center justify-center text-center py-12 px-4">
                <div class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mb-2.5 shadow-2xs border border-slate-200/50">
                    🖼️
                </div>
                <h4 class="text-xs sm:text-sm font-semibold text-slate-700 mb-1">作品展示画廊</h4>
                <p class="text-xs text-slate-400 max-w-xs leading-relaxed">
                    在左侧设置描述词并可选择单次生成 1~4 张，生成的高清画面将在此集中展示与比对。
                </p>
            </div>
        </div>

        <!-- 历史生成记录 Filmstrip -->
        <div v-if="history && history.length > 0" class="mt-3 pt-3 border-t border-slate-100">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>🕒 生成历史</span>
                    <span class="text-xs text-slate-400 font-mono font-normal">({{ history.length }})</span>
                </span>
                <span class="text-[11px] text-slate-400">点击可载入完整成果</span>
            </div>

            <!-- 历史生成记录（换行排列，多图徽标） -->
            <div class="flex flex-wrap gap-2 pt-0.5">
                <div
                    v-for="item in history"
                    :key="item.id"
                    @click="$emit('select-history', item)"
                    class="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20 transition-all relative group bg-slate-100 shadow-2xs"
                    :title="`${item.type === 'text' ? '文生图' : '图文生图'} (${item.imageUrls.length} 张)`"
                >
                    <img :src="item.imageUrls[0]" alt="历史生成" class="w-full h-full object-cover" />

                    <!-- 左下角工作流类型角标 -->
                    <span class="absolute bottom-0 left-0 bg-slate-900/80 text-white text-[9px] px-1 font-mono rounded-tr">
                        {{ item.type === 'text' ? '文' : '图文' }}
                    </span>

                    <!-- 右上角多图徽标 -->
                    <span
                        v-if="item.imageUrls.length > 1"
                        class="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-mono px-1 rounded-bl font-semibold leading-tight"
                    >
                        {{ item.imageUrls.length }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Lightbox 全屏沉浸式画廊查看 (支持多图翻页) -->
        <div
            v-if="lightboxIndex !== null && results && results[lightboxIndex]"
            class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
            @click.self="closeLightbox"
        >
            <!-- 左右翻页按钮 (多图时展示) -->
            <button
                v-if="results.length > 1"
                @click="prevLightbox"
                class="absolute left-4 top-1/2 -translate-y-1/2 z-60 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center text-2xl border border-slate-700/80 backdrop-blur-sm transition-all shadow-xl active:scale-95 cursor-pointer"
                title="上一张 (← 键)"
            >
                ‹
            </button>

            <button
                v-if="results.length > 1"
                @click="nextLightbox"
                class="absolute right-4 top-1/2 -translate-y-1/2 z-60 w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center text-2xl border border-slate-700/80 backdrop-blur-sm transition-all shadow-xl active:scale-95 cursor-pointer"
                title="下一张 (→ 键)"
            >
                ›
            </button>

            <div class="relative max-w-5xl max-h-[92vh] flex flex-col items-center">
                <!-- 顶部页码指示器 -->
                <div v-if="results.length > 1" class="mb-2 px-3 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs font-mono shadow-sm">
                    第 {{ lightboxIndex + 1 }} / {{ results.length }} 张
                </div>

                <img
                    :src="results[lightboxIndex]"
                    alt="大图全屏查看"
                    class="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
                />

                <div class="mt-3 flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-700 text-xs flex-wrap justify-center shadow-lg">
                    <button
                        v-if="canPush"
                        @click="$emit('push', results[lightboxIndex])"
                        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                    >
                        🎨 二次创作
                    </button>
                    <button
                        @click="copyImage(results[lightboxIndex])"
                        class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors"
                    >
                        {{ copiedImage === results[lightboxIndex] ? '✓ 已复制' : '📋 复制图片' }}
                    </button>
                    <button
                        @click="$emit('download', results[lightboxIndex])"
                        class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors"
                    >
                        ⬇️ 下载原图
                    </button>
                    <button
                        @click="closeLightbox"
                        class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
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
    batchTotal?: number
}>()

const emit = defineEmits<{
    download: [image: string]
    'download-all': [images: string[]]
    push: [image: string]
    retry: []
    'open-api-modal': []
    'select-history': [item: HistoryRecord]
}>()

const viewMode = ref<'grid' | 'focus'>('grid')
const focusedIndex = ref(0)
const lightboxIndex = ref<number | null>(null)
const imageSizes = ref<Record<string, string>>({})
const showPromptModal = ref(false)
const copiedPrompt = ref(false)
const copiedImage = ref<string | null>(null)
const isDownloadingAll = ref(false)
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

const currentFocusedImage = computed(() => {
    if (!props.results || props.results.length === 0) return ''
    const idx = Math.max(0, Math.min(focusedIndex.value, props.results.length - 1))
    return props.results[idx] || props.results[0]
})

const gridColumnsClass = computed(() => {
    const count = props.results.length
    if (count <= 1) return 'grid-cols-1'
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
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

const measureImage = (url: string) => {
    if (!url || imageSizes.value[url]) return
    const img = new Image()
    img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
            imageSizes.value[url] = `${img.naturalWidth} × ${img.naturalHeight}`
        }
    }
    img.src = url
    if (img.complete && img.naturalWidth && img.naturalHeight) {
        imageSizes.value[url] = `${img.naturalWidth} × ${img.naturalHeight}`
    }
}

const measureImages = (urls: string[]) => {
    if (!urls) return
    for (const url of urls) {
        measureImage(url)
    }
}

watch(
    () => props.results,
    newVal => {
        if (!newVal || newVal.length === 0) {
            imageSizes.value = {}
            return
        }
        // 增量更新时保留已有尺寸，避免后续图片生成完成时将首张图的尺寸误清空
        const currentSet = new Set(newVal)
        for (const key of Object.keys(imageSizes.value)) {
            if (!currentSet.has(key)) {
                delete imageSizes.value[key]
            }
        }
        if (focusedIndex.value >= newVal.length) {
            focusedIndex.value = 0
        }
        // 主动测量所有图片尺寸（确保从缓存读取或时序变化时分辨率百分之百显示）
        measureImages(newVal)
    },
    { deep: true, immediate: true }
)

const onImageLoad = (event: Event, image: string) => {
    const img = event.currentTarget as HTMLImageElement | null
    if (img?.naturalWidth && img.naturalHeight) {
        imageSizes.value[image] = `${img.naturalWidth} × ${img.naturalHeight}`
    }
}

const openLightbox = (index: number) => {
    lightboxIndex.value = index
}

const closeLightbox = () => {
    lightboxIndex.value = null
}

const prevLightbox = () => {
    if (lightboxIndex.value === null || props.results.length <= 1) return
    lightboxIndex.value = (lightboxIndex.value - 1 + props.results.length) % props.results.length
}

const nextLightbox = () => {
    if (lightboxIndex.value === null || props.results.length <= 1) return
    lightboxIndex.value = (lightboxIndex.value + 1) % props.results.length
}

const prevFocused = () => {
    if (props.results.length <= 1) return
    focusedIndex.value = (focusedIndex.value - 1 + props.results.length) % props.results.length
}

const nextFocused = () => {
    if (props.results.length <= 1) return
    focusedIndex.value = (focusedIndex.value + 1) % props.results.length
}

const handleDownloadAll = async () => {
    if (!props.results.length || isDownloadingAll.value) return
    isDownloadingAll.value = true
    try {
        emit('download-all', [...props.results])
    } finally {
        setTimeout(() => {
            isDownloadingAll.value = false
        }, 1200)
    }
}

const onKeyDown = (e: KeyboardEvent) => {
    if (lightboxIndex.value !== null) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault()
            prevLightbox()
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            nextLightbox()
        } else if (e.key === 'Escape') {
            closeLightbox()
        }
    } else if (viewMode.value === 'focus' && props.results.length > 1) {
        if (e.key === 'ArrowLeft') {
            prevFocused()
        } else if (e.key === 'ArrowRight') {
            nextFocused()
        }
    }

    if (e.key === 'Escape') {
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
