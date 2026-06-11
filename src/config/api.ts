export const DEFAULT_API_ENDPOINT = 'https://openrouter.ai/api/v1'
export const DEFAULT_MODEL_ID = 'google/gemini-2.5-flash-image-preview:free'

/** Normalize user input to an API base URL ending at /v1 (or compatible root). */
export function normalizeApiBase(endpoint: string): string {
    let value = endpoint.trim().replace(/\/$/, '')
    if (!value) return ''

    const suffixes = ['/chat/completions', '/completions', '/responses']
    for (const suffix of suffixes) {
        if (value.endsWith(suffix)) {
            value = value.slice(0, -suffix.length).replace(/\/$/, '')
            break
        }
    }

    return value
}

export function resolveChatCompletionsEndpoint(endpoint: string): string {
    const base = normalizeApiBase(endpoint) || DEFAULT_API_ENDPOINT
    return `${base}/chat/completions`
}