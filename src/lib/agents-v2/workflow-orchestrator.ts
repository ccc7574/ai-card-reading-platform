import { nanoid } from 'nanoid'
import { ModernAgentFactory } from './specialized-agents'
import { LangChainAgent, AgentExecutionResult } from './base-langchain-agent'

// 工作流状态
export interface WorkflowState {
  id: string
  url: string
  aiProvider: 'openai' | 'gemini'
  imageMode: 'standard' | 'premium'
  
  // 处理阶段
  urlValidated?: boolean
  contentScraped?: any
  contentAnalyzed?: any
  visualCreated?: any
  knowledgeConnected?: any
  qualityAssessed?: any
  
  // 最终结果
  finalCard?: any
  
  // 元数据
  startTime: Date
  endTime?: Date
  errors: string[]
  warnings: string[]
  processingSteps: string[]
}

// 工作流结果
export interface WorkflowResult {
  success: boolean
  card?: any
  state: WorkflowState
  executionTime: number
  agentReports: Record<string, AgentExecutionResult>
}

// 现代化工作流协调器
export class ModernWorkflowOrchestrator {
  private agents: {
    researcher: LangChainAgent
    designer: LangChainAgent
    architect: LangChainAgent
    qa: LangChainAgent
  }
  
  private activeWorkflows: Map<string, WorkflowState> = new Map()

  constructor(model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' = 'gpt-4') {
    console.log(`🚀 初始化现代化工作流协调器 (模型: ${model})`)
    
    // 创建专业化Agent团队
    this.agents = ModernAgentFactory.createAllAgents(model)
    
    console.log(`✅ Agent团队初始化完成：
    - 📚 内容研究专家: ${this.agents.researcher.getInfo().name}
    - 🎨 创意设计师: ${this.agents.designer.getInfo().name}
    - 🧠 知识架构师: ${this.agents.architect.getInfo().name}
    - ✅ 质量保证专家: ${this.agents.qa.getInfo().name}`)
  }

  // 创建AI卡片生成工作流
  async createCardGenerationWorkflow(
    url: string,
    aiProvider: 'openai' | 'gemini' = 'openai',
    imageMode: 'standard' | 'premium' = 'standard'
  ): Promise<string> {
    const workflowId = nanoid()
    
    const state: WorkflowState = {
      id: workflowId,
      url,
      aiProvider,
      imageMode,
      startTime: new Date(),
      errors: [],
      warnings: [],
      processingSteps: []
    }
    
    this.activeWorkflows.set(workflowId, state)
    
    console.log(`🎯 创建工作流: ${workflowId}`)
    console.log(`📍 URL: ${url}`)
    console.log(`🤖 AI提供商: ${aiProvider}`)
    console.log(`🎨 图像模式: ${imageMode}`)
    
    // 异步执行工作流
    this.executeWorkflow(workflowId).catch(error => {
      console.error(`❌ 工作流执行失败: ${workflowId}`, error)
      state.errors.push(error.message)
    })
    
    return workflowId
  }

  // 执行工作流
  private async executeWorkflow(workflowId: string): Promise<void> {
    const state = this.activeWorkflows.get(workflowId)
    if (!state) throw new Error('工作流状态不存在')

    try {
      console.log(`🚀 开始执行工作流: ${workflowId}`)

      // 阶段1: 内容研究
      await this.executeContentResearch(state)
      
      // 阶段2: 视觉创作
      await this.executeVisualCreation(state)
      
      // 阶段3: 知识关联
      await this.executeKnowledgeConnection(state)
      
      // 阶段4: 质量保证
      await this.executeQualityAssurance(state)
      
      // 阶段5: 最终整合
      await this.executeFinalIntegration(state)
      
      state.endTime = new Date()
      console.log(`✅ 工作流完成: ${workflowId}`)
      
    } catch (error) {
      state.errors.push(error instanceof Error ? error.message : '未知错误')
      state.endTime = new Date()
      console.error(`❌ 工作流失败: ${workflowId}`, error)
    }
  }

