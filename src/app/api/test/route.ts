import { NextRequest, NextResponse } from 'next/server'
import { AIServiceFactory, AIProvider } from '@/lib/ai-services'
import { ContentScraper } from '@/lib/content-scraper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('type') || 'health'
  
  try {
    switch (testType) {
      case 'health':
        return NextResponse.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            openai: process.env.OPENAI_API_KEY ? '✅ 已配置' : '❌ 未配置',
            gemini: process.env.GOOGLE_API_KEY ? '✅ 已配置' : '❌ 未配置'
          },
          environment: process.env.NODE_ENV
        })
        
      case 'scraper':
        const testUrl = searchParams.get('url') || 'https://example.com'
        try {
          const result = await ContentScraper.scrapeUrl(testUrl)
          return NextResponse.json({
            success: true,
            result: {
              title: result.title,
              contentLength: result.content.length,
              domain: result.domain,
              author: result.author
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '抓取失败'
          })
        }
        
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json({
            success: false,
            error: 'OpenAI API Key 未配置'
          })
        }
        
        try {
          const testContent = "这是一篇关于人工智能发展的测试文章。AI技术正在快速发展，改变着我们的生活方式。"
          const result = await AIServiceFactory.analyzeContent(
            AIProvider.OPENAI,
            'https://test.com',
            testContent
          )
          return NextResponse.json({
            success: true,
            result: {
              title: result.title,
              summary: result.summary,
              tags: result.tags
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'OpenAI 测试失败'
          })
        }
        
      case 'gemini':
        if (!process.env.GOOGLE_API_KEY) {
          return NextResponse.json({
            success: false,
            error: 'Google API Key 未配置'
          })
        }

        try {
          // 测试Gemini 2.0 Flash图片生成
          const { GoogleGenAI, Modality } = await import('@google/genai')
          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })

          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: 'Create a simple sketch of a robot',
            config: {
              responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
          })

          let hasImage = false
          let hasText = false

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) hasImage = true
              if (part.text) hasText = true
            }
          }

          return NextResponse.json({
            success: true,
            result: {
              model: 'gemini-2.0-flash-preview-image-generation',
              hasImage,
              hasText,
              status: 'Gemini 2.0图片生成测试成功'
            }
          })
        } catch (error) {
          console.error('Gemini 2.0图片生成测试失败:', error)
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Gemini 2.0图片生成失败',
            details: process.env.NODE_ENV === 'development' ? error : undefined
          })
        }

      case 'imagen':
        if (!process.env.GOOGLE_API_KEY) {
          return NextResponse.json({
            success: false,
            error: 'Google API Key 未配置'
          })
        }

        try {
          // 测试Imagen 3图片生成
          const { GoogleGenAI } = await import('@google/genai')
          const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })

          const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: 'A simple sketch of a robot',
            config: {
              numberOfImages: 1,
              aspectRatio: '1:1',
            },
          })

          const hasImages = response.generatedImages && response.generatedImages.length > 0

          return NextResponse.json({
            success: true,
            result: {
              model: 'imagen-3.0-generate-002',
              imagesGenerated: hasImages ? response.generatedImages.length : 0,
              status: 'Imagen 3图片生成测试成功'
            }
          })
        } catch (error) {
          console.error('Imagen 3测试失败:', error)
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Imagen 3测试失败',
            details: process.env.NODE_ENV === 'development' ? error : undefined
          })
        }

      default:
        return NextResponse.json({
          error: '不支持的测试类型',
          supportedTypes: ['health', 'scraper', 'openai', 'gemini', 'imagen']
        }, { status: 400 })
    }
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : '测试失败'
    }, { status: 500 })
  }
}
