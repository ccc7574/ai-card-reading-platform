import { BaseAgent, AgentTask, AgentResult } from './base-agent'
import { AIServiceFactory, AIProvider } from '../ai-services'

// 内容分析Agent
export class ContentAnalyzerAgent extends BaseAgent {
  private aiProvider: AIProvider

  constructor(aiProvider: AIProvider = AIProvider.OPENAI) {
    super({
      name: 'ContentAnalyzerAgent',
      description: '使用AI进行深度内容分析和理解',
      capabilities: ['analyze-content', 'extract-keywords', 'categorize-content', 'assess-difficulty'],
      priority: 2,
      timeout: 45000
    })
    this.aiProvider = aiProvider
  }

  protected async performTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'analyze-content':
        return await this.analyzeContent(task.input.content, task.input.url)
      
      case 'extract-keywords':
        return await this.extractKeywords(task.input.content)
      
      case 'categorize-content':
        return await this.categorizeContent(task.input.content)
      
      case 'assess-difficulty':
        return await this.assessDifficulty(task.input.content)
      
      default:
        throw new Error(`Unsupported task type: ${task.type}`)
    }
  }

  private async analyzeContent(content: string, url: string): Promise<AgentResult> {
    try {
      const analysisResult = await AIServiceFactory.analyzeContent(
        this.aiProvider,
        url,
        content
      )
      
      return {
        success: true,
        data: analysisResult,
        metadata: {
          aiProvider: this.aiProvider,
          analysisTimestamp: new Date(),
          contentLength: content.length
        },
        nextTasks: [
          {
            type: 'generate-sketch',
            input: { 
              prompt: `${analysisResult.title} - ${analysisResult.keyPoints.join(', ')}`,
              style: 'minimalist-sketch'
            }
          },
          {
            type: 'find-connections',
            input: { 
              content: analysisResult,
              tags: analysisResult.tags
            }
          }
        ]
      }
    } catch (error) {
      // 降级处理：使用基础分析
      return await this.basicAnalysis(content, url)
    }
  }

  private async basicAnalysis(content: string, url: string): Promise<AgentResult> {
    // 基础分析逻辑（不依赖AI）
    const words = content.split(/\s+/).length
    const readingTime = Math.ceil(words / 200) // 假设每分钟200字
    
    // 简单的关键词提取
    const keywords = this.extractBasicKeywords(content)
    
    // 基础分类
    const category = this.basicCategorization(content)
    
    return {
      success: true,
      data: {
        title: '内容分析',
        summary: `📄 ${content.slice(0, 100)}...`,
        content: `<p>${content.slice(0, 500)}...</p>`,
        tags: keywords.slice(0, 5),
        category,
        difficulty: 'intermediate',
        readingTime,
        keyPoints: ['内容分析', '基础处理', '自动生成']
      },
      metadata: {
        analysisType: 'basic',
        fallback: true
      }
    }
  }

  private extractBasicKeywords(content: string): string[] {
    // 简单的关键词提取逻辑
    const commonWords = new Set(['的', '是', '在', '有', '和', '与', '或', '但', '而', '了', '着', '过'])
    const words = content.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !commonWords.has(word))
    
    // 统计词频
    const wordCount = new Map<string, number>()
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })
    
    // 返回频率最高的词
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  private basicCategorization(content: string): 'article' | 'kol-opinion' | 'insight' {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('观点') || lowerContent.includes('认为') || lowerContent.includes('看法')) {
      return 'kol-opinion'
    }
    
    if (lowerContent.includes('洞察') || lowerContent.includes('分析') || lowerContent.includes('趋势')) {
      return 'insight'
    }
    
    return 'article'
  }

  private async extractKeywords(content: string): Promise<AgentResult> {
    try {
      // 使用AI提取关键词
      const keywords = await this.aiExtractKeywords(content)
      
      return {
        success: true,
        data: { keywords },
        metadata: {
          extractionMethod: 'ai',
          aiProvider: this.aiProvider
        }
      }
    } catch (error) {
      // 降级到基础提取
      const keywords = this.extractBasicKeywords(content)
      
      return {
        success: true,
        data: { keywords },
        metadata: {
          extractionMethod: 'basic',
          fallback: true
        }
      }
    }
  }

  private async aiExtractKeywords(content: string): Promise<string[]> {
    // 这里可以调用AI服务进行关键词提取
    // 暂时使用基础方法
    return this.extractBasicKeywords(content)
  }

  private async categorizeContent(content: string): Promise<AgentResult> {
    const category = this.basicCategorization(content)
    
    return {
      success: true,
      data: { category },
      metadata: {
        confidence: 0.8,
        method: 'rule-based'
      }
    }
  }

  private async assessDifficulty(content: string): Promise<AgentResult> {
    // 基于内容长度和复杂度评估难度
    const words = content.split(/\s+/).length
    const sentences = content.split(/[.!?。！？]/).length
    const avgWordsPerSentence = words / sentences
    
    let difficulty: 'beginner' | 'intermediate' | 'advanced'
    
    if (words < 500 && avgWordsPerSentence < 15) {
      difficulty = 'beginner'
    } else if (words > 1500 || avgWordsPerSentence > 25) {
      difficulty = 'advanced'
    } else {
      difficulty = 'intermediate'
    }
    
    return {
      success: true,
      data: { difficulty },
      metadata: {
        wordCount: words,
        sentenceCount: sentences,
        avgWordsPerSentence
      }
    }
  }
}
