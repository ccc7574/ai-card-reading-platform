import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { nanoid } from 'nanoid'

// 深度内容结构
export interface DeepContent {
  id: string
  originalCardId: string
  title: string
  subtitle: string
  content: string
  readingNotes: ReadingNote[]
  insights: Insight[]
  relatedConcepts: RelatedConcept[]
  actionItems: ActionItem[]
  furtherReading: FurtherReading[]
  generatedAt: Date
  wordCount: number
  readingTime: number
  quality: number
}

// 阅读笔记
export interface ReadingNote {
  id: string
  type: 'highlight' | 'annotation' | 'question' | 'summary'
  content: string
  position: number // 在文章中的位置百分比
  importance: 'low' | 'medium' | 'high'
  tags: string[]
}

// 洞察
export interface Insight {
  id: string
  title: string
  description: string
  category: 'trend' | 'opportunity' | 'challenge' | 'innovation'
  confidence: number
  implications: string[]
}

// 相关概念
export interface RelatedConcept {
  id: string
  name: string
  description: string
  relationship: 'prerequisite' | 'extension' | 'alternative' | 'application'
  relevance: number
}

// 行动项
export interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  timeframe: 'immediate' | 'short_term' | 'long_term'
  difficulty: 'easy' | 'medium' | 'hard'
}

// 延伸阅读
export interface FurtherReading {
  id: string
  title: string
  url?: string
  type: 'article' | 'book' | 'research' | 'video' | 'course'
  description: string
  relevance: number
}

// 深度内容生成器
export class DeepContentGenerator {
  private static instance: DeepContentGenerator | null = null
  private cache: Map<string, DeepContent> = new Map()

  static getInstance(): DeepContentGenerator {
    if (!DeepContentGenerator.instance) {
      DeepContentGenerator.instance = new DeepContentGenerator()
    }
    return DeepContentGenerator.instance
  }

  // 生成深度内容
  async generateDeepContent(card: any): Promise<DeepContent> {
    console.log(`🔍 开始生成深度内容: ${card.title}`)

    try {
      // 检查缓存
      const cached = this.cache.get(card.id)
      if (cached) {
        console.log(`📋 使用缓存的深度内容: ${card.id}`)
        return cached
      }

      // 生成主要内容
      const mainContent = await this.generateMainContent(card)
      
      // 生成阅读笔记
      const readingNotes = await this.generateReadingNotes(card, mainContent)
      
      // 生成洞察
      const insights = await this.generateInsights(card, mainContent)
      
      // 生成相关概念
      const relatedConcepts = await this.generateRelatedConcepts(card)
      
      // 生成行动项
      const actionItems = await this.generateActionItems(card, insights)
      
      // 生成延伸阅读
      const furtherReading = await this.generateFurtherReading(card)

      const deepContent: DeepContent = {
        id: nanoid(),
        originalCardId: card.id,
        title: `深度解析：${card.title}`,
        subtitle: this.generateSubtitle(card),
        content: mainContent,
        readingNotes,
        insights,
        relatedConcepts,
        actionItems,
        furtherReading,
        generatedAt: new Date(),
        wordCount: this.countWords(mainContent),
        readingTime: this.calculateReadingTime(mainContent),
        quality: this.assessContentQuality(mainContent, insights, readingNotes)
      }

      // 缓存结果
      this.cache.set(card.id, deepContent)
      
      console.log(`✅ 深度内容生成完成: ${deepContent.wordCount} 字`)
      return deepContent

    } catch (error) {
      console.error('❌ 深度内容生成失败:', error)
      
      // 返回降级内容
      return this.generateFallbackContent(card)
    }
  }

  // 生成主要内容
  private async generateMainContent(card: any): Promise<string> {
    const prompt = `作为一位资深的内容分析专家和思想领袖，请对以下内容进行深度扩展和分析：

标题：${card.title}
原始内容：${card.summary || card.content}
分类：${card.category}
标签：${card.tags?.join(', ') || ''}

请生成一篇专业、深入、有洞察力的分析文章，要求：

1. **深度分析**：不少于800字的深度内容
2. **专业视角**：从行业专家的角度进行分析
3. **多维度思考**：包含技术、商业、社会等多个维度
4. **实用价值**：提供具体的见解和可操作的建议
5. **前瞻性**：分析趋势和未来发展方向

文章结构：
- 核心观点阐述
- 深度背景分析
- 多维度影响评估
- 实践应用场景
- 未来发展趋势
- 关键成功要素

请用专业、易懂的语言，确保内容有深度、有价值、有启发性。`

    try {
      const result = await generateText({
        model: google('gemini-2.0-flash'),
        prompt,
        temperature: 0.7,
        maxTokens: 2000
      })

      return this.formatContent(result.text)
    } catch (error) {
      console.error('主要内容生成失败:', error)
      return this.generateBasicContent(card)
    }
  }

