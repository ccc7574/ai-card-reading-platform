// Agent结果缓存系统
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // 生存时间（毫秒）
  workflowId: string
  inputHash: string
}

export class AgentCache {
  private cache: Map<string, CacheEntry> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5分钟

  // 缓存配置 - 不同工作流的缓存时间
  private cacheTTLConfig = {
    'content-recommendation': 10 * 60 * 1000, // 10分钟
    'content-search': 5 * 60 * 1000,          // 5分钟
    'user-achievement': 30 * 60 * 1000,       // 30分钟
    'user-analytics': 60 * 60 * 1000,         // 1小时
    'user-engagement': 15 * 60 * 1000,        // 15分钟
    'trend-analysis': 30 * 60 * 1000          // 30分钟
  }

  // 生成缓存键
  private generateCacheKey(workflowId: string, input: any): string {
    const inputHash = this.hashInput(input)
    return `${workflowId}:${inputHash}`
  }

  // 简单的输入哈希函数
  private hashInput(input: any): string {
    const str = JSON.stringify(input, Object.keys(input).sort())
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }

  // 获取缓存
  get(workflowId: string, input: any): any | null {
    const key = this.generateCacheKey(workflowId, input)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // 检查是否过期
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    console.log(`🎯 Agent缓存命中: ${workflowId}`)
    return entry.data
  }

  // 设置缓存
  set(workflowId: string, input: any, data: any): void {
    const key = this.generateCacheKey(workflowId, input)
    const ttl = this.cacheTTLConfig[workflowId] || this.defaultTTL
    const inputHash = this.hashInput(input)

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      workflowId,
      inputHash
    }

    this.cache.set(key, entry)
    console.log(`💾 Agent结果已缓存: ${workflowId} (TTL: ${ttl/1000}s)`)

    // 清理过期缓存
    this.cleanup()
  }

  // 清理过期缓存
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 清理了 ${cleanedCount} 个过期缓存`)
    }
  }

  // 清除特定工作流的缓存
  clearWorkflow(workflowId: string): void {
    let clearedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.workflowId === workflowId) {
        this.cache.delete(key)
        clearedCount++
      }
    }

    console.log(`🗑️ 清除了 ${workflowId} 的 ${clearedCount} 个缓存`)
  }

  // 清除用户相关的缓存
  clearUserCache(userId: string): void {
    let clearedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      // 检查缓存数据中是否包含该用户ID
      const dataStr = JSON.stringify(entry.data)
      if (dataStr.includes(userId)) {
        this.cache.delete(key)
        clearedCount++
      }
    }

    console.log(`👤 清除了用户 ${userId} 的 ${clearedCount} 个缓存`)
  }

  // 获取缓存统计
  getStats(): any {
    const now = Date.now()
    const stats = {
      totalEntries: this.cache.size,
      byWorkflow: {},
      expiredEntries: 0,
      totalSize: 0
    }

    for (const [key, entry] of this.cache.entries()) {
      // 按工作流统计
      if (!stats.byWorkflow[entry.workflowId]) {
        stats.byWorkflow[entry.workflowId] = {
          count: 0,
          avgAge: 0,
          expired: 0
        }
      }

      stats.byWorkflow[entry.workflowId].count++
      
      // 检查是否过期
      const age = now - entry.timestamp
      if (age > entry.ttl) {
        stats.expiredEntries++
        stats.byWorkflow[entry.workflowId].expired++
      }

      // 估算大小
      stats.totalSize += JSON.stringify(entry.data).length
    }

    // 计算平均年龄
    for (const workflowId in stats.byWorkflow) {
      const workflowEntries = Array.from(this.cache.values())
        .filter(entry => entry.workflowId === workflowId)
      
      if (workflowEntries.length > 0) {
        const totalAge = workflowEntries.reduce((sum, entry) => 
          sum + (now - entry.timestamp), 0)
        stats.byWorkflow[workflowId].avgAge = Math.round(totalAge / workflowEntries.length / 1000) // 秒
      }
    }

    return stats
  }

  // 清空所有缓存
  clear(): void {
    const count = this.cache.size
    this.cache.clear()
    console.log(`🗑️ 清空了所有缓存 (${count} 个条目)`)
  }

  // 预热缓存 - 为常用查询预先生成缓存
  async warmup(commonQueries: Array<{workflowId: string, input: any}>): Promise<void> {
    console.log(`🔥 开始缓存预热 (${commonQueries.length} 个查询)`)
    
    // 这里可以实现预热逻辑
    // 例如：为热门用户、常见搜索等预先执行Agent工作流
    
    for (const query of commonQueries) {
      const key = this.generateCacheKey(query.workflowId, query.input)
      if (!this.cache.has(key)) {
        // 这里可以调用实际的Agent执行逻辑
        console.log(`🔥 预热缓存: ${query.workflowId}`)
      }
    }
  }

  // 缓存健康检查
  healthCheck(): any {
    const stats = this.getStats()
    const health = {
      status: 'healthy',
      issues: [],
      recommendations: []
    }

    // 检查过期条目比例
    const expiredRatio = stats.expiredEntries / stats.totalEntries
    if (expiredRatio > 0.3) {
      health.status = 'warning'
      health.issues.push('过期缓存比例过高')
      health.recommendations.push('增加清理频率')
    }

    // 检查缓存大小
    if (stats.totalSize > 10 * 1024 * 1024) { // 10MB
      health.status = 'warning'
      health.issues.push('缓存占用内存过大')
      health.recommendations.push('减少缓存TTL或增加清理')
    }

    // 检查缓存命中率（需要额外统计）
    // 这里可以添加命中率统计逻辑

    return {
      ...health,
      stats,
      timestamp: new Date().toISOString()
    }
  }
}

// 全局缓存实例
export const agentCache = new AgentCache()
