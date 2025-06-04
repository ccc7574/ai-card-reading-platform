import { NextRequest, NextResponse } from 'next/server'
import { ragEngine } from '@/lib/rag-engine'

// RAG智能搜索API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      userId,
      filters,
      options = {},
      mode = 'traditional' // 新增：支持模式选择
    } = body

    if (!query) {
      return NextResponse.json({
        success: false,
        error: '缺少搜索查询'
      }, { status: 400 })
    }

    console.log(`🔍 RAG搜索 (${mode}): ${query}`)

    // 构建RAG查询
    const ragQuery = {
      query,
      userId,
      filters,
      options: {
        topK: options.topK || 10,
        threshold: options.threshold || 0.5,
        rerank: options.rerank !== false, // 默认启用重排序
        includeMetadata: options.includeMetadata !== false,
        mode: mode as 'traditional' | 'agentic',
        agenticConfig: mode === 'agentic' ? {
          intent: options.intent || 'research',
          complexity: options.complexity || 'medium',
          maxSteps: options.maxSteps || 5,
          enableReasoning: options.enableReasoning !== false
        } : undefined
      }
    }

    // 执行RAG搜索
    const searchResult = await ragEngine.search(ragQuery)

    return NextResponse.json({
      success: true,
      message: `RAG搜索完成 (${mode}模式)`,
      data: {
        ...searchResult,
        searchParams: {
          query,
          userId,
          filters,
          options: ragQuery.options
        },
        mode,
        isAgentic: mode === 'agentic'
      }
    })

  } catch (error) {
    console.error('RAG搜索失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'RAG搜索失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 获取搜索建议
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'suggestions'
    const query = searchParams.get('query')

    switch (action) {
      case 'suggestions':
        if (!query) {
          return NextResponse.json({
            success: false,
            error: '缺少查询参数'
          }, { status: 400 })
        }

        // 生成搜索建议
        const suggestions = await generateSearchSuggestions(query)
        
        return NextResponse.json({
          success: true,
          message: '搜索建议生成成功',
          data: {
            query,
            suggestions,
            count: suggestions.length
          }
        })

      case 'popular':
        // 返回热门搜索
        const popularSearches = [
          'AI技术发展趋势',
          '机器学习算法',
          '深度学习应用',
          '自然语言处理',
          '计算机视觉',
          '推荐系统',
          '大语言模型',
          '神经网络',
          '数据科学',
          '云计算技术'
        ]
        
        return NextResponse.json({
          success: true,
          message: '热门搜索获取成功',
          data: {
            popular: popularSearches,
            count: popularSearches.length
          }
        })

      case 'history':
        const userId = searchParams.get('userId')
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: '缺少用户ID'
          }, { status: 400 })
        }

        // 模拟搜索历史
        const searchHistory = [
          { query: 'AI推荐系统', timestamp: new Date(Date.now() - 3600000) },
          { query: '机器学习模型', timestamp: new Date(Date.now() - 7200000) },
          { query: '深度学习框架', timestamp: new Date(Date.now() - 10800000) }
        ]
        
        return NextResponse.json({
          success: true,
          message: '搜索历史获取成功',
          data: {
            userId,
            history: searchHistory,
            count: searchHistory.length
          }
        })

      case 'stats':
        const stats = ragEngine.getStats()
        
        return NextResponse.json({
          success: true,
          message: 'RAG搜索统计',
          data: {
            ...stats,
            searchCapabilities: [
              '语义搜索',
              '查询扩展',
              '结果重排序',
              '多模态检索',
              '实时索引'
            ]
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作类型'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('RAG搜索API错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'RAG搜索API错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 生成搜索建议
async function generateSearchSuggestions(query: string): Promise<string[]> {
  try {
    // 基于查询生成相关建议
    const suggestions = []
    
    // 基础建议
    if (query.toLowerCase().includes('ai')) {
      suggestions.push(
        'AI技术应用',
        'AI发展趋势',
        'AI伦理问题',
        'AI与人类协作'
      )
    }
    
    if (query.toLowerCase().includes('机器学习')) {
      suggestions.push(
        '机器学习算法',
        '机器学习应用案例',
        '机器学习模型优化',
        '机器学习数据处理'
      )
    }
    
    if (query.toLowerCase().includes('深度学习')) {
      suggestions.push(
        '深度学习框架',
        '深度学习网络架构',
        '深度学习训练技巧',
        '深度学习应用领域'
      )
    }
    
    // 如果没有特定匹配，返回通用建议
    if (suggestions.length === 0) {
      suggestions.push(
        `${query}应用`,
        `${query}技术`,
        `${query}发展`,
        `${query}案例`
      )
    }
    
    return suggestions.slice(0, 5)

  } catch (error) {
    console.error('生成搜索建议失败:', error)
    return []
  }
}

// 搜索分析
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'analyze_query':
        const { query } = data
        if (!query) {
          return NextResponse.json({
            success: false,
            error: '缺少查询参数'
          }, { status: 400 })
        }

        const analysis = await analyzeSearchQuery(query)
        
        return NextResponse.json({
          success: true,
          message: '查询分析完成',
          data: analysis
        })

      case 'feedback':
        const { searchId, rating, feedback } = data
        
        // 记录搜索反馈
        console.log(`📝 搜索反馈: ${searchId}, 评分: ${rating}`)
        
        return NextResponse.json({
          success: true,
          message: '反馈记录成功',
          data: { searchId, rating, feedback }
        })

      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作类型'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('搜索分析失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '搜索分析失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 分析搜索查询
async function analyzeSearchQuery(query: string) {
  return {
    query,
    intent: detectSearchIntent(query),
    complexity: calculateQueryComplexity(query),
    entities: extractEntities(query),
    suggestions: await generateSearchSuggestions(query),
    estimatedResults: Math.floor(Math.random() * 100) + 10,
    processingTime: Math.random() * 100 + 50
  }
}

// 检测搜索意图
function detectSearchIntent(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('如何') || lowerQuery.includes('怎么')) {
    return 'how_to'
  }
  if (lowerQuery.includes('什么是') || lowerQuery.includes('定义')) {
    return 'definition'
  }
  if (lowerQuery.includes('比较') || lowerQuery.includes('对比')) {
    return 'comparison'
  }
  if (lowerQuery.includes('最新') || lowerQuery.includes('趋势')) {
    return 'trending'
  }
  if (lowerQuery.includes('案例') || lowerQuery.includes('例子')) {
    return 'examples'
  }
  
  return 'general'
}

// 计算查询复杂度
function calculateQueryComplexity(query: string): 'simple' | 'medium' | 'complex' {
  const words = query.split(/\s+/).length
  const hasSpecialChars = /[()&|"']/.test(query)
  
  if (words <= 2 && !hasSpecialChars) return 'simple'
  if (words <= 5 && !hasSpecialChars) return 'medium'
  return 'complex'
}

// 提取实体
function extractEntities(query: string): string[] {
  const entities = []
  const lowerQuery = query.toLowerCase()
  
  // 技术实体
  const techTerms = ['ai', '人工智能', '机器学习', '深度学习', '神经网络', '算法', '数据科学']
  for (const term of techTerms) {
    if (lowerQuery.includes(term)) {
      entities.push(term)
    }
  }
  
  return entities
}
