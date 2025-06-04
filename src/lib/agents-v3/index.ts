// 智能AI Agent系统 - 基于最新AI SDK和智能协作框架

export { 
  IntelligentAgent, 
  type IntelligentAgentConfig, 
  type IntelligentTool,
  type Task,
  type ToolResult,
  type AgentContext,
  type AgentMemory,
  type ReasoningConfig
} from './intelligent-agent-core'

export {
  ContentStrategistAgent,
  CreativeDirectorAgent,
  KnowledgeEngineerAgent,
  QualityAssuranceExpertAgent,
  IntelligentAgentFactory
} from './specialized-intelligent-agents'

export {
  IntelligentCollaborationSystem,
  type CollaborationSession,
  type CollaborationStrategy,
  type Decision
} from './intelligent-collaboration-system'

import { IntelligentCollaborationSystem } from './intelligent-collaboration-system'

// 全局智能协作系统实例
let intelligentSystemInstance: IntelligentCollaborationSystem | null = null

// 获取智能协作系统单例
export function getIntelligentSystem(
  model?: 'gpt-4' | 'gpt-4-turbo' | 'claude-3-opus' | 'claude-3-sonnet'
): IntelligentCollaborationSystem {
  if (!intelligentSystemInstance) {
    intelligentSystemInstance = new IntelligentCollaborationSystem(model)
  }
  return intelligentSystemInstance
}

// 重置智能系统（主要用于测试）
export function resetIntelligentSystem(): void {
  intelligentSystemInstance = null
}

// 智能Agent系统配置
export const INTELLIGENT_AGENT_CONFIG = {
  // 支持的AI模型
  SUPPORTED_MODELS: {
    GPT_4: 'gpt-4',
    GPT_4_TURBO: 'gpt-4-turbo',
    CLAUDE_3_OPUS: 'claude-3-opus',
    CLAUDE_3_SONNET: 'claude-3-sonnet'
  } as const,

  // 协作策略
  COLLABORATION_STRATEGIES: {
    CONSENSUS_BUILDING: 'consensus_building',
    EXPERT_DEBATE: 'expert_debate',
    PARALLEL_PROCESSING: 'parallel_processing',
    HIERARCHICAL_REVIEW: 'hierarchical_review',
    CREATIVE_BRAINSTORM: 'creative_brainstorm',
    QUALITY_ASSURANCE: 'quality_assurance'
  } as const,

  // Agent角色
  AGENT_ROLES: {
    CONTENT_STRATEGIST: 'content_strategist',
    CREATIVE_DIRECTOR: 'creative_director',
    KNOWLEDGE_ENGINEER: 'knowledge_engineer',
    QUALITY_ASSURANCE_EXPERT: 'quality_assurance_expert'
  } as const,

  // 推理策略
  REASONING_STRATEGIES: {
    CHAIN_OF_THOUGHT: 'chain_of_thought',
    TREE_OF_THOUGHT: 'tree_of_thought',
    REFLECTION: 'reflection',
    DEBATE: 'debate'
  } as const,

  // 默认配置
  DEFAULTS: {
    MODEL: 'gpt-4' as const,
    COLLABORATION_STRATEGY: 'consensus_building' as const,
    REASONING_STRATEGY: 'chain_of_thought' as const,
    TEMPERATURE: 0.7,
    MAX_TOKENS: 4096,
    TIMEOUT: 180000 // 3分钟
  }
}

// 智能Agent工具函数
export const IntelligentAgentUtils = {
  // 创建会话ID
  createSessionId: () => `intelligent_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // 验证模型支持
  isValidModel: (model: string): model is keyof typeof INTELLIGENT_AGENT_CONFIG.SUPPORTED_MODELS => {
    return Object.values(INTELLIGENT_AGENT_CONFIG.SUPPORTED_MODELS).includes(model as any)
  },
  
  // 验证协作策略
  isValidStrategy: (strategy: string): strategy is keyof typeof INTELLIGENT_AGENT_CONFIG.COLLABORATION_STRATEGIES => {
    return Object.values(INTELLIGENT_AGENT_CONFIG.COLLABORATION_STRATEGIES).includes(strategy as any)
  },
  
  // 格式化执行时间
  formatDuration: (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}min`
    return `${(ms / 3600000).toFixed(1)}h`
  },
  
  // 计算协作效率
  calculateCollaborationEfficiency: (session: any) => {
    if (!session.results) return 0
    
    const factors = {
      participantCount: Math.min(session.participantCount / 4, 1), // 最优4个参与者
      insightDensity: Math.min(session.insightCount / 10, 1), // 每10个洞察为满分
      decisionQuality: Math.min(session.decisionCount / 3, 1), // 每3个决策为满分
      timeEfficiency: session.duration < 180000 ? 1 : 180000 / session.duration // 3分钟内为满分
    }
    
    return Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length
  },
  
  // 生成协作摘要
  generateCollaborationSummary: (session: any) => {
    const efficiency = IntelligentAgentUtils.calculateCollaborationEfficiency(session)
    const duration = IntelligentAgentUtils.formatDuration(session.duration)
    
    return {
      sessionId: session.id,
      strategy: session.strategy,
      status: session.status,
      efficiency: Math.round(efficiency * 100),
      duration,
      participants: session.participantCount,
      insights: session.insightCount,
      decisions: session.decisionCount,
      quality: session.results ? 'high' : 'pending'
    }
  }
}

// 智能Agent性能监控
export class IntelligentAgentMonitor {
  private static instance: IntelligentAgentMonitor | null = null
  private performanceData: Array<{
    timestamp: Date
    sessionId: string
    strategy: string
    duration: number
    efficiency: number
    success: boolean
  }> = []
  
