import { nanoid } from 'nanoid'

// Agent基础接口
export interface AgentConfig {
  id: string
  name: string
  description: string
  capabilities: string[]
  priority: number
  maxRetries: number
  timeout: number
}

// Agent任务接口
export interface AgentTask {
  id: string
  type: string
  input: any
  output?: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  agentId?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  metadata?: Record<string, any>
}

// Agent执行结果
export interface AgentResult {
  success: boolean
  data?: any
  error?: string
  metadata?: Record<string, any>
  nextTasks?: Partial<AgentTask>[]
}

// Agent通信消息
export interface AgentMessage {
  id: string
  fromAgent: string
  toAgent: string
  type: 'request' | 'response' | 'notification'
  payload: any
  timestamp: Date
}

// Agent基础抽象类
export abstract class BaseAgent {
  protected config: AgentConfig
  protected isRunning: boolean = false
  protected currentTask?: AgentTask

  constructor(config: Partial<AgentConfig>) {
    this.config = {
      id: config.id || nanoid(),
      name: config.name || 'UnnamedAgent',
      description: config.description || '',
      capabilities: config.capabilities || [],
      priority: config.priority || 1,
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      ...config
    }
  }

  // 获取Agent信息
  getInfo(): AgentConfig {
    return { ...this.config }
  }

  // 检查是否可以处理任务
  canHandle(task: AgentTask): boolean {
    return this.config.capabilities.includes(task.type)
  }

  // 执行任务的主要方法
  async execute(task: AgentTask): Promise<AgentResult> {
    if (this.isRunning) {
      throw new Error(`Agent ${this.config.name} is already running`)
    }

    this.isRunning = true
    this.currentTask = task
    
    try {
      // 更新任务状态
      task.status = 'running'
      task.agentId = this.config.id
      task.startedAt = new Date()

      console.log(`🤖 Agent ${this.config.name} 开始执行任务: ${task.type}`)

      // 执行具体任务
      const result = await this.performTask(task)

      // 更新任务状态
      task.status = result.success ? 'completed' : 'failed'
      task.completedAt = new Date()
      task.output = result.data
      task.error = result.error

      console.log(`✅ Agent ${this.config.name} 完成任务: ${task.type}`)

      return result
    } catch (error) {
      task.status = 'failed'
      task.completedAt = new Date()
      task.error = error instanceof Error ? error.message : 'Unknown error'

      console.error(`❌ Agent ${this.config.name} 任务失败:`, error)

      return {
        success: false,
        error: task.error
      }
    } finally {
      this.isRunning = false
      this.currentTask = undefined
    }
  }

  // 抽象方法：具体的任务执行逻辑
  protected abstract performTask(task: AgentTask): Promise<AgentResult>

  // 获取当前状态
  getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      isRunning: this.isRunning,
      currentTask: this.currentTask?.id,
      capabilities: this.config.capabilities
    }
  }

  // 停止当前任务
  async stop(): Promise<void> {
    if (this.currentTask) {
      this.currentTask.status = 'cancelled'
      this.currentTask.completedAt = new Date()
    }
    this.isRunning = false
    this.currentTask = undefined
  }
}

// Agent工厂接口
export interface AgentFactory {
  createAgent(type: string, config?: Partial<AgentConfig>): BaseAgent
  getSupportedTypes(): string[]
}