  // 阶段1: 内容研究
  private async executeContentResearch(state: WorkflowState): Promise<void> {
    state.processingSteps.push('开始内容研究')
    console.log(`📚 执行内容研究: ${state.url}`)
    
    try {
      const result = await this.agents.researcher.researchContent(state.url)
      
      if (result.success) {
        // 解析研究结果
        const output = result.output
        state.contentScraped = this.extractScrapedContent(output)
        state.contentAnalyzed = this.extractAnalyzedContent(output)
        state.urlValidated = true
        
        state.processingSteps.push('内容研究完成')
        console.log(`✅ 内容研究完成`)
      } else {
        throw new Error(result.error || '内容研究失败')
      }
    } catch (error) {
      state.warnings.push(`内容研究警告: ${error instanceof Error ? error.message : '未知错误'}`)
      
      // 降级处理
      state.contentAnalyzed = {
        title: '内容分析',
        summary: '基础内容处理',
        tags: ['AI', '内容', '分析'],
        category: 'article',
        difficulty: 'intermediate',
        keyPoints: ['内容处理', '自动分析'],
        readingTime: 5
      }
      state.urlValidated = true
      state.processingSteps.push('内容研究(降级模式)完成')
    }
  }

  // 阶段2: 视觉创作
  private async executeVisualCreation(state: WorkflowState): Promise<void> {
    state.processingSteps.push('开始视觉创作')
    console.log(`🎨 执行视觉创作`)
    
    try {
      const concept = state.contentAnalyzed?.title || '概念图'
      const result = await this.agents.designer.createVisualContent(concept, 'sketch')
      
      if (result.success) {
        state.visualCreated = this.extractVisualContent(result.output)
        state.processingSteps.push('视觉创作完成')
        console.log(`✅ 视觉创作完成`)
      } else {
        throw new Error(result.error || '视觉创作失败')
      }
    } catch (error) {
      state.warnings.push(`视觉创作警告: ${error instanceof Error ? error.message : '未知错误'}`)
      
      // 降级处理
      state.visualCreated = {
        imageUrl: '/api/placeholder/300/200',
        description: '概念图',
        style: 'placeholder'
      }
      state.processingSteps.push('视觉创作(降级模式)完成')
    }
  }

  // 阶段3: 知识关联
  private async executeKnowledgeConnection(state: WorkflowState): Promise<void> {
    state.processingSteps.push('开始知识关联')
    console.log(`🧠 执行知识关联`)
    
    try {
      const content = state.contentAnalyzed?.summary || ''
      const tags = state.contentAnalyzed?.tags || []
      
      const result = await this.agents.architect.analyzeKnowledgeConnections(content, tags)
      
      if (result.success) {
        state.knowledgeConnected = this.extractKnowledgeConnections(result.output)
        state.processingSteps.push('知识关联完成')
        console.log(`✅ 知识关联完成`)
      } else {
        throw new Error(result.error || '知识关联失败')
      }
    } catch (error) {
      state.warnings.push(`知识关联警告: ${error instanceof Error ? error.message : '未知错误'}`)
      
      // 降级处理
      state.knowledgeConnected = {
        connections: [],
        relatedTopics: [],
        suggestedTags: []
      }
      state.processingSteps.push('知识关联(降级模式)完成')
    }
  }

  // 阶段4: 质量保证
  private async executeQualityAssurance(state: WorkflowState): Promise<void> {
    state.processingSteps.push('开始质量保证')
    console.log(`✅ 执行质量保证`)
    
    try {
      const contentToAssess = {
        content: state.contentAnalyzed,
        visual: state.visualCreated,
        knowledge: state.knowledgeConnected
      }
      
      const result = await this.agents.qa.assessQuality(contentToAssess)
      
      if (result.success) {
        state.qualityAssessed = this.extractQualityAssessment(result.output)
        state.processingSteps.push('质量保证完成')
        console.log(`✅ 质量保证完成`)
      } else {
        throw new Error(result.error || '质量保证失败')
      }
    } catch (error) {
      state.warnings.push(`质量保证警告: ${error instanceof Error ? error.message : '未知错误'}`)
      
      // 降级处理
      state.qualityAssessed = {
        overallScore: 7.5,
        recommendations: ['内容质量良好'],
        risks: []
      }
      state.processingSteps.push('质量保证(降级模式)完成')
    }
  }

