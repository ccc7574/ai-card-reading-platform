import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

export default createMiddleware({
  // 支持的语言列表
  locales,
  
  // 默认语言
  defaultLocale,
  
  // 语言检测策略
  localeDetection: true,
  
  // 路径名配置
  pathnames: {
    '/': '/',
    '/cards': {
      zh: '/cards',
      en: '/cards',
      ja: '/cards',
      ko: '/cards'
    },
    '/memory-map': {
      zh: '/memory-map',
      en: '/memory-map',
      ja: '/memory-map',
      ko: '/memory-map'
    },
    '/profile': {
      zh: '/profile',
      en: '/profile',
      ja: '/profile',
      ko: '/profile'
    },
    '/settings': {
      zh: '/settings',
      en: '/settings',
      ja: '/settings',
      ko: '/settings'
    },
    '/bookmarks': {
      zh: '/bookmarks',
      en: '/bookmarks',
      ja: '/bookmarks',
      ko: '/bookmarks'
    },
    '/achievements': {
      zh: '/achievements',
      en: '/achievements',
      ja: '/achievements',
      ko: '/achievements'
    },
    '/analytics': {
      zh: '/analytics',
      en: '/analytics',
      ja: '/analytics',
      ko: '/analytics'
    },
    '/search': {
      zh: '/search',
      en: '/search',
      ja: '/search',
      ko: '/search'
    },
    '/auth': {
      zh: '/auth',
      en: '/auth',
      ja: '/auth',
      ko: '/auth'
    }
  }
})

export const config = {
  // 匹配所有路径，除了以下路径：
  // - api 路由
  // - _next 静态文件
  // - _vercel 部署文件
  // - favicon.ico
  // - 其他静态资源
  matcher: [
    // 匹配所有路径
    '/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)',
    // 匹配根路径
    '/'
  ]
}
