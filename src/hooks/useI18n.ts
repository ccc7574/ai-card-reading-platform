import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { localeConfig, type Locale } from '@/i18n/config'

export function useI18n() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // 获取当前语言配置
  const currentLanguage = localeConfig[locale]

  // 切换语言
  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return

    startTransition(() => {
      // 替换当前路径中的语言代码
      const segments = pathname.split('/')
      segments[1] = newLocale
      const newPath = segments.join('/')
      
      router.push(newPath)
    })
  }

  // 获取本地化路径
  const getLocalizedPath = (path: string, targetLocale?: Locale) => {
    const targetLang = targetLocale || locale
    return `/${targetLang}${path.startsWith('/') ? path : `/${path}`}`
  }

  // 格式化日期
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
  }

  // 格式化相对时间
  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
    }
  }

  // 格式化数字
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(number)
  }

  // 格式化货币
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)
  }

  // 获取语言方向
  const getDirection = () => {
    return currentLanguage.dir
  }

  // 检查是否为RTL语言
  const isRTL = () => {
    return currentLanguage.dir === 'rtl'
  }

  return {
    locale,
    currentLanguage,
    changeLanguage,
    getLocalizedPath,
    formatDate,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    getDirection,
    isRTL,
    isPending
  }
}

// 便捷的翻译Hook
export function useT(namespace?: string) {
  const t = useTranslations(namespace)
  return t
}

// 多命名空间翻译Hook
export function useMultipleT(namespaces: string[]) {
  const translations = namespaces.reduce((acc, namespace) => {
    acc[namespace] = useTranslations(namespace)
    return acc
  }, {} as Record<string, ReturnType<typeof useTranslations>>)

  return translations
}

export default useI18n
