import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { StructuredTool } from '@langchain/core/tools'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { nanoid } from 'nanoid'

// Agent配置接口
export interface LangChainAgentConfig {
  id?: string
  name: string
  description: string
  systemPrompt: string
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro'
  temperature?: number
  maxTokens?: number
  tools?: StructuredTool[]
  memory?: boolean
}

// Agent执行结果
export interface AgentExecutionResult {
  success: boolean
  output: string
  intermediateSteps?: any[]
  error?: string
  metadata?: {
    tokensUsed?: number
    executionTime?: number
    toolCalls?: string[]
  }
}

// 基于LangChain的现代Agent基类
export class LangChainAgent {
  private config: LangChainAgentConfig
  private llm: BaseChatModel
  private executor: AgentExecutor | null = null
  private conversationHistory: BaseMessage[] = []

  constructor(config: LangChainAgentConfig) {
    this.config = {
      id: config.id || nanoid(),
      temperature: 0.7,
      maxTokens: 2048,
      memory: true,
      ...config
    }

    // 初始化语言模型
    this.llm = this.initializeLLM()
    
    // 初始化Agent执行器
    this.initializeAgent()
  }

  private initializeLLM(): BaseChatModel {
    switch (this.config.model) {
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is required for OpenAI models')
        }
        return new ChatOpenAI({
          modelName: this.config.model,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
          openAIApiKey: process.env.OPENAI_API_KEY,
        })

      case 'gemini-pro':
        if (!process.env.GOOGLE_API_KEY) {
          throw new Error('GOOGLE_API_KEY is required for Gemini models')
        }
        return new ChatGoogleGenerativeAI({
          modelName: 'gemini-pro',
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
          apiKey: process.env.GOOGLE_API_KEY,
        })

      default:
        throw new Error(`Unsupported model: ${this.config.model}`)
    }
  }

  private async initializeAgent() {
    try {
      // 创建提示模板
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', this.config.systemPrompt],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad'),
      ])

      // 创建Agent
      const agent = await createOpenAIFunctionsAgent({
        llm: this.llm,
        tools: this.config.tools || [],
        prompt,
      })

      // 创建执行器
      this.executor = new AgentExecutor({
        agent,
        tools: this.config.tools || [],
        verbose: process.env.NODE_ENV === 'development',
        maxIterations: 5,
        returnIntermediateSteps: true,
      })

      console.log(`🤖 LangChain Agent "${this.config.name}" 初始化完成`)
    } catch (error) {
      console.error(`❌ Agent初始化失败:`, error)
      throw error
    }
  }

  // 执行Agent任务
  async execute(input: string, context?: Record<string, any>): Promise<AgentExecutionResult> {
    if (!this.executor) {
      throw new Error('Agent executor not initialized')
    }

    const startTime = Date.now()

    try {
      console.log(`🚀 Agent "${this.config.name}" 开始执行: ${input.slice(0, 100)}...`)

      // 准备输入
      const agentInput = {
        input,
        chat_history: this.config.memory ? this.conversationHistory : [],
        ...context
      }

      // 执行Agent
      const result = await this.executor.invoke(agentInput)

      // 更新对话历史
      if (this.config.memory) {
        this.conversationHistory.push(new HumanMessage(input))
        this.conversationHistory.push(new AIMessage(result.output))
        
        // 限制历史长度
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20)
        }
      }

      const executionTime = Date.now() - startTime
      console.log(`✅ Agent "${this.config.name}" 执行完成 (${executionTime}ms)`)

      return {
        success: true,
        output: result.output,
        intermediateSteps: result.intermediateSteps,
        metadata: {
          executionTime,
          toolCalls: result.intermediateSteps?.map((step: any) => step.action?.tool) || []
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`❌ Agent "${this.config.name}" 执行失败:`, error)

      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          executionTime
        }
      }
    }
  }

  // 流式执行（实时响应）
  async *executeStream(input: string, context?: Record<string, any>): AsyncGenerator<string, void, unknown> {
    if (!this.executor) {
      throw new Error('Agent executor not initialized')
    }

    try {
      const agentInput = {
        input,
        chat_history: this.config.memory ? this.conversationHistory : [],
        ...context
      }

      // 使用流式执行
      const stream = await this.executor.stream(agentInput)
      
      for await (const chunk of stream) {
        if (chunk.agent?.messages) {
          for (const message of chunk.agent.messages) {
            if (message.content) {
              yield message.content
            }
          }
        }
        
        if (chunk.tools?.messages) {
          for (const message of chunk.tools.messages) {
            yield `🔧 Tool: ${message.content}\n`
          }
        }
      }

    } catch (error) {
      yield `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  // 添加工具
  addTool(tool: StructuredTool) {
    if (!this.config.tools) {
      this.config.tools = []
    }
    this.config.tools.push(tool)
    
    // 重新初始化Agent以包含新工具
    this.initializeAgent()
  }

  // 获取Agent信息
  getInfo() {
    return {
      id: this.config.id,
      name: this.config.name,
      description: this.config.description,
      model: this.config.model,
      toolCount: this.config.tools?.length || 0,
      hasMemory: this.config.memory,
      conversationLength: this.conversationHistory.length
    }
  }

  // 清除对话历史
  clearHistory() {
    this.conversationHistory = []
  }

  // 获取对话历史
  getHistory(): BaseMessage[] {
    return [...this.conversationHistory]
  }

  // 更新系统提示
  updateSystemPrompt(newPrompt: string) {
    this.config.systemPrompt = newPrompt
    this.initializeAgent()
  }

  // 切换模型
  async switchModel(newModel: LangChainAgentConfig['model']) {
    this.config.model = newModel
    this.llm = this.initializeLLM()
    await this.initializeAgent()
  }
}
