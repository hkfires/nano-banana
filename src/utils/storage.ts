import type { ModelOption } from '../types'
import { normalizeApiBase, DEFAULT_MAX_RETRIES } from '../config/api'
import type { ModelFamily, ModelImageSettings } from '../config/modelCapabilities'
import { getDefaultModelImageSettings, isSupportedModelFamily, normalizeModelImageSettings } from '../config/modelCapabilities'

// 本地存储工具类
export class LocalStorage {
    private static readonly API_KEY = 'nano-banana-api-key'
    private static readonly API_ENDPOINT = 'nano-banana-api-endpoint'
    private static readonly MODEL_ID = 'nano-banana-model-id'
    private static readonly MODEL_CACHE = 'nano-banana-model-cache'
    private static readonly MODEL_IMAGE_SETTINGS = 'nano-banana-model-image-settings'
    private static readonly MAX_RETRIES = 'nano-banana-max-retries'
    private static readonly BATCH_COUNT = 'nano-banana-batch-count'
    private static readonly FORCE_PARALLEL = 'nano-banana-force-parallel'

    // 保存API密钥
    static saveApiKey(apiKey: string): void {
        try {
            localStorage.setItem(this.API_KEY, apiKey)
        } catch (error) {
            console.warn('无法保存API密钥到本地存储:', error)
        }
    }

    // 获取API密钥
    static getApiKey(): string {
        try {
            return localStorage.getItem(this.API_KEY) || ''
        } catch (error) {
            console.warn('无法从本地存储读取API密钥:', error)
            return ''
        }
    }

    // 清除API密钥
    static clearApiKey(): void {
        try {
            localStorage.removeItem(this.API_KEY)
        } catch (error) {
            console.warn('无法清除本地存储的API密钥:', error)
        }
    }

    // 保存自定义端点
    static saveApiEndpoint(endpoint: string): void {
        try {
            localStorage.setItem(this.API_ENDPOINT, normalizeApiBase(endpoint) || endpoint)
        } catch (error) {
            console.warn('无法保存API端点到本地存储:', error)
        }
    }

    // 获取自定义端点
    static getApiEndpoint(): string {
        try {
            return localStorage.getItem(this.API_ENDPOINT) || ''
        } catch (error) {
            console.warn('无法从本地存储读取API端点:', error)
            return ''
        }
    }

    // 清除自定义端点
    static clearApiEndpoint(): void {
        try {
            localStorage.removeItem(this.API_ENDPOINT)
        } catch (error) {
            console.warn('无法清除本地存储的API端点:', error)
        }
    }

    // 保存模型ID
    static saveModelId(modelId: string): void {
        try {
            localStorage.setItem(this.MODEL_ID, modelId)
        } catch (error) {
            console.warn('无法保存模型ID到本地存储:', error)
        }
    }

    // 获取模型ID
    static getModelId(): string {
        try {
            return localStorage.getItem(this.MODEL_ID) || ''
        } catch (error) {
            console.warn('无法从本地存储读取模型ID:', error)
            return ''
        }
    }

    // 清除模型ID
    static clearModelId(): void {
        try {
            localStorage.removeItem(this.MODEL_ID)
        } catch (error) {
            console.warn('无法清除本地存储的模型ID:', error)
        }
    }

    // 保存最大重试次数
    static saveMaxRetries(maxRetries: number): void {
        try {
            const count = Math.max(1, Math.floor(Number(maxRetries) || DEFAULT_MAX_RETRIES))
            localStorage.setItem(this.MAX_RETRIES, String(count))
        } catch (error) {
            console.warn('无法保存重试次数到本地存储:', error)
        }
    }

    // 获取最大重试次数 (默认 3)
    static getMaxRetries(): number {
        try {
            const val = localStorage.getItem(this.MAX_RETRIES)
            if (!val) return DEFAULT_MAX_RETRIES
            const count = parseInt(val, 10)
            return Number.isFinite(count) && count >= 1 ? count : DEFAULT_MAX_RETRIES
        } catch (error) {
            console.warn('无法从本地存储读取重试次数:', error)
            return DEFAULT_MAX_RETRIES
        }
    }

    // 保存生成图片张数 (1-8)
    static saveBatchCount(count: number): void {
        try {
            const val = Math.min(8, Math.max(1, Math.floor(Number(count) || 1)))
            localStorage.setItem(this.BATCH_COUNT, String(val))
        } catch (error) {
            console.warn('无法保存生成张数到本地存储:', error)
        }
    }

    // 获取生成图片张数 (默认 1, 支持 1-8)
    static getBatchCount(): number {
        try {
            const val = localStorage.getItem(this.BATCH_COUNT)
            if (!val) return 1
            const count = parseInt(val, 10)
            return Number.isFinite(count) && count >= 1 && count <= 8 ? count : 1
        } catch (error) {
            console.warn('无法从本地存储读取生成张数:', error)
            return 1
        }
    }

