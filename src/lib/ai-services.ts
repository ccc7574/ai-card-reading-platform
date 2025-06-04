import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleGenAI, Modality } from '@google/genai'

// AI服务提供商枚举
export enum AIProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini'
}

// 内容分析结果接口
export interface ContentAnalysisResult {
  title: string
  summary: string
  content: string
  tags: string[]
  category: 'article' | 'kol-opinion' | 'insight'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readingTime: number
  keyPoints: string[]
}

// 简笔画生成结果接口
export interface SketchGenerationResult {
  imageUrl: string
  prompt: string
  description: string
}

// OpenAI服务类
class OpenAIService {
  private client: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required')
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL
    })
  }

  async analyzeContent(url: string, content: string): Promise<ContentAnalysisResult> {
    try {
      const prompt = `
        请分析以下文章内容，并提取关键信息：

        文章URL: ${url}
        文章内容: ${content}

        请以JSON格式返回以下信息：
        {
          "title": "文章标题",
          "summary": "一句话金句总结（包含emoji，不超过100字）",
          "content": "详细解读内容（HTML格式，包含h2、h3、p、ul、li标签）",
          "tags": ["标签1", "标签2", "标签3"],
          "category": "article|kol-opinion|insight",
          "difficulty": "beginner|intermediate|advanced",
          "readingTime": 估算阅读时间（分钟）,
          "keyPoints": ["要点1", "要点2", "要点3"]
        }
      `

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI内容分析师，擅长提取文章的核心观点并生成简洁的摘要。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const result = response.choices[0]?.message?.content
      if (!result) {
        throw new Error('OpenAI返回空结果')
      }

      return JSON.parse(result)
    } catch (error) {
      console.error('OpenAI内容分析失败:', error)
      throw new Error('内容分析失败')
    }
  }

  async generateSketch(prompt: string): Promise<SketchGenerationResult> {
    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: `Create a simple, minimalist sketch illustration for: ${prompt}. Style: clean lines, simple shapes, black and white, educational diagram style.`,
        size: '1024x1024',
        quality: 'standard',
        n: 1
      })

      const imageUrl = response.data[0]?.url
      if (!imageUrl) {
        throw new Error('DALL-E返回空结果')
      }

      return {
        imageUrl,
        prompt,
        description: `AI生成的${prompt}概念图`
      }
    } catch (error) {
      console.error('OpenAI图像生成失败:', error)
      throw new Error('简笔画生成失败')
    }
  }
}

