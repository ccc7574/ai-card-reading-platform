// PWA功能管理
export class PWAManager {
  private static instance: PWAManager
  private registration: ServiceWorkerRegistration | null = null
  private isOnline = true
  private installPrompt: any = null

  private constructor() {
    this.initializeEventListeners()
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  // 初始化PWA功能
  public async initialize() {
    if (typeof window === 'undefined') return

    try {
      // 注册Service Worker
      await this.registerServiceWorker()
      
      // 监听安装提示
      this.setupInstallPrompt()
      
      // 监听网络状态
      this.setupNetworkListener()
      
      // 检查更新
      this.checkForUpdates()
      
      console.log('✅ PWA功能初始化完成')
    } catch (error) {
      console.error('❌ PWA初始化失败:', error)
    }
  }

  // 注册Service Worker
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        console.log('🔧 Service Worker 注册成功:', this.registration.scope)

        // 监听Service Worker状态变化
        this.registration.addEventListener('updatefound', () => {
          console.log('🔄 发现Service Worker更新')
          this.handleServiceWorkerUpdate()
        })

        // 监听控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker控制器已更新')
          window.location.reload()
        })

      } catch (error) {
        console.error('❌ Service Worker注册失败:', error)
      }
    }
  }

  // 处理Service Worker更新
  private handleServiceWorkerUpdate() {
    if (!this.registration) return

    const newWorker = this.registration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // 显示更新提示
        this.showUpdateNotification()
      }
    })
  }

  // 显示更新通知
  private showUpdateNotification() {
    const updateBanner = document.createElement('div')
    updateBanner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 flex items-center justify-between'
    updateBanner.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>🔄</span>
        <span>发现新版本，点击更新以获得最佳体验</span>
      </div>
      <div class="flex space-x-2">
        <button id="update-btn" class="bg-white text-blue-600 px-4 py-2 rounded font-medium">
          立即更新
        </button>
        <button id="dismiss-btn" class="text-white hover:text-gray-200">
          稍后
        </button>
      </div>
    `

    document.body.appendChild(updateBanner)

    // 绑定事件
    document.getElementById('update-btn')?.addEventListener('click', () => {
      this.applyUpdate()
      updateBanner.remove()
    })

    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      updateBanner.remove()
    })

    // 5秒后自动隐藏
    setTimeout(() => {
      if (updateBanner.parentNode) {
        updateBanner.remove()
      }
    }, 5000)
  }

  // 应用更新
  private applyUpdate() {
    if (!this.registration) return

    const waitingWorker = this.registration.waiting
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  // 设置安装提示
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA安装提示可用')
      e.preventDefault()
      this.installPrompt = e
      this.showInstallButton()
    })

    // 监听安装完成
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA安装完成')
      this.hideInstallButton()
      this.installPrompt = null
    })
  }

  // 显示安装按钮
  private showInstallButton() {
    const installButton = document.createElement('button')
    installButton.id = 'pwa-install-btn'
    installButton.className = 'fixed bottom-6 left-6 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 hover:bg-blue-700 transition-colors'
    installButton.innerHTML = `
      <span>📱</span>
      <span>安装应用</span>
    `

    installButton.addEventListener('click', () => {
      this.promptInstall()
    })

    document.body.appendChild(installButton)
  }

  // 隐藏安装按钮
  private hideInstallButton() {
    const installButton = document.getElementById('pwa-install-btn')
    if (installButton) {
      installButton.remove()
    }
  }

  // 提示安装
  public async promptInstall() {
    if (!this.installPrompt) return false

    try {
      this.installPrompt.prompt()
      const result = await this.installPrompt.userChoice
      
      console.log('安装提示结果:', result.outcome)
      
      if (result.outcome === 'accepted') {
        console.log('✅ 用户接受了安装提示')
      } else {
        console.log('❌ 用户拒绝了安装提示')
      }
      
      this.installPrompt = null
      return result.outcome === 'accepted'
    } catch (error) {
      console.error('安装提示失败:', error)
      return false
    }
  }

  // 设置网络监听
  private setupNetworkListener() {
    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      console.log('🌐 网络已连接')
      this.isOnline = true
      this.hideOfflineNotification()
      this.syncWhenOnline()
    })

    window.addEventListener('offline', () => {
      console.log('🔌 网络已断开')
      this.isOnline = false
      this.showOfflineNotification()
    })
  }

  // 显示离线通知
  private showOfflineNotification() {
    const offlineNotification = document.createElement('div')
    offlineNotification.id = 'offline-notification'
    offlineNotification.className = 'fixed top-0 left-0 right-0 bg-orange-600 text-white p-3 z-50 text-center'
    offlineNotification.innerHTML = `
      <div class="flex items-center justify-center space-x-2">
        <span>🔌</span>
        <span>您当前处于离线状态，部分功能可能不可用</span>
      </div>
    `

    document.body.appendChild(offlineNotification)
  }

  // 隐藏离线通知
  private hideOfflineNotification() {
    const offlineNotification = document.getElementById('offline-notification')
    if (offlineNotification) {
      offlineNotification.remove()
    }
  }

  // 网络恢复时同步
  private async syncWhenOnline() {
    if (!this.registration) return

    try {
      await this.registration.sync.register('background-sync')
      console.log('🔄 后台同步已注册')
    } catch (error) {
      console.error('后台同步注册失败:', error)
    }
  }

  // 检查更新
  private async checkForUpdates() {
    if (!this.registration) return

    try {
      await this.registration.update()
      console.log('🔍 检查更新完成')
    } catch (error) {
      console.error('检查更新失败:', error)
    }
  }

  // 初始化事件监听器
  private initializeEventListeners() {
    if (typeof window === 'undefined') return

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates()
      }
    })
  }

  // 获取网络状态
  public getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      connection: (navigator as any).connection || null
    }
  }

  // 获取安装状态
  public getInstallStatus() {
    return {
      canInstall: !!this.installPrompt,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches
    }
  }

  // 请求推送通知权限
  public async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持推送通知')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // 发送本地通知
  public async sendNotification(title: string, options: NotificationOptions = {}) {
    if (!await this.requestNotificationPermission()) {
      return false
    }

    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return true
    } catch (error) {
      console.error('发送通知失败:', error)
      return false
    }
  }

  // 缓存重要内容
  public async cacheImportantContent(urls: string[]) {
    if (!this.registration) return

    try {
      const cache = await caches.open('important-content')
      await cache.addAll(urls)
      console.log('✅ 重要内容已缓存')
    } catch (error) {
      console.error('缓存重要内容失败:', error)
    }
  }
}

// 导出单例实例
export const pwaManager = PWAManager.getInstance()
