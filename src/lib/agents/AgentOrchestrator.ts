import { openai } from 'ai'
import { generateText } from 'ai'

// Agent角色定义
export interface Agent {
  id: string
  name: string
  role: string
  systemPrompt: string
  capabilities: string[]
}

// 任务定义
export interface Task {
  id: string
  description: string
  assignedAgent: string
  input: any
  output?: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  dependencies?: string[]
}

// 工作流定义
export interface Workflow {
  id: string
  name: string
  description: string
  agents: Agent[]
  tasks: Task[]
}

export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map()
  private workflows: Map<string, Workflow> = new Map()

  constructor() {
    this.initializeAgents()
    this.initializeWorkflows()
  }

  // 初始化预定义的Agent
  private initializeAgents() {
    const agents: Agent[] = [
      {
        id: 'content-analyzer',
        name: '内容分析师',
        role: 'Content Analyst',
        systemPrompt: `你是一个专业的内容分析师。你的任务是：
1. 分析文章内容的主题、关键词和核心观点
2. 评估内容的质量、深度和价值
3. 提取关键信息和金句
4. 分类内容的难度等级和适合的读者群体
5. 生成准确的摘要和标签

请始终保持客观、专业的分析态度，提供有价值的洞察。`,
        capabilities: ['content_analysis', 'keyword_extraction', 'quality_assessment', 'categorization']
      },
      {
        id: 'image-generator',
        name: '图像生成师',
        role: 'Image Generator',
        systemPrompt: `你是一个创意图像生成师。你的任务是：
1. 根据文章内容生成合适的视觉描述
2. 创建简洁、有吸引力的简笔画风格图像提示词
3. 确保图像与内容主题高度相关
4. 考虑视觉美学和用户体验
5. 生成多种风格选项供选择

请创造性地思考，生成既美观又有意义的视觉内容。`,
        capabilities: ['image_generation', 'visual_design', 'creative_thinking', 'style_adaptation']
      },
      {
        id: 'content-enhancer',
        name: '内容增强师',
        role: 'Content Enhancer',
        systemPrompt: `你是一个内容增强专家。你的任务是：
1. 优化文章标题，使其更吸引人
2. 改进摘要，突出核心价值
3. 添加相关的背景信息和上下文
4. 生成有价值的阅读建议和思考问题
5. 创建相关的学习路径和延伸阅读

请专注于提升内容的可读性和教育价值。`,
        capabilities: ['content_optimization', 'title_generation', 'summary_enhancement', 'educational_design']
      },
      {
        id: 'trend-analyst',
        name: '趋势分析师',
        role: 'Trend Analyst',
        systemPrompt: `你是一个技术和商业趋势分析师。你的任务是：
1. 识别内容中的趋势信号和未来方向
2. 分析技术发展的影响和机会
3. 评估商业模式和市场变化
4. 预测相关领域的发展趋势
5. 提供战略性的洞察和建议

请保持前瞻性思维，提供有价值的趋势分析。`,
        capabilities: ['trend_analysis', 'market_research', 'strategic_thinking', 'future_prediction']
      },
      {
        id: 'quality-controller',
        name: '质量控制师',
        role: 'Quality Controller',
        systemPrompt: `你是一个严格的质量控制专家。你的任务是：
1. 检查内容的准确性和可信度
2. 验证信息来源和引用
3. 评估内容的完整性和逻辑性
4. 确保符合平台的质量标准
5. 提供改进建议和质量评分

请保持严格的质量标准，确保输出的内容具有高质量。`,
        capabilities: ['quality_control', 'fact_checking', 'accuracy_verification', 'standard_compliance']
      }
    ]

    agents.forEach(agent => {
      this.agents.set(agent.id, agent)
    })
  }

  // 初始化预定义的工作流
  private initializeWorkflows() {
    const workflows: Workflow[] = [
      {
        id: 'card-generation',
        name: '智能卡片生成',
        description: '从URL生成高质量的AI卡片',
        agents: [
          this.agents.get('content-analyzer')!,
          this.agents.get('image-generator')!,
          this.agents.get('content-enhancer')!,
          this.agents.get('quality-controller')!
        ],
        tasks: [
          {
            id: 'analyze-content',
            description: '分析原始内容',
            assignedAgent: 'content-analyzer',
            input: null,
            status: 'pending'
          },
          {
            id: 'generate-image',
            description: '生成配图',
            assignedAgent: 'image-generator',
            input: null,
            status: 'pending',
            dependencies: ['analyze-content']
          },
          {
            id: 'enhance-content',
            description: '增强内容',
            assignedAgent: 'content-enhancer',
            input: null,
            status: 'pending',
            dependencies: ['analyze-content']
          },
          {
            id: 'quality-check',
            description: '质量检查',
            assignedAgent: 'quality-controller',
            input: null,
            status: 'pending',
            dependencies: ['generate-image', 'enhance-content']
          }
        ]
      },
      {
        id: 'trend-analysis',
        name: '趋势分析',
        description: '分析内容中的趋势和未来方向',
        agents: [
          this.agents.get('content-analyzer')!,
          this.agents.get('trend-analyst')!,
          this.agents.get('quality-controller')!
        ],
        tasks: [
          {
            id: 'extract-signals',
            description: '提取趋势信号',
            assignedAgent: 'content-analyzer',
            input: null,
            status: 'pending'
          },
          {
            id: 'analyze-trends',
            description: '分析趋势',
            assignedAgent: 'trend-analyst',
            input: null,
            status: 'pending',
            dependencies: ['extract-signals']
          },
          {
            id: 'validate-analysis',
            description: '验证分析结果',
            assignedAgent: 'quality-controller',
            input: null,
            status: 'pending',
            dependencies: ['analyze-trends']
          }
        ]
      }
    ]

    workflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow)
    })
  }

  // 执行Agent任务
  private async executeAgentTask(agent: Agent, task: Task): Promise<any> {
    try {
      const { text } = await generateText({
        model: openai('gpt-4'),
        system: agent.systemPrompt,
        prompt: `任务：${task.description}\n\n输入数据：${JSON.stringify(task.input, null, 2)}\n\n请根据你的角色和能力完成这个任务。`,
        temperature: 0.7,
        maxTokens: 2000
      })

      return {
        success: true,
        result: text,
        agent: agent.id,
        task: task.id
      }
    } catch (error) {
      console.error(`Agent ${agent.id} task ${task.id} failed:`, error)
      return {
        success: false,
        error: error.message,
        agent: agent.id,
        task: task.id
      }
    }
  }

  // 执行工作流
  async executeWorkflow(workflowId: string, initialInput: any): Promise<any> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    console.log(`🚀 开始执行工作流: ${workflow.name}`)

    // 复制任务以避免修改原始定义
    const tasks = workflow.tasks.map(task => ({ ...task, input: task.id === workflow.tasks[0].id ? initialInput : null }))
    const results: Map<string, any> = new Map()

    // 执行任务
    while (tasks.some(task => task.status === 'pending' || task.status === 'running')) {
      // 找到可以执行的任务（没有依赖或依赖已完成）
      const readyTasks = tasks.filter(task => 
        task.status === 'pending' && 
        (!task.dependencies || task.dependencies.every(dep => results.has(dep)))
      )

      if (readyTasks.length === 0) {
        console.error('工作流死锁：没有可执行的任务')
        break
      }

      // 并行执行准备好的任务
      const taskPromises = readyTasks.map(async (task) => {
        task.status = 'running'
        console.log(`🔄 执行任务: ${task.description} (Agent: ${task.assignedAgent})`)

        const agent = this.agents.get(task.assignedAgent)!
        
        // 准备任务输入（包含依赖任务的输出）
        let taskInput = task.input
        if (task.dependencies) {
          const dependencyResults = {}
          task.dependencies.forEach(dep => {
            dependencyResults[dep] = results.get(dep)
          })
          taskInput = { ...taskInput, dependencies: dependencyResults }
        }

        const result = await this.executeAgentTask(agent, { ...task, input: taskInput })
        
        if (result.success) {
          task.status = 'completed'
          task.output = result.result
          results.set(task.id, result.result)
          console.log(`✅ 任务完成: ${task.description}`)
        } else {
          task.status = 'failed'
          console.error(`❌ 任务失败: ${task.description}`, result.error)
        }

        return { task, result }
      })

      await Promise.all(taskPromises)
    }

    console.log(`🎉 工作流完成: ${workflow.name}`)

    return {
      workflowId,
      status: tasks.every(task => task.status === 'completed') ? 'completed' : 'failed',
      tasks: tasks,
      results: Object.fromEntries(results)
    }
  }

  // 获取可用的工作流
  getAvailableWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  // 获取可用的Agent
  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  // 添加自定义Agent
  addAgent(agent: Agent) {
    this.agents.set(agent.id, agent)
  }

  // 添加自定义工作流
  addWorkflow(workflow: Workflow) {
    this.workflows.set(workflow.id, workflow)
  }
}
