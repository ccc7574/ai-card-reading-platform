import { nanoid } from 'nanoid'
import { BaseAgent, AgentTask, AgentResult, AgentMessage } from './base-agent'
import { ContentScraperAgent } from './content-scraper-agent'
import { ContentAnalyzerAgent } from './content-analyzer-agent'
import { ImageGeneratorAgent } from './image-generator-agent'
import { KnowledgeConnectorAgent } from './knowledge-connector-agent'
import { AIProvider } from '../ai-services'

// 工作流定义
export interface Workflow {
  id: string
  name: string
  description: string
  tasks: AgentTask[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  result?: any
  error?: string
}

// Agent协调器
export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map()
  private taskQueue: AgentTask[] = []
  private runningTasks: Map<string, AgentTask> = new Map()
  private workflows: Map<string, Workflow> = new Map()
  private messageQueue: AgentMessage[] = []

  constructor() {
    this.initializeAgents()
  }

  private initializeAgents() {
    // 初始化所有Agent
    const scraperAgent = new ContentScraperAgent()
    const analyzerAgent = new ContentAnalyzerAgent(AIProvider.OPENAI)
    const imageAgent = new ImageGeneratorAgent(AIProvider.OPENAI, 'standard')
    const knowledgeAgent = new KnowledgeConnectorAgent()

    this.agents.set(scraperAgent.getInfo().id, scraperAgent)
    this.agents.set(analyzerAgent.getInfo().id, analyzerAgent)
    this.agents.set(imageAgent.getInfo().id, imageAgent)
    this.agents.set(knowledgeAgent.getInfo().id, knowledgeAgent)

    console.log(`🤖 Agent协调器初始化完成，共${this.agents.size}个Agent`)
  }

  // 创建卡片生成工作流
  async createCardGenerationWorkflow(
    url: string, 
    aiProvider: AIProvider = AIProvider.OPENAI,
    imageMode: 'standard' | 'premium' = 'standard'
  ): Promise<string> {
    const workflowId = nanoid()
    
    // 更新Agent配置
    this.updateAgentConfigurations(aiProvider, imageMode)
    
    const workflow: Workflow = {
      id: workflowId,
      name: 'AI卡片生成',
      description: `从URL生成AI卡片: ${url}`,
      tasks: [
        {
          id: nanoid(),
          type: 'validate-url',
          input: { url },
          status: 'pending',
          createdAt: new Date()
        }
      ],
      status: 'pending',
      createdAt: new Date()
    }

    this.workflows.set(workflowId, workflow)
    
    // 开始执行工作流
    this.executeWorkflow(workflowId)
    
    return workflowId
  }

  private updateAgentConfigurations(aiProvider: AIProvider, imageMode: 'standard' | 'premium') {
    // 更新内容分析Agent的AI提供商
    for (const agent of this.agents.values()) {
      if (agent instanceof ContentAnalyzerAgent) {
        (agent as any).aiProvider = aiProvider
      }
      if (agent instanceof ImageGeneratorAgent) {
        agent.setAIProvider(aiProvider)
        agent.setImageMode(imageMode)
      }
    }
  }

  private async executeWorkflow(workflowId: string) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    workflow.status = 'running'
    console.log(`🚀 开始执行工作流: ${workflow.name}`)

