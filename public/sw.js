// AI卡片阅读平台 - Service Worker
// 版本号
const CACHE_VERSION = 'v1.2.0'
const CACHE_NAME = `ai-card-reading-${CACHE_VERSION}`

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/bookmarks',
  '/settings',
  '/analytics',
  '/achievements'
]

// 需要缓存的API路径
const API_CACHE_URLS = [
  '/api/cards',
  '/api/data-sources',
  '/api/agents/recommendations',
]

// 离线页面
const OFFLINE_PAGE = '/offline.html'

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 安装中...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 缓存静态资源')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('✅ Service Worker 安装完成')
        // 强制激活新的 Service Worker
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker 安装失败:', error)
      })
  )
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }

  // 根据请求类型选择不同的缓存策略
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API请求：网络优先，缓存备用
      event.respondWith(networkFirstStrategy(request))
    } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      // 静态资源：缓存优先
      event.respondWith(cacheFirstStrategy(request))
    } else {
      // HTML页面：网络优先，离线页面备用
      event.respondWith(networkFirstWithOfflineFallback(request))
    }
  }
})

// 缓存优先策略（适用于静态资源）
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('缓存优先策略失败:', error)
    return new Response('资源不可用', { status: 503 })
  }
}

// 网络优先策略（适用于API请求）
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('网络请求失败，尝试缓存:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // 返回离线响应
    return new Response(JSON.stringify({
      success: false,
      error: '网络不可用',
      offline: true,
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 网络优先，离线页面备用（适用于HTML页面）
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('页面请求失败，尝试缓存:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // 返回简单的离线页面
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>离线模式 - AI卡片阅读</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, sans-serif;
              text-align: center;
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container {
              max-width: 400px;
              background: rgba(255,255,255,0.1);
              padding: 2rem;
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; opacity: 0.9; }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: bold;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔌 离线模式</h1>
            <p>您当前处于离线状态，部分功能可能不可用。</p>
            <button onclick="window.location.reload()">重新连接</button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 激活中...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ 删除旧缓存:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker 激活完成')
        // 立即控制所有客户端
        return self.clients.claim()
      })
  )
})

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('🔄 后台同步:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// 执行后台同步
async function doBackgroundSync() {
  try {
    console.log('📡 执行后台同步...')

    // 预加载热门内容
    await preloadPopularContent()

    console.log('✅ 后台同步完成')
  } catch (error) {
    console.error('❌ 后台同步失败:', error)
  }
}

// 预加载热门内容
async function preloadPopularContent() {
  try {
    const response = await fetch('/api/cards?trending=true&limit=10')
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put('/api/cards?trending=true&limit=10', response.clone())
      console.log('✅ 热门内容预加载完成')
    }
  } catch (error) {
    console.error('热门内容预加载失败:', error)
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '您有新的内容更新',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('AI卡片阅读', options)
  )
})

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    // 打开应用
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})
