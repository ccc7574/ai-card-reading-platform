import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { AI_CONFIG, validateAIConfig, getRecommendedProvider, getAvailableProviders, AI_ERROR_MESSAGES } from '@/lib/ai/config'

// 初始化AI服务
const genAI = AI_CONFIG.gemini.apiKey ? new GoogleGenerativeAI(AI_CONFIG.gemini.apiKey) : null
const openai = AI_CONFIG.openai.apiKey ? new OpenAI({ apiKey: AI_CONFIG.openai.apiKey }) : null

// 真实内容抓取函数
async function fetchContentFromUrl(url: string) {
  try {
    console.log(`🔍 开始抓取URL内容: ${url}`)

    // 使用ContentScraper抓取内容
    const { ContentScraper } = await import('@/lib/content-scraper')
    const scrapedContent = await ContentScraper.scrapeUrl(url)

    console.log(`✅ 内容抓取成功: ${scrapedContent.title}`)

    return {
      title: scrapedContent.title,
      content: scrapedContent.content,
      author: scrapedContent.author || '未知作者',
      publishedAt: scrapedContent.publishDate || new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400', // 默认图片
      domain: scrapedContent.domain
    }
  } catch (error) {
    console.error('内容抓取失败:', error)

    // 如果抓取失败，返回基础信息
    return {
      title: '无法抓取的文章',
      content: `由于技术限制，无法直接抓取此URL的内容。URL: ${url}。请手动提供文章内容或使用其他方式。`,
      author: '未知作者',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      domain: 'unknown'
    }
  }
}

// 使用AI生成卡片内容
async function generateCardWithAI(sourceContent: any, provider: 'openai' | 'gemini' = 'gemini') {
  const prompt = `
请基于以下内容生成一个知识卡片：

标题: ${sourceContent.title}
内容: ${sourceContent.content}
作者: ${sourceContent.author}

请生成：
1. 一个吸引人的卡片标题（不超过50字）
2. 一个简洁的摘要（不超过100字，包含emoji）
3. 详细的内容分析（200-300字）
4. 3-5个相关标签
5. 难度等级（beginner/intermediate/advanced）
6. 预估阅读时间（分钟）

请以JSON格式返回，格式如下：
{
  "title": "卡片标题",
  "summary": "简洁摘要",
  "content": "详细内容",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "intermediate",
  "readingTime": 5
}
`

  try {
    let aiResponse = ''

    if (provider === 'gemini' && genAI) {
      console.log('🤖 使用Gemini生成内容...')
      const model = genAI.getGenerativeModel({ model: AI_CONFIG.gemini.models.text })
      const result = await model.generateContent(prompt)
      const response = await result.response
      aiResponse = response.text()

    } else if (provider === 'openai' && openai) {
      console.log('🤖 使用OpenAI生成内容...')
      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.openai.models.text,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容分析师，擅长将复杂内容转化为易懂的知识卡片。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: AI_CONFIG.openai.maxTokens,
        temperature: AI_CONFIG.openai.temperature
      })

      aiResponse = completion.choices[0]?.message?.content || ''

    } else {
      throw new Error(`AI提供商 ${provider} 不可用或未配置`)
    }

    // 尝试解析JSON响应
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log('✅ AI生成成功')
        return parsed
      }
    } catch (parseError) {
      console.error('AI响应解析失败:', parseError)
    }

    // 如果解析失败，返回包含AI响应的默认结构
    return {
      title: sourceContent.title || '智能生成卡片',
      summary: '🤖 AI智能分析生成的知识卡片，包含核心观点和深度洞察。',
      content: aiResponse || '详细内容分析...',
      tags: ['AI生成', '知识卡片'],
      difficulty: 'intermediate',
      readingTime: 5
    }

  } catch (error) {
    console.error('AI生成失败:', error)

    // 如果AI调用失败，返回默认结构
    return {
      title: sourceContent.title || '智能生成卡片',
      summary: '🤖 AI智能分析生成的知识卡片，包含核心观点和深度洞察。',
      content: '这是一个基于源内容生成的知识卡片。由于AI服务暂时不可用，我们为您提供了基础的内容结构。',
      tags: ['AI生成', '知识卡片', '内容分析'],
      difficulty: 'intermediate',
      readingTime: 5
    }
  }
}

// 生成图片（使用Unsplash作为后备）
async function generateImage(title: string, tags: string[]) {
  try {
    // 这里可以集成DALL-E或其他图片生成API
    // 现在使用Unsplash作为后备
    const query = tags.join(',') || 'technology'
    const unsplashUrl = `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80`
    return unsplashUrl
  } catch (error) {
    console.error('图片生成失败:', error)
    return 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, aiProvider = 'gemini' } = body

    if (!url) {
      return NextResponse.json(
        { error: '请提供有效的URL' },
        { status: 400 }
      )
    }

    // 1. 抓取源内容
    console.log('🔍 开始抓取内容:', url)
    const sourceContent = await fetchContentFromUrl(url)
    
    if (!sourceContent) {
      return NextResponse.json(
        { error: '无法抓取内容，请检查URL是否有效' },
        { status: 400 }
      )
    }

    // 2. 使用AI生成卡片内容
    console.log('🤖 开始AI生成...')
    const aiContent = await generateCardWithAI(sourceContent, aiProvider)

    // 3. 生成图片
    console.log('🎨 生成图片...')
    const imageUrl = await generateImage(aiContent.title, aiContent.tags)

    // 4. 构建最终卡片
    const card = {
      id: Date.now().toString(),
      title: aiContent.title,
      summary: aiContent.summary,
      content: aiContent.content,
      tags: aiContent.tags,
      category: 'article',
      difficulty: aiContent.difficulty,
      readingTime: aiContent.readingTime,
      imageUrl,
      sourceUrl: url,
      sourceTitle: sourceContent.title,
      author: sourceContent.author,
      publishedAt: sourceContent.publishedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        aiProvider,
        generatedAt: new Date().toISOString(),
        sourceContent: {
          title: sourceContent.title,
          author: sourceContent.author
        }
      }
    }

    console.log('✅ 卡片生成成功')
    return NextResponse.json({ 
      success: true, 
      card,
      message: '卡片生成成功！'
    })

  } catch (error) {
    console.error('卡片生成失败:', error)
    return NextResponse.json(
      { 
        error: '卡片生成失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const validation = validateAIConfig()
  const recommendedProvider = getRecommendedProvider()

  return NextResponse.json({
    message: 'AI卡片生成API',
    usage: 'POST /api/simple-generate',
    parameters: {
      url: 'string (required) - 要分析的文章URL',
      aiProvider: 'string (optional) - AI提供商: openai | gemini (默认: gemini)'
    },
    status: {
      isConfigured: validation.isValid,
      availableProviders: getAvailableProviders(),
      recommendedProvider,
      issues: validation.issues,
      services: {
        openai: validation.hasOpenAI,
        gemini: validation.hasGemini,
        imageServices: validation.hasImageServices
      }
    }
  })
}
