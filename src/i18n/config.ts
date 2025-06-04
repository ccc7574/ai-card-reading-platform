import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// 支持的语言列表
export const locales = ['zh', 'en', 'ja', 'ko'] as const
export type Locale = typeof locales[number]

// 默认语言
export const defaultLocale: Locale = 'zh'

// 语言配置
export const localeConfig = {
  zh: {
    name: '简体中文',
    flag: '🇨🇳',
    dir: 'ltr'
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  ja: {
    name: '日本語',
    flag: '🇯🇵',
    dir: 'ltr'
  },
  ko: {
    name: '한국어',
    flag: '🇰🇷',
    dir: 'ltr'
  }
} as const

export default getRequestConfig(async ({ locale }) => {
  // 验证传入的语言是否支持
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
