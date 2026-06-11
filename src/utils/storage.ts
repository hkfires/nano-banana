import type { ModelOption } from '../types'
import { normalizeApiBase } from '../config/api'
import type { ModelFamily, ModelImageSettings } from '../config/modelCapabilities'
import { getDefaultModelImageSettings, isSupportedModelFamily, normalizeModelImageSettings } from '../config/modelCapabilities'

// 本地存储工具类
export class LocalStorage {
    private static readonly API_KEY = 'nano-banana-api-key'
    private static readonly API_ENDPOINT = 'nano-banana-api-endpoint'
    private static readonly MODEL_ID = 'nano-banana-model-id'
    private static readonly MODEL_CACHE = 'nano-banana-model-cache'
    private static readonly MODEL_IMAGE_SETTINGS = 'nano-banana-model-image-settings'

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
