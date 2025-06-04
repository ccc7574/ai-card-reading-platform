// 层级Crew的辅助方法
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AI_CONFIG } from '@/lib/ai/config'
import { CrewAgent, CrewTask, CrewWorkflow } from './hierarchical-crew'
import { AgentDatabaseTools } from './database-tools'

export class HierarchicalCrewMethods {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(AI_CONFIG.gemini.apiKey || '')
  }

  // 管理者LLM决策
  async getManagerDecision(workflow: CrewWorkflow, state: any): Promise<any> {
    const manager = workflow.manager!
    
    const prompt = `
作为 ${manager.name}，你需要分析当前工作流状态并做出决策。

工作流: ${workflow.name}
目标: ${manager.goal}

当前状态:
- 轮次: ${state.iterations}/${state.maxIterations}
- 已完成任务: ${state.tasks.filter(t => t.status === 'completed').map(t => t.id).join(', ')}
- 进行中任务: ${state.tasks.filter(t => t.status === 'running').map(t => t.id).join(', ')}
- 待执行任务: ${state.tasks.filter(t => t.status === 'pending').map(t => t.id).join(', ')}

可用Agent:
${workflow.agents.map(a => `- ${a.id}: ${a.role} (${a.goal})`).join('\n')}

请分析情况并选择下一步行动:
1. execute_tasks: 执行特定任务
2. complete: 工作流已完成

请以JSON格式回复你的决策:
{
  "action": "execute_tasks|complete",
  "reasoning": "决策理由",
  "taskIds": ["task1", "task2"]
}
`

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // 尝试解析JSON响应
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // 如果解析失败，返回默认决策
      return {
        action: 'execute_tasks',
        reasoning: '默认执行待处理任务',
        taskIds: state.tasks.filter(t => t.status === 'pending').slice(0, 2).map(t => t.id)
      }

    } catch (error) {
      console.error('管理者决策失败:', error)
      // 返回安全的默认决策
      return {
        action: 'execute_tasks',
        reasoning: '管理者决策失败，执行默认策略',
        taskIds: state.tasks.filter(t => t.status === 'pending').slice(0, 1).map(t => t.id)
      }
    }
  }

  // 执行单个任务
  async executeTask(workflow: CrewWorkflow, task: CrewTask, state: any): Promise<void> {
    console.log(`🔧 执行任务: ${task.description}`)
    
    task.status = 'running'
    task.startTime = Date.now()
    task.iterations++

    try {
      const agent = workflow.agents.find(a => a.id === task.agent)
      if (!agent) {
        throw new Error(`Agent ${task.agent} not found`)
      }

      const result = await this.executeAgentTask(agent, task, state)
      
      task.status = 'completed'
      task.result = result
      task.endTime = Date.now()
      
      state.results.set(task.id, result)
      
      console.log(`✅ 任务完成: ${task.description}`)

    } catch (error) {
      task.status = 'failed'
      task.endTime = Date.now()
      console.error(`❌ 任务失败: ${task.description}`, error)
      throw error
    }
  }

  // 执行Agent任务
  async executeAgentTask(agent: CrewAgent, task: CrewTask, state: any): Promise<any> {
    try {
      // 根据任务类型获取相关数据
      const contextData = await this.getTaskContextData(task, state)

      const prompt = `
你是 ${agent.name}，角色: ${agent.role}
目标: ${agent.goal}
背景: ${agent.backstory}

当前任务: ${task.description}
期望输出: ${task.expectedOutput}

输入数据: ${JSON.stringify(state.input, null, 2)}

相关数据库数据:
${JSON.stringify(contextData, null, 2)}

依赖任务结果:
${task.dependencies?.map(dep => {
  const result = state.results.get(dep)
  return `${dep}: ${JSON.stringify(result, null, 2)}`
}).join('\n') || '无依赖'}

请根据你的角色和专业能力完成这个任务。
基于提供的数据库数据进行分析和处理。
提供详细、准确、有价值的结果。
`

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return {
        success: true,
        output: text,
        agent: agent.id,
        task: task.id,
        contextData,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error(`Agent ${agent.id} 执行失败:`, error)
      return {
        success: false,
        error: error.message,
        agent: agent.id,
        task: task.id,
        timestamp: new Date().toISOString()
      }
    }
  }

  // 根据任务获取相关的数据库数据
  private async getTaskContextData(task: CrewTask, state: any): Promise<any> {
    const contextData: any = {}

    try {
      // 根据任务ID和输入数据确定需要什么数据
      const input = state.input

      if (task.id.includes('behavior') || task.id.includes('recommendation')) {
        // 推荐相关任务需要内容和用户偏好数据
        if (input.userId) {
          contextData.userPreferences = await AgentDatabaseTools.getUserPreferences(input.userId)
          contextData.userActivities = await AgentDatabaseTools.getUserActivities(input.userId, 50)
        }
        contextData.contents = await AgentDatabaseTools.getContentsForRecommendation(input.userId, 30)
      }

      if (task.id.includes('search') || task.id.includes('query')) {
        // 搜索相关任务需要内容数据
        if (input.query) {
          contextData.searchResults = await AgentDatabaseTools.searchContents(input.query, input.filters || {})
        }
      }

      if (task.id.includes('analytics') || task.id.includes('stats')) {
        // 分析相关任务需要用户统计数据
        if (input.userId) {
          contextData.userStats = await AgentDatabaseTools.getUserStats(input.userId)
          contextData.userActivities = await AgentDatabaseTools.getUserActivities(input.userId, 100)
        }
      }

      if (task.id.includes('achievement') || task.id.includes('progress')) {
        // 成就相关任务需要成就和用户成就数据
        if (input.userId) {
          contextData.achievements = await AgentDatabaseTools.getAchievements()
          contextData.userAchievements = await AgentDatabaseTools.getUserAchievements(input.userId)
          contextData.userStats = await AgentDatabaseTools.getUserStats(input.userId)
        }
      }

      if (task.id.includes('engagement') || task.id.includes('streak')) {
        // 参与度相关任务需要用户活动和统计数据
        if (input.userId) {
          contextData.userStats = await AgentDatabaseTools.getUserStats(input.userId)
          contextData.userActivities = await AgentDatabaseTools.getUserActivities(input.userId, 30)
        }
      }

      if (task.id.includes('trend') || task.id.includes('tag')) {
        // 趋势相关任务需要标签和内容数据
        contextData.trendingTags = await AgentDatabaseTools.getTrendingTags(input.limit || 20)
        contextData.recentContents = await AgentDatabaseTools.getContentsForRecommendation(undefined, 50)
      }

      return contextData

    } catch (error) {
      console.error('获取任务上下文数据失败:', error)
      return {}
    }
  }
}