// Gemini服务类
class GeminiService {
  private client: GoogleGenerativeAI
  private newClient: GoogleGenAI
  private model: any

  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is required')
    }

    // 旧的客户端用于文本生成
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    this.model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })

    // 新的客户端用于图片生成
    this.newClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
  }

  async analyzeContent(url: string, content: string): Promise<ContentAnalysisResult> {
    try {
      // 限制内容长度避免超出token限制
      const truncatedContent = content.slice(0, 2000)

      const prompt = `分析以下文章内容，返回JSON格式：

文章内容: ${truncatedContent}

返回格式：
{
  "title": "文章标题",
  "summary": "一句话总结（含emoji，不超过80字）",
  "content": "详细解读（HTML格式）",
  "tags": ["标签1", "标签2", "标签3"],
  "category": "article",
  "difficulty": "intermediate",
  "readingTime": 5,
  "keyPoints": ["要点1", "要点2", "要点3"]
}

只返回JSON，不要其他文字。`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // 清理响应文本，提取JSON部分
      let jsonText = text.trim()

      // 移除可能的markdown代码块标记
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '')

      // 尝试找到JSON对象
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }

      try {
        return JSON.parse(jsonText)
      } catch (parseError) {
        console.error('JSON解析失败:', parseError, 'Raw text:', text)
        throw new Error('Gemini返回的不是有效JSON格式')
      }
    } catch (error) {
      console.error('Gemini内容分析失败:', error)
      throw new Error('内容分析失败')
    }
  }

  async generateSketch(prompt: string): Promise<SketchGenerationResult> {
    try {
      // 尝试使用Gemini 2.0 Flash的图片生成功能
      const response = await this.newClient.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: `Create a simple, minimalist sketch illustration for: ${prompt}. Style: clean lines, simple shapes, black and white, educational diagram style.`,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      })

      // 查找图片数据
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data
            const imageUrl = `data:image/png;base64,${imageData}`

            return {
              imageUrl,
              prompt,
              description: `Gemini 2.0生成的${prompt}概念图`
            }
          }
        }
      }

      // 如果没有图片，降级到SVG生成
      throw new Error('No image generated')

    } catch (error) {
      console.error('Gemini图像生成失败，使用SVG备选:', error)

      try {
        // 降级：使用文本生成SVG描述
        const svgPrompt = `为以下概念创建一个简单的SVG简笔画描述：${prompt}

        请返回SVG代码，要求：
        1. 使用简单的几何形状
        2. 黑白色调
        3. 尺寸为300x200
        4. 包含相关的图标和文字标签
        5. 风格简洁明了`

        const result = await this.model.generateContent(svgPrompt)
        const response = await result.response
        const svgCode = response.text()

        // 提取SVG代码
        const svgMatch = svgCode.match(/<svg[\s\S]*<\/svg>/)
        const finalSvg = svgMatch ? svgMatch[0] : this.generateFallbackSVG(prompt)

        // 将SVG转换为Data URL
        const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(finalSvg).toString('base64')}`

        return {
          imageUrl: svgDataUrl,
          prompt,
          description: `Gemini SVG生成的${prompt}概念图`
        }
      } catch (svgError) {
        console.error('SVG生成也失败:', svgError)
        // 最终备选方案
        return {
          imageUrl: `data:image/svg+xml;base64,${Buffer.from(this.generateFallbackSVG(prompt)).toString('base64')}`,
          prompt,
          description: `${prompt}概念图`
        }
      }
    }
  }

  private generateFallbackSVG(prompt: string): string {
    return `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc"/>
        <rect x="50" y="50" width="200" height="100" fill="none" stroke="#64748b" stroke-width="2" rx="10"/>
        <circle cx="150" cy="80" r="15" fill="#3b82f6"/>
        <text x="150" y="130" text-anchor="middle" fill="#1e293b" font-family="Arial, sans-serif" font-size="14">
          ${prompt.slice(0, 20)}${prompt.length > 20 ? '...' : ''}
        </text>
        <text x="150" y="180" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="12">
          AI概念图
        </text>
      </svg>
    `
  }
}

// AI服务工厂
export class AIServiceFactory {
  static createService(provider: AIProvider) {
    switch (provider) {
      case AIProvider.OPENAI:
        return new OpenAIService()
      case AIProvider.GEMINI:
        return new GeminiService()
      default:
        throw new Error(`不支持的AI服务提供商: ${provider}`)
    }
  }

  static async analyzeContent(
    provider: AIProvider,
    url: string,
    content: string
  ): Promise<ContentAnalysisResult> {
    const service = this.createService(provider)
    return await service.analyzeContent(url, content)
  }

  static async generateSketch(
    provider: AIProvider,
    prompt: string
  ): Promise<SketchGenerationResult> {
    const service = this.createService(provider)
    return await service.generateSketch(prompt)
  }

  // 使用Imagen 3生成高质量图片
  static async generateImageWithImagen(prompt: string): Promise<SketchGenerationResult> {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is required for Imagen')
    }

    try {
      const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })

      const response = await client.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `Simple, minimalist sketch illustration: ${prompt}. Style: clean lines, educational diagram, black and white.`,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      })

      if (response.generatedImages && response.generatedImages.length > 0) {
        const generatedImage = response.generatedImages[0]
        if (generatedImage.image?.imageBytes) {
          const imageBytes = generatedImage.image.imageBytes
          const imageUrl = `data:image/png;base64,${imageBytes}`

          return {
            imageUrl,
            prompt,
            description: `Imagen 3生成的${prompt}概念图`
          }
        }
      }

      throw new Error('Imagen 3没有生成图片')
    } catch (error) {
      console.error('Imagen 3生成失败:', error)
      throw new Error('Imagen 3图片生成失败')
    }
  }
}
