import { NextRequest, NextResponse } from 'next/server'

// 分享卡片生成API
export async function POST(request: NextRequest) {
  try {
    const { title, summary, author, imageUrl } = await request.json()

    if (!title || !summary) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    console.log('🎨 生成分享卡片:', { title: title.slice(0, 30) + '...' })

    // 这里应该使用Canvas或其他图像生成库
    // 为了演示，我们返回一个模拟的图像生成响应
    
    // 模拟图像生成过程
    const cardData = {
      title: title.slice(0, 60) + (title.length > 60 ? '...' : ''),
      summary: summary.slice(0, 120) + (summary.length > 120 ? '...' : ''),
      author: author || '匿名作者',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
      timestamp: new Date().toLocaleDateString('zh-CN'),
      watermark: 'AI卡片阅读平台'
    }

    // 在实际应用中，这里会生成真实的图像
    // 现在我们返回一个SVG作为示例
    const svgCard = generateSVGCard(cardData)
    
    // 转换SVG为PNG (在实际应用中使用puppeteer或canvas)
    const buffer = Buffer.from(svgCard, 'utf-8')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${title.slice(0, 20)}-分享卡片.svg"`
      }
    })

  } catch (error) {
    console.error('生成分享卡片失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '生成分享卡片失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 生成SVG分享卡片
function generateSVGCard(data: {
  title: string
  summary: string
  author: string
  imageUrl: string
  timestamp: string
  watermark: string
}): string {
  return `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.1"/>
        </filter>
      </defs>
      
      <!-- 背景 -->
      <rect width="600" height="400" fill="url(#bg)" rx="20"/>
      
      <!-- 内容区域 -->
      <rect x="40" y="40" width="520" height="320" fill="white" rx="16" filter="url(#shadow)"/>
      
      <!-- 标题 -->
      <text x="60" y="90" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1a202c">
        ${escapeXml(data.title)}
      </text>
      
      <!-- 分割线 -->
      <line x1="60" y1="110" x2="540" y2="110" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- 摘要 -->
      <foreignObject x="60" y="130" width="480" height="120">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #4a5568;">
          ${escapeXml(data.summary)}
        </div>
      </foreignObject>
      
      <!-- 作者信息 -->
      <text x="60" y="280" font-family="Arial, sans-serif" font-size="14" fill="#718096">
        作者：${escapeXml(data.author)}
      </text>
      
      <!-- 时间戳 -->
      <text x="60" y="300" font-family="Arial, sans-serif" font-size="12" fill="#a0aec0">
        ${data.timestamp}
      </text>
      
      <!-- 水印 -->
      <text x="540" y="340" font-family="Arial, sans-serif" font-size="12" fill="#cbd5e0" text-anchor="end">
        ${data.watermark}
      </text>
      
      <!-- 装饰元素 -->
      <circle cx="500" cy="80" r="30" fill="#667eea" opacity="0.1"/>
      <circle cx="520" cy="100" r="20" fill="#764ba2" opacity="0.1"/>
      
      <!-- AI图标 -->
      <g transform="translate(480, 60)">
        <circle cx="20" cy="20" r="18" fill="#667eea"/>
        <text x="20" y="26" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">AI</text>
      </g>
    </svg>
  `
}

// XML转义函数
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 获取分享统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      // 模拟分享统计数据
      const stats = {
        totalShares: 1247,
        platformBreakdown: {
          twitter: 456,
          linkedin: 321,
          facebook: 234,
          wechat: 156,
          email: 80
        },
        topSharedContent: [
          {
            title: 'GPT-4的多模态能力突破',
            shares: 89,
            platforms: ['twitter', 'linkedin']
          },
          {
            title: '设计系统的演进',
            shares: 67,
            platforms: ['twitter', 'facebook']
          }
        ],
        recentShares: [
          {
            title: '创业公司的产品市场匹配策略',
            platform: 'linkedin',
            timestamp: new Date().toISOString()
          }
        ]
      }

      return NextResponse.json({
        success: true,
        data: stats
      })
    }

    return NextResponse.json({
      success: false,
      error: '不支持的操作'
    }, { status: 400 })

  } catch (error) {
    console.error('获取分享统计失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取分享统计失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
