// AI服务配置
export const AI_CONFIG = {
  // OpenAI配置
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    models: {
      text: 'gpt-4-turbo-preview',
      image: 'dall-e-3',
      embedding: 'text-embedding-3-small'
    },
    maxTokens: 4000,
    temperature: 0.7
  },

  // Google Gemini配置
  gemini: {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '',
    baseURL: process.env.GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com',
    models: {
      text: 'gemini-1.5-pro',
      vision: 'gemini-1.5-pro-vision',
      embedding: 'text-embedding-004'
    },
    maxTokens: 8000,
    temperature: 0.7
  },

  // 默认配置
  default: {
    provider: (process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER as 'openai' | 'gemini') || 'gemini',
    retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '3'),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000'),
    fallbackProvider: 'gemini' as 'openai' | 'gemini'
  },

  // 图片生成配置
  image: {
    unsplash: {
      accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
      baseURL: 'https://api.unsplash.com'
    },
    pixabay: {
      apiKey: process.env.PIXABAY_API_KEY || '',
      baseURL: 'https://pixabay.com/api'
    }
  }
}

// 验证API密钥是否配置
export function validateAIConfig() {
  const issues: string[] = []

  if (!AI_CONFIG.openai.apiKey) {
    issues.push('OpenAI API密钥未配置')
  }

  if (!AI_CONFIG.gemini.apiKey) {
    issues.push('Google Gemini API密钥未配置')
  }

  if (!AI_CONFIG.image.unsplash.accessKey) {
    issues.push('Unsplash API密钥未配置')
  }

  return {
    isValid: issues.length === 0,
    issues,
    hasOpenAI: !!AI_CONFIG.openai.apiKey,
    hasGemini: !!AI_CONFIG.gemini.apiKey,
    hasImageServices: !!(AI_CONFIG.image.unsplash.accessKey || AI_CONFIG.image.pixabay.apiKey)
  }
}

// 获取可用的AI提供商
export function getAvailableProviders() {
  const validation = validateAIConfig()
  const providers: Array<'openai' | 'gemini'> = []

  if (validation.hasOpenAI) {
    providers.push('openai')
  }

  if (validation.hasGemini) {
    providers.push('gemini')
  }

  return providers
}

// 获取推荐的AI提供商
export function getRecommendedProvider(): 'openai' | 'gemini' {
  const available = getAvailableProviders()
  
  if (available.length === 0) {
    console.warn('没有可用的AI提供商，使用默认配置')
    return AI_CONFIG.default.provider
  }

  // 优先使用配置的默认提供商
  if (available.includes(AI_CONFIG.default.provider)) {
    return AI_CONFIG.default.provider
  }

  // 否则使用第一个可用的
  return available[0]
}

// 错误处理配置
export const AI_ERROR_MESSAGES = {
  NO_API_KEY: '未配置AI API密钥',
  RATE_LIMIT: 'API调用频率限制，请稍后重试',
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  INVALID_RESPONSE: 'AI服务返回无效响应',
  TIMEOUT: 'AI服务响应超时',
  QUOTA_EXCEEDED: 'API配额已用完',
  UNKNOWN_ERROR: '未知错误，请稍后重试'
}

// 重试配置
export const RETRY_CONFIG = {
  maxAttempts: AI_CONFIG.default.retryAttempts,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  backoffFactor: 2
}