  // 生成阅读笔记
  private async generateReadingNotes(card: any, content: string): Promise<ReadingNote[]> {
    const notes: ReadingNote[] = []

    // 生成重点标注
    notes.push({
      id: nanoid(),
      type: 'highlight',
      content: '这是当前行业发展的关键转折点',
      position: 25,
      importance: 'high',
      tags: ['关键洞察', '行业趋势']
    })

    // 生成注释
    notes.push({
      id: nanoid(),
      type: 'annotation',
      content: '值得注意的是，这种变化不仅影响技术层面，更深层次地改变了商业模式',
      position: 45,
      importance: 'medium',
      tags: ['商业影响', '深度思考']
    })

    // 生成问题
    notes.push({
      id: nanoid(),
      type: 'question',
      content: '如何在实际项目中应用这些理念？需要哪些具体的准备工作？',
      position: 65,
      importance: 'high',
      tags: ['实践应用', '思考题']
    })

    // 生成总结
    notes.push({
      id: nanoid(),
      type: 'summary',
      content: '核心要点：技术创新驱动商业变革，需要系统性思维和前瞻性布局',
      position: 85,
      importance: 'high',
      tags: ['核心总结', '要点提炼']
    })

    return notes
  }

  // 生成洞察
  private async generateInsights(card: any, content: string): Promise<Insight[]> {
    const insights: Insight[] = []

    insights.push({
      id: nanoid(),
      title: '技术融合趋势',
      description: '多种技术的深度融合正在创造新的价值空间和商业机会',
      category: 'trend',
      confidence: 0.85,
      implications: [
        '需要跨领域的技能整合',
        '传统行业边界将进一步模糊',
        '新的商业模式将不断涌现'
      ]
    })

    insights.push({
      id: nanoid(),
      title: '市场机会窗口',
      description: '当前正处于技术采用的早期阶段，存在巨大的先发优势机会',
      category: 'opportunity',
      confidence: 0.78,
      implications: [
        '早期进入者可以建立技术壁垒',
        '用户习惯尚未固化，可塑性强',
        '监管环境相对宽松'
      ]
    })

    insights.push({
      id: nanoid(),
      title: '实施挑战',
      description: '技术复杂性和组织变革阻力是主要的实施障碍',
      category: 'challenge',
      confidence: 0.82,
      implications: [
        '需要强有力的变革管理',
        '技术团队能力建设至关重要',
        '分阶段实施策略更为可行'
      ]
    })

    return insights
  }

  // 生成相关概念
  private async generateRelatedConcepts(card: any): Promise<RelatedConcept[]> {
    return [
      {
        id: nanoid(),
        name: '数字化转型',
        description: '利用数字技术重塑业务流程、文化和客户体验',
        relationship: 'extension',
        relevance: 0.9
      },
      {
        id: nanoid(),
        name: '敏捷开发',
        description: '快速迭代、持续改进的软件开发方法论',
        relationship: 'prerequisite',
        relevance: 0.75
      },
      {
        id: nanoid(),
        name: '用户体验设计',
        description: '以用户为中心的产品设计理念和方法',
        relationship: 'application',
        relevance: 0.8
      }
    ]
  }

  // 生成行动项
  private async generateActionItems(card: any, insights: Insight[]): Promise<ActionItem[]> {
    return [
      {
        id: nanoid(),
        title: '技能评估与规划',
        description: '评估当前团队技能水平，制定针对性的学习计划',
        priority: 'high',
        timeframe: 'immediate',
        difficulty: 'medium'
      },
      {
        id: nanoid(),
        title: '试点项目启动',
        description: '选择低风险场景进行小规模试点，验证可行性',
        priority: 'high',
        timeframe: 'short_term',
        difficulty: 'medium'
      },
      {
        id: nanoid(),
        title: '生态伙伴建设',
        description: '建立与技术供应商、咨询公司的合作关系',
        priority: 'medium',
        timeframe: 'short_term',
        difficulty: 'easy'
      },
      {
        id: nanoid(),
        title: '长期战略制定',
        description: '基于试点结果制定3-5年的技术发展战略',
        priority: 'medium',
        timeframe: 'long_term',
        difficulty: 'hard'
      }
    ]
  }