    try {
      let currentTasks = [...workflow.tasks]
      const completedTasks: AgentTask[] = []
      const results: any = {}

      while (currentTasks.length > 0) {
        const task = currentTasks.shift()!
        
        // 找到能处理此任务的Agent
        const agent = this.findAgentForTask(task)
        if (!agent) {
          throw new Error(`No agent found for task type: ${task.type}`)
        }

        console.log(`📋 执行任务: ${task.type} (Agent: ${agent.getInfo().name})`)
        
        // 执行任务
        const result = await agent.execute(task)
        completedTasks.push(task)
        
        if (result.success) {
          // 保存结果
          results[task.type] = result.data
          
          // 添加后续任务
          if (result.nextTasks) {
            const nextTasks = result.nextTasks.map(taskTemplate => ({
              id: nanoid(),
              type: taskTemplate.type!,
              input: taskTemplate.input,
              status: 'pending' as const,
              createdAt: new Date()
            }))
            currentTasks.push(...nextTasks)
            workflow.tasks.push(...nextTasks)
          }
        } else {
          console.error(`❌ 任务失败: ${task.type} - ${result.error}`)
          // 某些任务失败不影响整体流程，继续执行
        }
      }

      // 工作流完成
      workflow.status = 'completed'
      workflow.completedAt = new Date()
      workflow.result = this.buildFinalResult(results)
      
      console.log(`✅ 工作流完成: ${workflow.name}`)
      
    } catch (error) {
      workflow.status = 'failed'
      workflow.error = error instanceof Error ? error.message : 'Unknown error'
      workflow.completedAt = new Date()
      
      console.error(`❌ 工作流失败: ${workflow.name} - ${workflow.error}`)
    }
  }

  private findAgentForTask(task: AgentTask): BaseAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.canHandle(task)) {
        return agent
      }
    }
    return undefined
  }

  private buildFinalResult(results: any) {
    // 构建最终的卡片结果
    const scrapedContent = results['scrape-content'] || results['validate-url']
    const analysisResult = results['analyze-content']
    const sketchResult = results['generate-sketch']
    const connections = results['find-connections']

    if (!scrapedContent) {
      throw new Error('Content scraping failed')
    }

    // 使用分析结果或降级到基础内容
    const cardData = analysisResult || {
      title: scrapedContent.title,
      summary: `📄 ${scrapedContent.title}`,
      content: `<p>${scrapedContent.content.slice(0, 500)}...</p>`,
      tags: ['AI', '内容', '分析'],
      category: 'article',
      difficulty: 'intermediate',
      readingTime: Math.ceil(scrapedContent.content.length / 200),
      keyPoints: ['内容分析', '自动生成']
    }

    return {
      id: `generated-${Date.now()}`,
      title: cardData.title,
      summary: cardData.summary,
      content: cardData.content,
      sourceUrl: scrapedContent.url,
      sourceTitle: scrapedContent.title,
      author: scrapedContent.author || 'AI生成',
      tags: cardData.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: cardData.category,
      difficulty: cardData.difficulty,
      readingTime: cardData.readingTime,
      imageUrl: sketchResult?.imageUrl || '/api/placeholder/300/200',
      connections: connections?.connections || [],
      metadata: {
        workflow: 'multi-agent',
        agents: Array.from(this.agents.values()).map(a => a.getInfo().name),
        processingTime: Date.now()
      }
    }
  }

  // 获取工作流状态
  getWorkflowStatus(workflowId: string) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return null

    const completedTasks = workflow.tasks.filter(t => t.status === 'completed').length
    const totalTasks = workflow.tasks.length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      progress: Math.round(progress),
      completedTasks,
      totalTasks,
      createdAt: workflow.createdAt,
      completedAt: workflow.completedAt,
      result: workflow.result,
      error: workflow.error,
      currentTask: workflow.tasks.find(t => t.status === 'running')?.type
    }
  }

  // 获取所有Agent状态
  getAgentStatuses() {
    return Array.from(this.agents.values()).map(agent => agent.getStatus())
  }

  // 获取系统统计
  getSystemStats() {
    const workflows = Array.from(this.workflows.values())
    
    return {
      agents: {
        total: this.agents.size,
        running: Array.from(this.agents.values()).filter(a => a.getStatus().isRunning).length
      },
      workflows: {
        total: workflows.length,
        completed: workflows.filter(w => w.status === 'completed').length,
        running: workflows.filter(w => w.status === 'running').length,
        failed: workflows.filter(w => w.status === 'failed').length
      },
      tasks: {
        queued: this.taskQueue.length,
        running: this.runningTasks.size
      }
    }
  }

  // 停止工作流
  async stopWorkflow(workflowId: string) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow || workflow.status !== 'running') return

    workflow.status = 'failed'
    workflow.error = 'Cancelled by user'
    workflow.completedAt = new Date()

    // 停止相关的Agent
    for (const agent of this.agents.values()) {
      if (agent.getStatus().isRunning) {
        await agent.stop()
      }
    }
  }

  // 清理完成的工作流
  cleanupCompletedWorkflows(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    for (const [id, workflow] of this.workflows) {
      if (workflow.status === 'completed' && workflow.completedAt && workflow.completedAt < olderThan) {
        this.workflows.delete(id)
      }
    }
  }
}