    // 保存强制并发开关 (支持指定特定模型)
    static saveForceParallel(enabled: boolean, modelId?: string): void {
        try {
            if (modelId && modelId.trim()) {
                const key = modelId.toLowerCase().trim()
                const map = this.getModelForceParallelMap()
                map[key] = enabled
                localStorage.setItem(this.FORCE_PARALLEL, JSON.stringify(map))
            } else {
                localStorage.setItem(this.FORCE_PARALLEL, enabled ? 'true' : 'false')
            }
        } catch (error) {
            console.warn('无法保存强制并发设置到本地存储:', error)
        }
    }

    // 获取强制并发开关 (支持指定特定模型，默认 false)
    static getForceParallel(modelId?: string): boolean {
        try {
            const raw = localStorage.getItem(this.FORCE_PARALLEL)
            if (!raw) return false

            // 如果传了具体模型 ID，先尝试从模型映射中读取
            if (modelId && modelId.trim()) {
                const key = modelId.toLowerCase().trim()
                const map = this.getModelForceParallelMap()
                if (key in map) {
                    return Boolean(map[key])
                }
            }

            // 兼容旧版布尔值字符串
            return raw === 'true'
        } catch (error) {
            console.warn('无法从本地存储读取强制并发设置:', error)
            return false
        }
    }

    private static getModelForceParallelMap(): Record<string, boolean> {
        const raw = localStorage.getItem(this.FORCE_PARALLEL)
        if (!raw) return {}
        try {
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed as Record<string, boolean>
            }
        } catch {
            // 如果历史数据只是简单的 'true' 或 'false' 字符串，返回空对象供字典使用
        }
        return {}
    }

    // 保存模型列表缓存
    static saveModelCache(endpoint: string, models: ModelOption[]): void {
        try {
            const cache = this.getModelCacheMap()
            cache[this.normalizeEndpoint(endpoint)] = models
            localStorage.setItem(this.MODEL_CACHE, JSON.stringify(cache))
        } catch (error) {
            console.warn('无法保存模型列表到本地存储:', error)
        }
    }

    // 获取指定端点的模型列表缓存
    static getModelCache(endpoint: string): ModelOption[] {
        try {
            const cache = this.getModelCacheMap()
            return cache[this.normalizeEndpoint(endpoint)] || []
        } catch (error) {
            console.warn('无法从本地存储读取模型列表:', error)
            return []
        }
    }

    // 清除模型列表缓存，可传入端点进行选择性清除
    static clearModelCache(endpoint?: string): void {
        try {
            if (!endpoint) {
                localStorage.removeItem(this.MODEL_CACHE)
                return
            }

            const cache = this.getModelCacheMap()
            const normalized = this.normalizeEndpoint(endpoint)
            if (normalized in cache) {
                delete cache[normalized]
                localStorage.setItem(this.MODEL_CACHE, JSON.stringify(cache))
            }
        } catch (error) {
            console.warn('无法清除模型列表缓存:', error)
        }
    }

    private static getModelCacheMap(): Record<string, ModelOption[]> {
        const raw = localStorage.getItem(this.MODEL_CACHE)
        if (!raw) return {}

        try {
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === 'object') {
                return parsed as Record<string, ModelOption[]>
            }
        } catch (error) {
            console.warn('模型缓存解析失败，将重新创建:', error)
        }

        return {}
    }


    static getModelImageSettingsMap(): Partial<Record<ModelFamily, ModelImageSettings>> {
        try {
            const raw = localStorage.getItem(this.MODEL_IMAGE_SETTINGS)
            if (!raw) return {}

            const parsed = JSON.parse(raw)
            if (!parsed || typeof parsed !== 'object') return {}

            const result: Partial<Record<ModelFamily, ModelImageSettings>> = {}
            for (const [family, settings] of Object.entries(parsed)) {
                if (!settings || typeof settings !== 'object') continue
                const modelFamily = family as ModelFamily
                if (!isSupportedModelFamily(modelFamily)) continue
                result[modelFamily] = normalizeModelImageSettings(
                    modelFamily,
                    settings as Partial<ModelImageSettings>
                )
            }
            return result
        } catch (error) {
            console.warn('无法从本地存储读取模型图像设置:', error)
            return {}
        }
    }

    static saveModelImageSettingsMap(settingsMap: Partial<Record<ModelFamily, ModelImageSettings>>): void {
        try {
            localStorage.setItem(this.MODEL_IMAGE_SETTINGS, JSON.stringify(settingsMap))
        } catch (error) {
            console.warn('无法保存模型图像设置到本地存储:', error)
        }
    }

    static getModelImageSettings(family: ModelFamily): ModelImageSettings {
        if (!isSupportedModelFamily(family)) {
            return { aspectRatio: '1:1' }
        }

        const cached = this.getModelImageSettingsMap()[family]
        return normalizeModelImageSettings(family, cached || getDefaultModelImageSettings(family))
    }

    static saveModelImageSettings(family: ModelFamily, settings: ModelImageSettings): void {
        if (!isSupportedModelFamily(family)) return

        const map = this.getModelImageSettingsMap()
        map[family] = normalizeModelImageSettings(family, settings)
        this.saveModelImageSettingsMap(map)
    }
    private static normalizeEndpoint(endpoint: string): string {
        return endpoint.trim().replace(/\/$/, '').toLowerCase()
    }
}
