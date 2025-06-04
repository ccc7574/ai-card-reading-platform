import { NextRequest, NextResponse } from 'next/server'
import { ContentScraper } from '@/lib/content-scraper'

// 测试内容抓取功能
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: '请提供要抓取的URL' },
        { status: 400 }
      )
    }

    console.log(`🔍 测试抓取URL: ${url}`)

    // 首先验证URL
    const isValid = await ContentScraper.validateUrl(url)
    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'URL无法访问或无效',
          url,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 抓取内容
    const startTime = Date.now()
    const scrapedContent = await ContentScraper.scrapeUrl(url)
    const endTime = Date.now()

    // 获取favicon
    const favicon = await ContentScraper.getFavicon(url)

    console.log(`✅ 抓取成功: ${scrapedContent.title} (${endTime - startTime}ms)`)

    return NextResponse.json({
      success: true,
      message: '内容抓取成功',
      data: {
        ...scrapedContent,
        favicon,
        metadata: {
          processingTime: endTime - startTime,
          contentLength: scrapedContent.content.length,
          hasAuthor: !!scrapedContent.author,
          hasPublishDate: !!scrapedContent.publishDate,
          timestamp: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('内容抓取测试失败:', error)
    
    return NextResponse.json(
      {
        error: '内容抓取失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// 获取支持的网站列表和抓取状态
export async function GET() {
  const supportedSites = [
    {
      name: 'Medium',
      domain: 'medium.com',
      example: 'https://medium.com/@example/article',
      features: ['标题', '内容', '作者', '发布时间']
    },
    {
      name: '知乎',
      domain: 'zhihu.com',
      example: 'https://zhuanlan.zhihu.com/p/123456',
      features: ['标题', '内容', '作者']
    },
    {
      name: '简书',
      domain: 'jianshu.com',
      example: 'https://www.jianshu.com/p/123456',
      features: ['标题', '内容', '作者']
    },
    {
      name: 'CSDN',
      domain: 'csdn.net',
      example: 'https://blog.csdn.net/user/article/details/123456',
      features: ['标题', '内容', '作者', '发布时间']
    },
    {
      name: '博客园',
      domain: 'cnblogs.com',
      example: 'https://www.cnblogs.com/user/p/123456.html',
      features: ['标题', '内容', '作者']
    },
    {
      name: 'SegmentFault',
      domain: 'segmentfault.com',
      example: 'https://segmentfault.com/a/123456',
      features: ['标题', '内容', '作者']
    },
    {
      name: '掘金',
      domain: 'juejin.cn',
      example: 'https://juejin.cn/post/123456',
      features: ['标题', '内容', '作者']
    },
    {
      name: 'InfoQ',
      domain: 'infoq.cn',
      example: 'https://www.infoq.cn/article/123456',
      features: ['标题', '内容', '作者', '发布时间']
    },
    {
      name: '少数派',
      domain: 'sspai.com',
      example: 'https://sspai.com/post/123456',
      features: ['标题', '内容', '作者']
    }
  ]

  const testUrls = [
    'https://medium.com/@example/test-article',
    'https://www.zhihu.com/question/123456',
    'https://blog.csdn.net/test/article/details/123456'
  ]

  return NextResponse.json({
    message: '内容抓取服务状态',
    status: 'active',
    capabilities: {
      supportedSites: supportedSites.length,
      features: [
        '智能内容提取',
        '多网站适配',
        '元数据提取',
        '错误处理',
        'URL验证',
        'Favicon获取'
      ],
      limitations: [
        '需要网站可公开访问',
        '不支持需要登录的内容',
        '可能受到反爬虫限制',
        '处理时间取决于网站响应速度'
      ]
    },
    supportedSites,
    testUrls,
    usage: {
      endpoint: 'POST /api/scrape-test',
      parameters: {
        url: 'string (required) - 要抓取的文章URL'
      },
      example: {
        url: 'https://medium.com/@example/article-title'
      }
    },
    timestamp: new Date().toISOString()
  })
}
