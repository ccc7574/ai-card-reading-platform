// 系统监控和健康检查
export interface SystemMetrics {
  timestamp: Date
  cpu: {
    usage: number
    load: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    connectionsActive: number
  }
  application: {
    uptime: number
    requestsPerSecond: number
    responseTime: number
    errorRate: number
  }
}

export interface HealthCheck {
  service: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  message: string
  responseTime: number
  timestamp: Date
  details?: any
}

export interface SystemAlert {
  id: string
  type: 'performance' | 'error' | 'security' | 'resource'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: Date
  isResolved: boolean
  resolvedAt?: Date
  metadata?: any
}

export class SystemMonitor {
  private static instance: SystemMonitor
  private metrics: SystemMetrics[] = []
  private healthChecks = new Map<string, HealthCheck>()
  private alerts: SystemAlert[] = []
  private isMonitoring = false
  private monitoringInterval: NodeJS.Timeout | null = null
  private alertThresholds = {
    cpu: 80,
    memory: 85,
    disk: 90,
    responseTime: 2000,
    errorRate: 5
  }

  private constructor() {
    this.initializeHealthChecks()
  }

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor()
    }
    return SystemMonitor.instance
  }

  // 初始化健康检查
  private initializeHealthChecks() {
    const services = [
      'database',
      'ai_agents',
      'recommendation_engine',
      'websocket_server',
      'push_notifications',
      'data_sources',
      'cache_system'
    ]

    services.forEach(service => {
      this.healthChecks.set(service, {
        service,
        status: 'unknown',
        message: '等待检查',
        responseTime: 0,
        timestamp: new Date()
      })
    })
  }

  // 开始监控
  public startMonitoring(interval: number = 30000) {
    if (this.isMonitoring) return

    this.isMonitoring = true
    console.log('📊 系统监控已启动')

    // 立即执行一次检查
    this.collectMetrics()
    this.performHealthChecks()

    // 定期收集指标
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
      this.performHealthChecks()
      this.checkAlerts()
    }, interval)
  }

  // 停止监控
  public stopMonitoring() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('📊 系统监控已停止')
  }

  // 收集系统指标
  private collectMetrics() {
    // 模拟系统指标收集
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: {
        usage: Math.random() * 100,
        load: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
      },
      memory: {
        used: Math.random() * 8000,
        total: 8000,
        percentage: Math.random() * 100
      },
      disk: {
        used: Math.random() * 500,
        total: 500,
        percentage: Math.random() * 100
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        connectionsActive: Math.floor(Math.random() * 100)
      },
      application: {
        uptime: Date.now() - (Date.now() - Math.random() * 86400000),
        requestsPerSecond: Math.random() * 100,
        responseTime: Math.random() * 1000,
        errorRate: Math.random() * 10
      }
    }

    this.metrics.unshift(metrics)

    // 限制指标历史数量
    if (this.metrics.length > 1000) {
      this.metrics.splice(1000)
    }
  }

  // 执行健康检查
  private async performHealthChecks() {
    const services = Array.from(this.healthChecks.keys())

    for (const service of services) {
      const startTime = Date.now()
      
      try {
        const healthCheck = await this.checkServiceHealth(service)
        const responseTime = Date.now() - startTime

        this.healthChecks.set(service, {
          ...healthCheck,
          responseTime,
          timestamp: new Date()
        })
      } catch (error) {
        this.healthChecks.set(service, {
          service,
          status: 'critical',
          message: `健康检查失败: ${error}`,
          responseTime: Date.now() - startTime,
          timestamp: new Date()
        })
      }
    }
  }

  // 检查特定服务健康状态
  private async checkServiceHealth(service: string): Promise<HealthCheck> {
    // 模拟健康检查
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100))

    const healthStatuses = ['healthy', 'warning', 'critical'] as const
    const randomStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)]

    const messages = {
      healthy: '服务运行正常',
      warning: '服务运行但有警告',
      critical: '服务存在严重问题'
    }

    return {
      service,
      status: randomStatus,
      message: messages[randomStatus],
      responseTime: 0, // 将在调用处设置
      timestamp: new Date(),
      details: {
        version: '1.0.0',
        lastRestart: new Date(Date.now() - Math.random() * 86400000),
        connections: Math.floor(Math.random() * 100)
      }
    }
  }

  // 检查告警
  private checkAlerts() {
    const latestMetrics = this.metrics[0]
    if (!latestMetrics) return

    // CPU使用率告警
    if (latestMetrics.cpu.usage > this.alertThresholds.cpu) {
      this.createAlert({
        type: 'performance',
        severity: latestMetrics.cpu.usage > 95 ? 'critical' : 'high',
        title: 'CPU使用率过高',
        message: `CPU使用率达到 ${latestMetrics.cpu.usage.toFixed(1)}%`,
        metadata: { cpuUsage: latestMetrics.cpu.usage }
      })
    }

    // 内存使用率告警
    if (latestMetrics.memory.percentage > this.alertThresholds.memory) {
      this.createAlert({
        type: 'resource',
        severity: latestMetrics.memory.percentage > 95 ? 'critical' : 'high',
        title: '内存使用率过高',
        message: `内存使用率达到 ${latestMetrics.memory.percentage.toFixed(1)}%`,
        metadata: { memoryUsage: latestMetrics.memory.percentage }
      })
    }

    // 响应时间告警
    if (latestMetrics.application.responseTime > this.alertThresholds.responseTime) {
      this.createAlert({
        type: 'performance',
        severity: 'medium',
        title: '响应时间过长',
        message: `平均响应时间达到 ${latestMetrics.application.responseTime.toFixed(0)}ms`,
        metadata: { responseTime: latestMetrics.application.responseTime }
      })
    }

    // 错误率告警
    if (latestMetrics.application.errorRate > this.alertThresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity: 'high',
        title: '错误率过高',
        message: `错误率达到 ${latestMetrics.application.errorRate.toFixed(1)}%`,
        metadata: { errorRate: latestMetrics.application.errorRate }
      })
    }

    // 服务健康状态告警
    for (const [service, healthCheck] of this.healthChecks) {
      if (healthCheck.status === 'critical') {
        this.createAlert({
          type: 'error',
          severity: 'critical',
          title: `服务异常: ${service}`,
          message: healthCheck.message,
          metadata: { service, healthCheck }
        })
      }
    }
  }

  // 创建告警
  private createAlert(alertData: Omit<SystemAlert, 'id' | 'timestamp' | 'isResolved'>) {
    // 检查是否已存在相同的未解决告警
    const existingAlert = this.alerts.find(alert => 
      !alert.isResolved && 
      alert.type === alertData.type && 
      alert.title === alertData.title
    )

    if (existingAlert) {
      // 更新现有告警的时间戳
      existingAlert.timestamp = new Date()
      return
    }

    const alert: SystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      timestamp: new Date(),
      isResolved: false
    }

    this.alerts.unshift(alert)

    // 限制告警数量
    if (this.alerts.length > 500) {
      this.alerts.splice(500)
    }

    console.log(`🚨 新告警: ${alert.title}`)
  }

  // 解决告警
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.isResolved) {
      alert.isResolved = true
      alert.resolvedAt = new Date()
      console.log(`✅ 告警已解决: ${alert.title}`)
      return true
    }
    return false
  }

  // 获取最新指标
  public getLatestMetrics(): SystemMetrics | null {
    return this.metrics[0] || null
  }

  // 获取指标历史
  public getMetricsHistory(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(0, limit)
  }

  // 获取健康检查结果
  public getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values())
  }

  // 获取特定服务健康状态
  public getServiceHealth(service: string): HealthCheck | null {
    return this.healthChecks.get(service) || null
  }

  // 获取告警列表
  public getAlerts(includeResolved: boolean = false): SystemAlert[] {
    return includeResolved 
      ? this.alerts 
      : this.alerts.filter(alert => !alert.isResolved)
  }

  // 获取系统概览
  public getSystemOverview() {
    const latestMetrics = this.getLatestMetrics()
    const healthChecks = this.getHealthChecks()
    const activeAlerts = this.getAlerts(false)

    const healthyServices = healthChecks.filter(hc => hc.status === 'healthy').length
    const totalServices = healthChecks.length

    return {
      status: activeAlerts.length === 0 ? 'healthy' : 'warning',
      uptime: latestMetrics ? latestMetrics.application.uptime : 0,
      services: {
        healthy: healthyServices,
        total: totalServices,
        percentage: totalServices > 0 ? (healthyServices / totalServices * 100).toFixed(1) + '%' : '0%'
      },
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length
      },
      performance: latestMetrics ? {
        cpu: latestMetrics.cpu.usage.toFixed(1) + '%',
        memory: latestMetrics.memory.percentage.toFixed(1) + '%',
        responseTime: latestMetrics.application.responseTime.toFixed(0) + 'ms',
        errorRate: latestMetrics.application.errorRate.toFixed(1) + '%'
      } : null,
      lastUpdated: new Date().toISOString()
    }
  }

  // 获取性能统计
  public getPerformanceStats(timeRange: number = 3600000) { // 默认1小时
    const cutoffTime = new Date(Date.now() - timeRange)
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime)

    if (recentMetrics.length === 0) {
      return null
    }

    const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpu.usage, 0) / recentMetrics.length
    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memory.percentage, 0) / recentMetrics.length
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.application.responseTime, 0) / recentMetrics.length
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.application.errorRate, 0) / recentMetrics.length

    return {
      timeRange: timeRange / 1000 / 60, // 转换为分钟
      dataPoints: recentMetrics.length,
      averages: {
        cpu: avgCpu.toFixed(1) + '%',
        memory: avgMemory.toFixed(1) + '%',
        responseTime: avgResponseTime.toFixed(0) + 'ms',
        errorRate: avgErrorRate.toFixed(2) + '%'
      },
      peaks: {
        cpu: Math.max(...recentMetrics.map(m => m.cpu.usage)).toFixed(1) + '%',
        memory: Math.max(...recentMetrics.map(m => m.memory.percentage)).toFixed(1) + '%',
        responseTime: Math.max(...recentMetrics.map(m => m.application.responseTime)).toFixed(0) + 'ms'
      },
      trends: {
        cpu: this.calculateTrend(recentMetrics.map(m => m.cpu.usage)),
        memory: this.calculateTrend(recentMetrics.map(m => m.memory.percentage)),
        responseTime: this.calculateTrend(recentMetrics.map(m => m.application.responseTime))
      }
    }
  }

  // 计算趋势
  private calculateTrend(values: number[]): string {
    if (values.length < 2) return 'stable'
    
    const first = values[values.length - 1]
    const last = values[0]
    const change = ((last - first) / first) * 100

    if (Math.abs(change) < 5) return 'stable'
    return change > 0 ? 'increasing' : 'decreasing'
  }

  // 获取监控状态
  public getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      metricsCount: this.metrics.length,
      servicesCount: this.healthChecks.size,
      alertsCount: this.alerts.length,
      thresholds: this.alertThresholds,
      lastCollection: this.metrics[0]?.timestamp || null
    }
  }

  // 更新告警阈值
  public updateThresholds(newThresholds: Partial<typeof this.alertThresholds>) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds }
    console.log('📊 告警阈值已更新:', this.alertThresholds)
  }
}

// 导出单例实例
export const systemMonitor = SystemMonitor.getInstance()