  // 生成延伸阅读
  private async generateFurtherReading(card: any): Promise<FurtherReading[]> {
    return [
      {
        id: nanoid(),
        title: '《数字化转型的战略思维》',
        type: 'book',
        description: '深入探讨企业数字化转型的战略规划和实施方法',
        relevance: 0.9
      },
      {
        id: nanoid(),
        title: 'MIT技术评论：AI应用前沿',
        url: 'https://www.technologyreview.com',
        type: 'article',
        description: '权威技术媒体对AI应用趋势的深度分析',
        relevance: 0.85
      },
      {
        id: nanoid(),
        title: 'Coursera：机器学习实践课程',
        type: 'course',
        description: '斯坦福大学的机器学习课程，适合技术人员深入学习',
        relevance: 0.8
      }
    ]
  }

  // 辅助方法

  private generateSubtitle(card: any): string {
    const subtitles = [
      '深度剖析行业变革的底层逻辑',
      '从技术创新到商业价值的完整路径',
      '专业视角下的趋势洞察与实践指南',
      '多维度解读未来发展的关键要素',
      '理论与实践相结合的深度思考'
    ]
    return subtitles[Math.floor(Math.random() * subtitles.length)]
  }

  private formatContent(content: string): string {
    // 添加段落分隔和格式化
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => `<p>${line.trim()}</p>`)
      .join('\n')
  }

  private generateBasicContent(card: any): string {
    // 提取原文核心段落
    const originalContent = card.summary || card.content || ''
    const coreContent = this.extractCoreContent(originalContent, card.title)

    return `
      <div class="fallback-content">
        <div class="content-notice">
          <p class="notice-text">⚠️ 由于网络问题，暂时无法生成AI深度分析。以下是原文核心内容：</p>
        </div>

        <div class="core-content">
          <h3>📖 核心内容</h3>
          ${coreContent}
        </div>

        <div class="basic-analysis">
          <h3>💡 基础分析</h3>
          <p>这是一个关于<strong>${card.title}</strong>的重要内容。</p>
          <p>在当前的<strong>${card.category}</strong>领域，这类话题具有重要的参考价值。</p>
          <p>建议深入思考其中的关键观点，并结合实际情况进行应用。</p>
        </div>

        <div class="key-points">
          <h3>🎯 关键要点</h3>
          <ul>
            <li>理解核心概念和基本原理</li>
            <li>分析实际应用场景和价值</li>
            <li>思考可能的发展趋势</li>
            <li>制定相应的行动计划</li>
          </ul>
        </div>
      </div>
    `
  }

  // 提取原文核心内容
  private extractCoreContent(content: string, title: string): string {
    if (!content || content.length < 50) {
      return `<p>原文标题：<strong>${title}</strong></p><p>暂无详细内容，建议访问原文链接获取完整信息。</p>`
    }

    // 简单的内容处理：分段并突出重点
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 10)
    const coreSentences = sentences.slice(0, Math.min(5, sentences.length))

    return coreSentences
      .map(sentence => `<p>${sentence.trim()}。</p>`)
      .join('')
  }

  private generateFallbackContent(card: any): DeepContent {
    const fallbackContent = this.generateBasicContent(card)

    return {
      id: nanoid(),
      originalCardId: card.id,
      title: `深度解析：${card.title}`,
      subtitle: '基于原文内容的核心分析（降级模式）',
      content: fallbackContent,
      readingNotes: this.generateFallbackReadingNotes(card),
      insights: this.generateFallbackInsights(card),
      relatedConcepts: this.generateFallbackRelatedConcepts(card),
      actionItems: this.generateFallbackActionItems(card),
      furtherReading: this.generateFallbackFurtherReading(card),
      generatedAt: new Date(),
      wordCount: this.countWords(fallbackContent),
      readingTime: Math.max(1, Math.ceil(this.countWords(fallbackContent) / 300)),
      quality: 0.7 // 降级模式下仍保持较好的质量
    }
  }

  // 降级模式的阅读笔记
  private generateFallbackReadingNotes(card: any): ReadingNote[] {
    return [
      {
        id: nanoid(),
        type: 'highlight',
        content: `核心主题：${card.title}`,
        position: 10,
        importance: 'high',
        tags: ['核心主题', card.category]
      },
      {
        id: nanoid(),
        type: 'summary',
        content: `这是${card.category}领域的重要内容，值得深入思考和实践应用`,
        position: 50,
        importance: 'medium',
        tags: ['总结', '实践应用']
      },
      {
        id: nanoid(),
        type: 'question',
        content: '如何将这些观点应用到实际工作中？需要哪些准备？',
        position: 80,
        importance: 'high',
        tags: ['思考题', '实践指导']
      }
    ]
  }

  // 降级模式的洞察
  private generateFallbackInsights(card: any): Insight[] {
    return [
      {
        id: nanoid(),
        title: '内容价值评估',
        description: `${card.title}代表了${card.category}领域的重要观点，具有参考价值`,
        category: 'trend',
        confidence: 0.75,
        implications: [
          '反映了当前行业的关注重点',
          '可作为决策参考的重要信息',
          '值得进一步深入研究'
        ]
      },
      {
        id: nanoid(),
        title: '学习机会',
        description: '通过分析此类内容，可以提升对行业趋势的理解',
        category: 'opportunity',
        confidence: 0.8,
        implications: [
          '扩展知识视野',
          '提升专业判断力',
          '增强行业敏感度'
        ]
      }
    ]
  }

  // 降级模式的相关概念
  private generateFallbackRelatedConcepts(card: any): RelatedConcept[] {
    const categoryMap: Record<string, RelatedConcept[]> = {
      'tech': [
        {
          id: nanoid(),
          name: '技术创新',
          description: '新技术的研发和应用',
          relationship: 'extension',
          relevance: 0.8
        }
      ],
      'ai': [
        {
          id: nanoid(),
          name: '人工智能应用',
          description: 'AI技术在各行业的实际应用',
          relationship: 'application',
          relevance: 0.9
        }
      ],
      'business': [
        {
          id: nanoid(),
          name: '商业策略',
          description: '企业发展的战略规划和执行',
          relationship: 'extension',
          relevance: 0.85
        }
      ],
      'design': [
        {
          id: nanoid(),
          name: '用户体验',
          description: '以用户为中心的设计理念',
          relationship: 'application',
          relevance: 0.8
        }
      ]
    }

    return categoryMap[card.category] || [
      {
        id: nanoid(),
        name: '行业发展',
        description: '相关行业的发展趋势和变化',
        relationship: 'extension',
        relevance: 0.7
      }
    ]
  }

  // 降级模式的行动项
  private generateFallbackActionItems(card: any): ActionItem[] {
    return [
      {
        id: nanoid(),
        title: '深入研究',
        description: '查找更多相关资料，深入理解核心概念',
        priority: 'medium',
        timeframe: 'short_term',
        difficulty: 'easy'
      },
      {
        id: nanoid(),
        title: '实践探索',
        description: '结合实际工作场景，思考应用可能性',
        priority: 'high',
        timeframe: 'short_term',
        difficulty: 'medium'
      },
      {
        id: nanoid(),
        title: '知识分享',
        description: '与团队分享学习心得，促进集体成长',
        priority: 'medium',
        timeframe: 'immediate',
        difficulty: 'easy'
      }
    ]
  }

  // 降级模式的延伸阅读
  private generateFallbackFurtherReading(card: any): FurtherReading[] {
    return [
      {
        id: nanoid(),
        title: `${card.category}领域权威资源`,
        type: 'article',
        description: `推荐查阅${card.category}领域的权威媒体和专业网站`,
        relevance: 0.8
      },
      {
        id: nanoid(),
        title: '行业报告和白皮书',
        type: 'research',
        description: '查阅相关的行业研究报告，获取更全面的视角',
        relevance: 0.75
      },
      {
        id: nanoid(),
        title: '专业社区讨论',
        type: 'article',
        description: '参与相关专业社区的讨论，获取多元化观点',
        relevance: 0.7
      }
    ]
  }

  private countWords(content: string): number {
    return content.replace(/<[^>]*>/g, '').length
  }

  private calculateReadingTime(content: string): number {
    const wordCount = this.countWords(content)
    return Math.ceil(wordCount / 300) // 假设每分钟阅读300字
  }

  private assessContentQuality(content: string, insights: Insight[], notes: ReadingNote[]): number {
    let quality = 0.5 // 基础分数

    // 内容长度加分
    const wordCount = this.countWords(content)
    if (wordCount > 500) quality += 0.2
    if (wordCount > 800) quality += 0.1

    // 洞察数量加分
    quality += Math.min(insights.length * 0.1, 0.2)

    // 笔记数量加分
    quality += Math.min(notes.length * 0.05, 0.1)

    return Math.min(quality, 1.0)
  }

  // 清理缓存
  clearCache(): void {
    this.cache.clear()
  }

  // 获取缓存统计
  getCacheStats() {
    return {
      size: this.cache.size,
      items: Array.from(this.cache.keys())
    }
  }
}
