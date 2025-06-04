// Agent系统的统一导出和管理

export { BaseAgent, type AgentConfig, type AgentTask, type AgentResult, type AgentMessage } from './base-agent'
export { ContentScraperAgent } from './content-scraper-agent'
export { ContentAnalyzerAgent } from './content-analyzer-agent'
export { ImageGeneratorAgent } from './image-generator-agent'
export { KnowledgeConnectorAgent } from './knowledge-connector-agent'
export { AgentOrchestrator, type Workflow } from './agent-orchestrator'

import { AgentOrchestrator } from './agent-orchestrator'

// 全局Agent协调器实例
let orchestratorInstance: AgentOrchestrator | null = null

// 获取Agent协调器单例
export function getAgentOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator()
  }
  return orchestratorInstance
}

// 重置Agent系统（主要用于测试）
export function resetAgentSystem(): void {
  orchestratorInstance = null
}

// Agent系统配置
export const AGENT_CONFIG = {
  // 默认超时时间
  DEFAULT_TIMEOUT: 30000,
  
  // 最大重试次数
  MAX_RETRIES: 3,
  
  // 任务队列大小限制
  MAX_QUEUE_SIZE: 100,
  
  // 工作流清理间隔（毫秒）
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1小时
  
  // Agent类型
  AGENT_TYPES: {
    CONTENT_SCRAPER: 'content-scraper',
    CONTENT_ANALYZER: 'content-analyzer',
    IMAGE_GENERATOR: 'image-generator',
    KNOWLEDGE_CONNECTOR: 'knowledge-connector'
  },
  
  // 任务类型
  TASK_TYPES: {
    // 内容抓取相关
    VALIDATE_URL: 'validate-url',
    SCRAPE_CONTENT: 'scrape-content',
    EXTRACT_METADATA: 'extract-metadata',
    
    // 内容分析相关
    ANALYZE_CONTENT: 'analyze-content',
    EXTRACT_KEYWORDS: 'extract-keywords',
    CATEGORIZE_CONTENT: 'categorize-content',
    ASSESS_DIFFICULTY: 'assess-difficulty',
    
    // 图像生成相关
    GENERATE_SKETCH: 'generate-sketch',
    GENERATE_DIAGRAM: 'generate-diagram',
    CREATE_THUMBNAIL: 'create-thumbnail',
    OPTIMIZE_IMAGE: 'optimize-image',
    
    // 知识关联相关
    FIND_CONNECTIONS: 'find-connections',
    BUILD_KNOWLEDGE_GRAPH: 'build-knowledge-graph',
    SUGGEST_RELATED: 'suggest-related',
    ANALYZE_PATTERNS: 'analyze-patterns'
  }
}

// Agent系统工具函数
export const AgentUtils = {
  // 创建任务ID
  createTaskId: () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // 创建工作流ID
  createWorkflowId: () => `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // 验证任务类型
  isValidTaskType: (type: string) => Object.values(AGENT_CONFIG.TASK_TYPES).includes(type),
  
  // 格式化执行时间
  formatExecutionTime: (startTime: Date, endTime: Date) => {
    const duration = endTime.getTime() - startTime.getTime()
    if (duration < 1000) return `${duration}ms`
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`
    return `${(duration / 60000).toFixed(1)}min`
  },
  
  // 计算任务优先级
  calculateTaskPriority: (taskType: string, urgency: 'low' | 'normal' | 'high' = 'normal') => {
    const basePriority = {
      [AGENT_CONFIG.TASK_TYPES.VALIDATE_URL]: 1,
      [AGENT_CONFIG.TASK_TYPES.SCRAPE_CONTENT]: 2,
      [AGENT_CONFIG.TASK_TYPES.ANALYZE_CONTENT]: 3,
      [AGENT_CONFIG.TASK_TYPES.GENERATE_SKETCH]: 4,
      [AGENT_CONFIG.TASK_TYPES.FIND_CONNECTIONS]: 5
    }[taskType] || 3
    
    const urgencyMultiplier = { low: 0.5, normal: 1, high: 2 }[urgency]
    return basePriority * urgencyMultiplier
  }
}

// Agent系统状态监控
export class AgentMonitor {
  private static instance: AgentMonitor | null = null
  private metrics: Map<string, any> = new Map()
  
  static getInstance(): AgentMonitor {
    if (!AgentMonitor.instance) {
      AgentMonitor.instance = new AgentMonitor()
    }
    return AgentMonitor.instance
  }
  
  // 记录Agent性能指标
  recordAgentMetrics(agentId: string, taskType: string, executionTime: number, success: boolean) {
    const key = `${agentId}_${taskType}`
    const existing = this.metrics.get(key) || { count: 0, totalTime: 0, successCount: 0 }
    
    this.metrics.set(key, {
      count: existing.count + 1,
      totalTime: existing.totalTime + executionTime,
      successCount: existing.successCount + (success ? 1 : 0),
      avgTime: (existing.totalTime + executionTime) / (existing.count + 1),
      successRate: (existing.successCount + (success ? 1 : 0)) / (existing.count + 1)
    })
  }
  
  // 获取Agent性能报告
  getPerformanceReport() {
    const report: any = {}
    
    for (const [key, metrics] of this.metrics) {
      const [agentId, taskType] = key.split('_')
      if (!report[agentId]) report[agentId] = {}
      report[agentId][taskType] = metrics
    }
    
    return report
  }
  
  // 清理旧指标
  cleanup(olderThan: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    // 这里可以添加基于时间的清理逻辑
    // 当前简化实现
  }
}
