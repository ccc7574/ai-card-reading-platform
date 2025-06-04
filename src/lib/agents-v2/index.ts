// 现代AI Agent系统 - 基于LangChain和最新框架

export { LangChainAgent, type LangChainAgentConfig, type AgentExecutionResult } from './base-langchain-agent'
export { 
  ContentResearchAgent,
  CreativeDesignerAgent, 
  KnowledgeArchitectAgent,
  QualityAssuranceAgent,
  ModernAgentFactory 
} from './specialized-agents'
export { 
  ModernWorkflowOrchestrator,
  type WorkflowState,
  type WorkflowResult 
} from './workflow-orchestrator'
export { 
  WebScrapingTool,
  ContentAnalysisTool,
  ImageGenerationTool,
  KnowledgeConnectionTool,
  URLValidationTool,
  createDefaultTools 
} from './tools'

import { ModernWorkflowOrchestrator } from './workflow-orchestrator'

// 全局现代化协调器实例
let modernOrchestratorInstance: ModernWorkflowOrchestrator | null = null

// 获取现代化协调器单例
export function getModernOrchestrator(model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro'): ModernWorkflowOrchestrator {
  if (!modernOrchestratorInstance) {
    modernOrchestratorInstance = new ModernWorkflowOrchestrator(model)
  }
  return modernOrchestratorInstance
}

// 重置现代Agent系统（主要用于测试）
export function resetModernAgentSystem(): void {
  modernOrchestratorInstance = null
}

// 现代Agent系统配置
export const MODERN_AGENT_CONFIG = {
  // 支持的模型
  SUPPORTED_MODELS: {
    OPENAI_GPT4: 'gpt-4',
    OPENAI_GPT35: 'gpt-3.5-turbo',
    GOOGLE_GEMINI: 'gemini-pro'
  },
  
  // 默认配置
  DEFAULT_MODEL: 'gpt-4' as const,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2048,
  
  // Agent类型
  AGENT_TYPES: {
    CONTENT_RESEARCHER: 'content-researcher',
    CREATIVE_DESIGNER: 'creative-designer',
    KNOWLEDGE_ARCHITECT: 'knowledge-architect',
    QUALITY_ASSURANCE: 'quality-assurance'
  },
  
  // 工作流阶段
  WORKFLOW_STAGES: {
    CONTENT_RESEARCH: 'content-research',
    VISUAL_CREATION: 'visual-creation',
    KNOWLEDGE_CONNECTION: 'knowledge-connection',
    QUALITY_ASSURANCE: 'quality-assurance',
    FINAL_INTEGRATION: 'final-integration'
  },
  
  // 超时设置
  TIMEOUTS: {
    AGENT_EXECUTION: 60000, // 60秒
    WORKFLOW_TOTAL: 300000, // 5分钟
    TOOL_EXECUTION: 30000   // 30秒
  }
}