  static getInstance(): IntelligentAgentMonitor {
    if (!IntelligentAgentMonitor.instance) {
      IntelligentAgentMonitor.instance = new IntelligentAgentMonitor()
    }
    return IntelligentAgentMonitor.instance
  }
  
  // 记录协作性能
  recordCollaborationPerformance(
    sessionId: string,
    strategy: string,
    duration: number,
    efficiency: number,
    success: boolean
  ) {
    this.performanceData.push({
      timestamp: new Date(),
      sessionId,
      strategy,
      duration,
      efficiency,
      success
    })
    
    // 限制数据量
    if (this.performanceData.length > 1000) {
      this.performanceData = this.performanceData.slice(-500)
    }
  }
  
  // 获取性能报告
  getPerformanceReport() {
    const recentData = this.performanceData.slice(-100)
    
    if (recentData.length === 0) {
      return {
        totalSessions: 0,
        averageEfficiency: 0,
        averageDuration: 0,
        successRate: 0,
        strategyPerformance: {},
        trends: { message: '暂无数据' }
      }
    }
    
    // 按策略分组统计
    const strategyStats = new Map<string, {
      count: number
      totalEfficiency: number
      totalDuration: number
      successCount: number
    }>()
    
    recentData.forEach(data => {
      const existing = strategyStats.get(data.strategy) || {
        count: 0,
        totalEfficiency: 0,
        totalDuration: 0,
        successCount: 0
      }
      
      strategyStats.set(data.strategy, {
        count: existing.count + 1,
        totalEfficiency: existing.totalEfficiency + data.efficiency,
        totalDuration: existing.totalDuration + data.duration,
        successCount: existing.successCount + (data.success ? 1 : 0)
      })
    })
    
    // 计算策略性能
    const strategyPerformance: Record<string, any> = {}
    for (const [strategy, stats] of strategyStats) {
      strategyPerformance[strategy] = {
        sessions: stats.count,
        avgEfficiency: Math.round((stats.totalEfficiency / stats.count) * 100),
        avgDuration: Math.round(stats.totalDuration / stats.count),
        successRate: Math.round((stats.successCount / stats.count) * 100)
      }
    }
    
    return {
      totalSessions: recentData.length,
      averageEfficiency: Math.round(
        (recentData.reduce((sum, d) => sum + d.efficiency, 0) / recentData.length) * 100
      ),
      averageDuration: Math.round(
        recentData.reduce((sum, d) => sum + d.duration, 0) / recentData.length
      ),
      successRate: Math.round(
        (recentData.filter(d => d.success).length / recentData.length) * 100
      ),
      strategyPerformance,
      trends: this.calculateTrends(recentData)
    }
  }
  
  private calculateTrends(data: any[]) {
    if (data.length < 10) {
      return { message: '数据不足以分析趋势' }
    }
    
    const recent = data.slice(-20)
    const older = data.slice(-40, -20)
    
    const recentAvgEfficiency = recent.reduce((sum, d) => sum + d.efficiency, 0) / recent.length
    const olderAvgEfficiency = older.reduce((sum, d) => sum + d.efficiency, 0) / older.length
    
    const efficiencyChange = ((recentAvgEfficiency - olderAvgEfficiency) / olderAvgEfficiency) * 100
    
    return {
      efficiencyTrend: efficiencyChange > 5 ? 'improving' : efficiencyChange < -5 ? 'declining' : 'stable',
      efficiencyChange: Math.round(efficiencyChange),
      message: `效率${efficiencyChange > 0 ? '提升' : '下降'}${Math.abs(efficiencyChange).toFixed(1)}%`
    }
  }
  
  // 清理旧数据
  cleanup(olderThan: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    this.performanceData = this.performanceData.filter(d => d.timestamp > olderThan)
  }
}

// 智能Agent实验室
export class IntelligentAgentLab {
  // 实验不同的协作策略
  static async experimentStrategies(
    url: string,
    strategies: string[] = Object.values(INTELLIGENT_AGENT_CONFIG.COLLABORATION_STRATEGIES)
  ) {
    const system = getIntelligentSystem()
    const results = []
    
    for (const strategy of strategies) {
      console.log(`🧪 实验协作策略: ${strategy}`)
      
      const sessionId = await system.createCardGenerationSession(
        url, 
        strategy as any
      )
      
      // 等待完成
      let attempts = 0
      while (attempts < 60) { // 最多等待5分钟
        const status = system.getSessionStatus(sessionId)
        if (status?.status === 'completed' || status?.status === 'failed') {
          results.push({
            strategy,
            status: status.status,
            duration: status.duration,
            efficiency: IntelligentAgentUtils.calculateCollaborationEfficiency(status)
          })
          break
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000)) // 等待5秒
        attempts++
      }
    }
    
    return results
  }
  
  // 分析最佳协作模式
  static analyzeBestCollaborationMode(experimentResults: any[]) {
    const successful = experimentResults.filter(r => r.status === 'completed')
    
    if (successful.length === 0) {
      return { recommendation: 'consensus_building', reason: '默认推荐' }
    }
    
    // 按效率排序
    successful.sort((a, b) => b.efficiency - a.efficiency)
    
    return {
      recommendation: successful[0].strategy,
      reason: `最高效率: ${Math.round(successful[0].efficiency * 100)}%`,
      alternatives: successful.slice(1, 3).map(r => ({
        strategy: r.strategy,
        efficiency: Math.round(r.efficiency * 100)
      }))
    }
  }
}
