'use client'

import { useEffect } from 'react'
import { pwaManager } from '@/lib/pwa'

export function PWAInitializer() {
  useEffect(() => {
    // 初始化PWA功能
    pwaManager.initialize()

    // 请求通知权限（可选）
    const requestNotificationPermission = async () => {
      const hasPermission = await pwaManager.requestNotificationPermission()
      if (hasPermission) {
        console.log('✅ 通知权限已获得')
      }
    }

    // 延迟请求通知权限，避免打扰用户
    setTimeout(requestNotificationPermission, 5000)

    // 预缓存重要内容
    const cacheImportantContent = async () => {
      const importantUrls = [
        '/api/cards?limit=10',
        '/api/agents/recommendations',
        '/bookmarks',
        '/settings'
      ]
      
      await pwaManager.cacheImportantContent(importantUrls)
    }

    cacheImportantContent()

  }, [])

  // 这个组件不渲染任何内容
  return null
}