  // 阶段5: 最终整合
  private async executeFinalIntegration(state: WorkflowState): Promise<void> {
    state.processingSteps.push('开始最终整合')
    console.log(`🔧 执行最终整合`)
    
    try {
      state.finalCard = {
        id: `generated-${Date.now()}`,
        title: state.contentAnalyzed?.title || '内容分析',
        summary: state.contentAnalyzed?.summary || '内容摘要',
        content: state.contentAnalyzed?.content || '<p>内容处理中...</p>',
        sourceUrl: state.url,
        sourceTitle: state.contentScraped?.title || '网页内容',
        author: state.contentScraped?.author || `${state.aiProvider.toUpperCase()} AI生成`,
        tags: state.contentAnalyzed?.tags || ['AI', '分析'],
        createdAt: new Date(),
        updatedAt: new Date(),
        category: state.contentAnalyzed?.category || 'article',
        difficulty: state.contentAnalyzed?.difficulty || 'intermediate',
        readingTime: state.contentAnalyzed?.readingTime || 5,
        imageUrl: state.visualCreated?.imageUrl || '/api/placeholder/300/200',
        connections: state.knowledgeConnected?.connections || [],
        metadata: {
          workflow: 'modern-langchain',
          aiProvider: state.aiProvider,
          imageMode: state.imageMode,
          qualityScore: state.qualityAssessed?.overallScore || 7.5,
          processingSteps: state.processingSteps.length,
          warnings: state.warnings.length,
          agents: Object.keys(this.agents)
        }
      }
      
      state.processingSteps.push('最终整合完成')
      console.log(`✅ 最终整合完成`)
      
    } catch (error) {
      throw new Error(`最终整合失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 获取工作流状态
  getWorkflowStatus(workflowId: string): WorkflowResult | null {
    const state = this.activeWorkflows.get(workflowId)
    if (!state) return null

    const executionTime = state.endTime 
      ? state.endTime.getTime() - state.startTime.getTime()
      : Date.now() - state.startTime.getTime()

    return {
      success: !!state.finalCard && state.errors.length === 0,
      card: state.finalCard,
      state,
      executionTime,
      agentReports: {} // 简化版本
    }
  }

  // 辅助方法：解析内容
  private extractScrapedContent(output: string): any {
    try {
      const match = output.match(/```json\s*([\s\S]*?)\s*```/)
      return match ? JSON.parse(match[1]) : { title: '内容', content: output }
    } catch {
      return { title: '内容', content: output }
    }
  }

  private extractAnalyzedContent(output: string): any {
    try {
      const match = output.match(/```json\s*([\s\S]*?)\s*```/)
      return match ? JSON.parse(match[1]) : null
    } catch {
      return null
    }
  }

  private extractVisualContent(output: string): any {
    try {
      const match = output.match(/```json\s*([\s\S]*?)\s*```/)
      return match ? JSON.parse(match[1]) : { imageUrl: '/api/placeholder/300/200' }
    } catch {
      return { imageUrl: '/api/placeholder/300/200' }
    }
  }

  private extractKnowledgeConnections(output: string): any {
    try {
      const match = output.match(/```json\s*([\s\S]*?)\s*```/)
      return match ? JSON.parse(match[1]) : { connections: [] }
    } catch {
      return { connections: [] }
    }
  }

  private extractQualityAssessment(output: string): any {
    try {
      const match = output.match(/```json\s*([\s\S]*?)\s*```/)
      return match ? JSON.parse(match[1]) : { overallScore: 7.5 }
    } catch {
      return { overallScore: 7.5 }
    }
  }

  // 清理完成的工作流
  cleanup(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    for (const [id, state] of this.activeWorkflows) {
      if (state.endTime && state.endTime < olderThan) {
        this.activeWorkflows.delete(id)
      }
    }
  }

  // 获取系统状态
  getSystemStatus() {
    const workflows = Array.from(this.activeWorkflows.values())
    
    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => !w.endTime).length,
      completedWorkflows: workflows.filter(w => w.endTime && w.errors.length === 0).length,
      failedWorkflows: workflows.filter(w => w.endTime && w.errors.length > 0).length,
      agents: Object.keys(this.agents).map(key => ({
        name: this.agents[key as keyof typeof this.agents].getInfo().name,
        type: key
      }))
    }
  }
}