// 现代Agent系统工具函数
export const ModernAgentUtils = {
  // 创建工作流ID
  createWorkflowId: () => `modern_workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // 验证模型支持
  isValidModel: (model: string): model is 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' => {
    return Object.values(MODERN_AGENT_CONFIG.SUPPORTED_MODELS).includes(model as any)
  },
  
  // 格式化执行时间
  formatExecutionTime: (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  },
  
  // 计算工作流进度
  calculateProgress: (state: any) => {
    const stages = [
      'urlValidated',
      'contentScraped', 
      'contentAnalyzed',
      'visualCreated',
      'knowledgeConnected',
      'qualityAssessed',
      'finalCard'
    ]
    
    const completed = stages.filter(stage => !!state[stage]).length
    return Math.round((completed / stages.length) * 100)
  },
  
  // 生成状态摘要
  generateStatusSummary: (state: any) => {
    const progress = ModernAgentUtils.calculateProgress(state)
    const hasErrors = state.errors && state.errors.length > 0
    const hasWarnings = state.warnings && state.warnings.length > 0
    
    let status = 'running'
    if (state.endTime) {
      status = hasErrors ? 'failed' : 'completed'
    }
    
    return {
      status,
      progress,
      hasErrors,
      hasWarnings,
      currentStage: state.processingSteps?.[state.processingSteps.length - 1] || 'initializing'
    }
  }
}

// 现代Agent系统监控
export class ModernAgentMonitor {
  private static instance: ModernAgentMonitor | null = null
  private metrics: Map<string, any> = new Map()
  private performanceData: Array<{
    timestamp: Date
    workflowId: string
    stage: string
    duration: number
    success: boolean
  }> = []
  
  static getInstance(): ModernAgentMonitor {
    if (!ModernAgentMonitor.instance) {
      ModernAgentMonitor.instance = new ModernAgentMonitor()
    }
    return ModernAgentMonitor.instance
  }
  
  // 记录工作流性能
  recordWorkflowPerformance(
    workflowId: string, 
    stage: string, 
    duration: number, 
    success: boolean
  ) {
    this.performanceData.push({
      timestamp: new Date(),
      workflowId,
      stage,
      duration,
      success
    })
    
    // 限制数据量
    if (this.performanceData.length > 1000) {
      this.performanceData = this.performanceData.slice(-500)
    }
    
    // 更新聚合指标
    this.updateAggregateMetrics(stage, duration, success)
  }
  
  private updateAggregateMetrics(stage: string, duration: number, success: boolean) {
    const key = `stage_${stage}`
    const existing = this.metrics.get(key) || { 
      count: 0, 
      totalDuration: 0, 
      successCount: 0,
      avgDuration: 0,
      successRate: 0
    }
    
    const newCount = existing.count + 1
    const newTotalDuration = existing.totalDuration + duration
    const newSuccessCount = existing.successCount + (success ? 1 : 0)
    
    this.metrics.set(key, {
      count: newCount,
      totalDuration: newTotalDuration,
      successCount: newSuccessCount,
      avgDuration: newTotalDuration / newCount,
      successRate: newSuccessCount / newCount
    })
  }
  
  // 获取性能报告
  getPerformanceReport() {
    const stageMetrics: Record<string, any> = {}
    
    for (const [key, metrics] of this.metrics) {
      if (key.startsWith('stage_')) {
        const stage = key.replace('stage_', '')
        stageMetrics[stage] = {
          ...metrics,
          avgDuration: Math.round(metrics.avgDuration),
          successRate: Math.round(metrics.successRate * 100)
        }
      }
    }
    
    // 计算总体统计
    const recentData = this.performanceData.slice(-100) // 最近100条记录
    const overallSuccessRate = recentData.length > 0 
      ? recentData.filter(d => d.success).length / recentData.length 
      : 0
    
    const avgWorkflowDuration = this.calculateAverageWorkflowDuration()
    
    return {
      stageMetrics,
      overall: {
        totalWorkflows: new Set(this.performanceData.map(d => d.workflowId)).size,
        recentSuccessRate: Math.round(overallSuccessRate * 100),
        avgWorkflowDuration: Math.round(avgWorkflowDuration),
        dataPoints: this.performanceData.length
      },
      trends: this.calculateTrends()
    }
  }
  
  private calculateAverageWorkflowDuration(): number {
    const workflowDurations = new Map<string, number>()
    
    this.performanceData.forEach(data => {
      const existing = workflowDurations.get(data.workflowId) || 0
      workflowDurations.set(data.workflowId, existing + data.duration)
    })
    
    const durations = Array.from(workflowDurations.values())
    return durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0
  }
  
  private calculateTrends() {
    const recent = this.performanceData.slice(-50)
    const older = this.performanceData.slice(-100, -50)
    
    if (recent.length === 0 || older.length === 0) {
      return { performance: 'stable', message: '数据不足' }
    }
    
    const recentAvg = recent.reduce((sum, d) => sum + d.duration, 0) / recent.length
    const olderAvg = older.reduce((sum, d) => sum + d.duration, 0) / older.length
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (Math.abs(change) < 5) {
      return { performance: 'stable', message: '性能稳定' }
    } else if (change > 0) {
      return { performance: 'declining', message: `性能下降 ${change.toFixed(1)}%` }
    } else {
      return { performance: 'improving', message: `性能提升 ${Math.abs(change).toFixed(1)}%` }
    }
  }
  
  // 清理旧数据
  cleanup(olderThan: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    this.performanceData = this.performanceData.filter(d => d.timestamp > olderThan)
  }
}
