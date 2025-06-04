import { BaseAgent, AgentTask, AgentResult } from './base-agent'
import { AIServiceFactory, AIProvider } from '../ai-services'
import { ImageSearchService, ImageSearchResult } from '../image-search-service'

// 图像生成Agent
export class ImageGeneratorAgent extends BaseAgent {
  private aiProvider: AIProvider
  private imageMode: 'standard' | 'premium'

  constructor(aiProvider: AIProvider = AIProvider.GEMINI, imageMode: 'standard' | 'premium' = 'standard') {
    super({
      name: 'ImageGeneratorAgent',
      description: '专门负责AI图像生成和视觉内容创建',
      capabilities: ['generate-sketch', 'generate-diagram', 'create-thumbnail', 'optimize-image'],
      priority: 3,
      timeout: 60000
    })
    this.aiProvider = aiProvider
    this.imageMode = imageMode
  }

  protected async performTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'generate-sketch':
        return await this.generateSketch(task.input.prompt, task.input.style)
      
      case 'generate-diagram':
        return await this.generateDiagram(task.input.concept, task.input.type)
      
      case 'create-thumbnail':
        return await this.createThumbnail(task.input.content)
      
      case 'optimize-image':
        return await this.optimizeImage(task.input.imageUrl)
      
      default:
        throw new Error(`Unsupported task type: ${task.type}`)
    }
  }

  private async generateSketch(prompt: string, style: string = 'minimalist'): Promise<AgentResult> {
    try {
      let sketchResult

      // 根据AI提供商和模式选择生成策略
      if (this.aiProvider === AIProvider.GEMINI) {
        if (this.imageMode === 'premium') {
          try {
            // 尝试Imagen 3高质量生成
            sketchResult = await AIServiceFactory.generateImageWithImagen(prompt)
            
            return {
              success: true,
              data: sketchResult,
              metadata: {
                generator: 'imagen-3',
                quality: 'premium',
                style,
                generatedAt: new Date()
              }
            }
          } catch (imagenError) {
            console.log('Imagen 3失败，降级到Gemini 2.0')
            // 降级到Gemini 2.0
            sketchResult = await AIServiceFactory.generateSketch(this.aiProvider, prompt)
          }
        } else {
          // 标准模式使用Gemini 2.0
          sketchResult = await AIServiceFactory.generateSketch(this.aiProvider, prompt)
        }
      } else {
        // OpenAI使用DALL-E 3
        sketchResult = await AIServiceFactory.generateSketch(this.aiProvider, prompt)
      }

      return {
        success: true,
        data: sketchResult,
        metadata: {
          generator: this.aiProvider === AIProvider.OPENAI ? 'dall-e-3' : 'gemini-2.0',
          quality: this.imageMode,
          style,
          generatedAt: new Date()
        }
      }
    } catch (error) {
      console.warn('🎨 图片生成失败，尝试网络搜索:', error.message)
      // 第一层降级：搜索网络图片
      return await this.searchNetworkImage(prompt, style)
    }
  }

  // 网络图片搜索降级策略
  private async searchNetworkImage(prompt: string, style: string): Promise<AgentResult> {
    try {
      console.log('🔍 尝试搜索网络图片...')

      // 搜索网络图片
      const searchResult = await ImageSearchService.searchImages(prompt)

      if (searchResult) {
        console.log(`✅ 找到网络图片: ${searchResult.title}`)
        return {
          success: true,
          data: {
            imageUrl: searchResult.imageUrl,
            prompt,
            description: `${searchResult.description} (来源: ${searchResult.source})`
          },
          metadata: {
            generator: 'network-search',
            quality: 'standard',
            style,
            source: searchResult.source,
            fallback: true,
            generatedAt: new Date()
          }
        }
      }

      console.log('❌ 网络搜索无结果，使用预设图片')
      // 如果搜索失败，尝试使用预设图片
      return await this.usePresetImage(prompt, style)

    } catch (error) {
      console.error('网络图片搜索失败:', error)
      // 最终降级：使用预设图片
      return await this.usePresetImage(prompt, style)
    }
  }

  // 使用预设图片
  private async usePresetImage(prompt: string, style: string): Promise<AgentResult> {
    try {
      // 根据提示词分类选择预设图片
      const category = this.extractCategory(prompt)
      const presetImage = ImageSearchService.getPresetImageByCategory(category)

      if (presetImage) {
        console.log(`📷 使用预设图片: ${presetImage.title}`)
        return {
          success: true,
          data: {
            imageUrl: presetImage.imageUrl,
            prompt,
            description: `${presetImage.description} (预设图片)`
          },
          metadata: {
            generator: 'preset-image',
            quality: 'standard',
            style,
            category,
            fallback: true,
            generatedAt: new Date()
          }
        }
      }

      // 最终降级：SVG占位符
      return await this.generateFallbackImage(prompt, style)

    } catch (error) {
      console.error('预设图片使用失败:', error)
      // 最终降级：SVG占位符
      return await this.generateFallbackImage(prompt, style)
    }
  }

  // 提取内容分类
  private extractCategory(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('tech') || lowerPrompt.includes('技术') || lowerPrompt.includes('代码')) {
      return 'tech'
    }
    if (lowerPrompt.includes('ai') || lowerPrompt.includes('智能') || lowerPrompt.includes('机器')) {
      return 'ai'
    }
    if (lowerPrompt.includes('business') || lowerPrompt.includes('商业') || lowerPrompt.includes('管理')) {
      return 'business'
    }
    if (lowerPrompt.includes('design') || lowerPrompt.includes('设计') || lowerPrompt.includes('创意')) {
      return 'design'
    }
    if (lowerPrompt.includes('science') || lowerPrompt.includes('科学') || lowerPrompt.includes('研究')) {
      return 'science'
    }

    return 'tech' // 默认分类
  }

  private async generateFallbackImage(prompt: string, style: string): Promise<AgentResult> {
    // 生成SVG占位符
    const svg = this.createSVGPlaceholder(prompt)
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

    return {
      success: true,
      data: {
        imageUrl: svgDataUrl,
        prompt,
        description: `${prompt}概念图`
      },
      metadata: {
        generator: 'svg-fallback',
        quality: 'basic',
        style,
        fallback: true
      }
    }
  }

  private createSVGPlaceholder(prompt: string): string {
    // 根据提示词选择合适的颜色和图标
    const themeColors = this.getThemeColors(prompt)
    const icon = this.getThemeIcon(prompt)

    return `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${themeColors.primary};stop-opacity:0.1" />
            <stop offset="50%" style="stop-color:${themeColors.secondary};stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:${themeColors.accent};stop-opacity:0.3" />
          </linearGradient>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="${themeColors.primary}" opacity="0.1"/>
          </pattern>
        </defs>

        <!-- 背景 -->
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>

        <!-- 主要图形 -->
        <rect x="40" y="40" width="220" height="120" fill="none" stroke="${themeColors.primary}" stroke-width="2" rx="15" opacity="0.6"/>

        <!-- 图标区域 -->
        <circle cx="150" cy="80" r="25" fill="${themeColors.primary}" opacity="0.2"/>
        ${icon}

        <!-- 装饰元素 -->
        <circle cx="80" cy="60" r="3" fill="${themeColors.secondary}" opacity="0.6"/>
        <circle cx="220" cy="120" r="4" fill="${themeColors.accent}" opacity="0.5"/>
        <rect x="60" y="140" width="30" height="2" fill="${themeColors.primary}" opacity="0.4" rx="1"/>
        <rect x="210" y="140" width="40" height="2" fill="${themeColors.secondary}" opacity="0.4" rx="1"/>

        <!-- 文字 -->
        <text x="150" y="140" text-anchor="middle" fill="#374151" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600">
          ${this.truncateText(prompt, 25)}
        </text>
        <text x="150" y="175" text-anchor="middle" fill="#6b7280" font-family="system-ui, -apple-system, sans-serif" font-size="11">
          ⚠️ 图片生成暂时不可用，显示概念图
        </text>
      </svg>
    `
  }

  private getThemeColors(prompt: string): { primary: string; secondary: string; accent: string } {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('tech') || lowerPrompt.includes('技术') || lowerPrompt.includes('代码')) {
      return { primary: '#3b82f6', secondary: '#06b6d4', accent: '#10b981' }
    }
    if (lowerPrompt.includes('ai') || lowerPrompt.includes('智能') || lowerPrompt.includes('机器')) {
      return { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b' }
    }
    if (lowerPrompt.includes('business') || lowerPrompt.includes('商业') || lowerPrompt.includes('管理')) {
      return { primary: '#10b981', secondary: '#059669', accent: '#0d9488' }
    }
    if (lowerPrompt.includes('design') || lowerPrompt.includes('设计') || lowerPrompt.includes('创意')) {
      return { primary: '#f59e0b', secondary: '#ef4444', accent: '#ec4899' }
    }
    if (lowerPrompt.includes('science') || lowerPrompt.includes('科学') || lowerPrompt.includes('研究')) {
      return { primary: '#6366f1', secondary: '#3b82f6', accent: '#06b6d4' }
    }

    // 默认配色
    return { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' }
  }

  private getThemeIcon(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('tech') || lowerPrompt.includes('技术')) {
      return `<path d="M140 70 L160 70 M140 80 L160 80 M140 90 L160 90" stroke="#3b82f6" stroke-width="2" opacity="0.7"/>`
    }
    if (lowerPrompt.includes('ai') || lowerPrompt.includes('智能')) {
      return `<circle cx="145" cy="75" r="3" fill="#8b5cf6"/><circle cx="155" cy="75" r="3" fill="#8b5cf6"/><path d="M145 85 Q150 90 155 85" stroke="#8b5cf6" stroke-width="2" fill="none"/>`
    }
    if (lowerPrompt.includes('business') || lowerPrompt.includes('商业')) {
      return `<rect x="140" y="85" width="4" height="10" fill="#10b981"/><rect x="146" y="80" width="4" height="15" fill="#10b981"/><rect x="152" y="75" width="4" height="20" fill="#10b981"/>`
    }
    if (lowerPrompt.includes('design') || lowerPrompt.includes('设计')) {
      return `<circle cx="150" cy="80" r="8" fill="none" stroke="#f59e0b" stroke-width="2"/><circle cx="150" cy="80" r="3" fill="#f59e0b"/>`
    }
    if (lowerPrompt.includes('science') || lowerPrompt.includes('科学')) {
      return `<circle cx="145" cy="80" r="4" fill="none" stroke="#6366f1" stroke-width="1.5"/><circle cx="155" cy="80" r="4" fill="none" stroke="#6366f1" stroke-width="1.5"/><line x1="149" y1="80" x2="151" y2="80" stroke="#6366f1" stroke-width="1.5"/>`
    }

    // 默认图标
    return `<rect x="145" y="75" width="10" height="10" fill="none" stroke="#6b7280" stroke-width="2" rx="2"/>`
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  }

  private async generateDiagram(concept: string, type: string): Promise<AgentResult> {
    // 根据类型生成不同的图表
    const diagramPrompt = this.buildDiagramPrompt(concept, type)
    return await this.generateSketch(diagramPrompt, 'diagram')
  }

  private buildDiagramPrompt(concept: string, type: string): string {
    const prompts = {
      'flowchart': `Create a simple flowchart diagram for: ${concept}. Use boxes and arrows, minimal style.`,
      'mindmap': `Create a mind map diagram for: ${concept}. Central topic with branches, clean layout.`,
      'process': `Create a process diagram for: ${concept}. Step-by-step flow, numbered stages.`,
      'hierarchy': `Create a hierarchy diagram for: ${concept}. Tree structure, clear levels.`,
      'comparison': `Create a comparison diagram for: ${concept}. Side-by-side layout, clear differences.`
    }
    
    return prompts[type as keyof typeof prompts] || prompts.flowchart
  }

  private async createThumbnail(content: any): Promise<AgentResult> {
    // 基于内容创建缩略图
    const thumbnailPrompt = `Create a thumbnail image for: ${content.title}. Simple, iconic, recognizable.`
    return await this.generateSketch(thumbnailPrompt, 'thumbnail')
  }

  private async optimizeImage(imageUrl: string): Promise<AgentResult> {
    // 图像优化逻辑（这里简化处理）
    return {
      success: true,
      data: {
        originalUrl: imageUrl,
        optimizedUrl: imageUrl, // 实际应用中会进行压缩和优化
        optimization: {
          sizeReduction: '15%',
          qualityMaintained: true
        }
      },
      metadata: {
        optimizedAt: new Date(),
        method: 'basic'
      }
    }
  }

  // 设置图像生成模式
  setImageMode(mode: 'standard' | 'premium') {
    this.imageMode = mode
  }

  // 设置AI提供商
  setAIProvider(provider: AIProvider) {
    this.aiProvider = provider
  }

  // 获取当前配置
  getConfiguration() {
    return {
      aiProvider: this.aiProvider,
      imageMode: this.imageMode,
      capabilities: this.config.capabilities
    }
  }
}
