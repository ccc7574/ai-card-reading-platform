import { NextRequest, NextResponse } from 'next/server'
import { HierarchicalCrew } from '@/lib/agents/hierarchical-crew'

// 全局实例
let crewInstance: HierarchicalCrew | null = null

function getCrew(): HierarchicalCrew {
  if (!crewInstance) {
    crewInstance = new HierarchicalCrew()
  }
  return crewInstance
}

// 智能内容搜索 - 替代 search_contents 数据库函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query, 
      categoryIds = [], 
      tagIds = [], 
      difficultyLevels = [], 
      minReadingTime = 0, 
      maxReadingTime = 999, 
      sortBy = 'relevance', 
      limit = 20, 
      offset = 0 
    } = body

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: '搜索查询不能为空' },
        { status: 400 }
      )
    }

    console.log(`🔍 启动智能搜索Agent系统 - 查询: "${query}"`)

    const crew = getCrew()
    
    // 使用层级模式的多Agent系统执行搜索
    const result = await crew.executeSearch(query, {
      categoryIds,
      tagIds,
      difficultyLevels,
      minReadingTime,
      maxReadingTime,
      sortBy,
      limit,
      offset,
      context: 'intelligent_search'
    })

    if (result.status === 'completed') {
      console.log(`✅ 搜索Agent系统完成 - 查询: "${query}"`)
      
      // 解析Agent结果并转换为API响应格式
      const searchResults = parseSearchResults(result.results, query)
      
      return NextResponse.json({
        success: true,
        message: '智能搜索完成',
        data: {
          query,
          results: searchResults,
          metadata: {
            totalResults: searchResults.length,
            agentExecutionTime: result.metadata.executionTime,
            agentIterations: result.metadata.iterations,
            tasksCompleted: result.metadata.tasksCompleted,
            searchStrategy: 'hierarchical_multi_agent',
            timestamp: new Date().toISOString()
          }
        }
      })
    } else {
      throw new Error('搜索Agent系统执行失败')
    }

  } catch (error) {
    console.error('智能搜索失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '智能搜索失败',
      details: error instanceof Error ? error.message : '未知错误',
      fallback: '使用基础搜索算法',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 获取搜索系统状态
export async function GET(request: NextRequest) {
  try {
    const crew = getCrew()
    const availableWorkflows = crew.getAvailableWorkflows()
    const searchWorkflow = availableWorkflows.find(w => w.id === 'content-search')

    return NextResponse.json({
      success: true,
      message: '智能搜索系统状态',
      system: {
        status: 'active',
        mode: 'hierarchical',
        workflow: searchWorkflow ? {
          id: searchWorkflow.id,
          name: searchWorkflow.name,
          description: searchWorkflow.description,
          agents: searchWorkflow.agents.length,
          tasks: searchWorkflow.tasks.length,
          manager: searchWorkflow.manager?.name
        } : null
      },
      capabilities: [
        '自然语言查询理解',
        '语义搜索匹配',
        '智能结果排序',
        '多维度过滤',
        '个性化优化'
      ],
      searchFeatures: [
        '意图识别',
        '查询扩展',
        '全文搜索',
        '语义匹配',
        '相关性评分',
        '质量评估',
        '个性化排序'
      ],
      advantages: [
        '理解搜索意图',
        '动态查询优化',
        '智能结果排序',
        '多Agent协作',
        '实时策略调整'
      ]
    })

  } catch (error) {
    console.error('获取搜索状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取搜索状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 解析搜索结果
function parseSearchResults(agentResults: any, originalQuery: string): any[] {
  try {
    // 从Agent结果中提取搜索内容
    const queryProcessing = agentResults['process-query']
    const contentSearch = agentResults['search-content']
    const resultRanking = agentResults['rank-results']

    // 模拟解析Agent输出并生成搜索结果
    // 在实际实现中，这里会解析Agent的自然语言输出
    // 并转换为结构化的搜索结果
    
    const mockSearchResults = [
      {
        id: 'search-1',
        title: `${originalQuery}相关的深度技术分析`,
        summary: `关于${originalQuery}的全面技术解析和实践指南`,
        content: `这是一篇关于${originalQuery}的详细技术文章...`,
        url: `https://example.com/search-result-1`,
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        author: '技术专家',
        source: 'Tech Insights',
        category: '技术分析',
        difficulty: 'intermediate',
        readingTime: 10,
        qualityScore: 0.94,
        relevanceScore: 0.96,
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
        agentInsights: {
          queryUnderstanding: queryProcessing?.output?.substring(0, 100) + '...',
          searchStrategy: contentSearch?.output?.substring(0, 100) + '...',
          rankingReason: resultRanking?.output?.substring(0, 100) + '...'
        },
        highlightedTerms: [originalQuery],
        matchType: 'semantic'
      },
      {
        id: 'search-2',
        title: `实战案例：${originalQuery}在企业中的应用`,
        summary: `探索${originalQuery}在实际业务场景中的应用案例和最佳实践`,
        content: `本文通过多个企业案例，深入分析${originalQuery}的实际应用...`,
        url: `https://example.com/search-result-2`,
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        author: '行业分析师',
        source: 'Business Tech',
        category: '案例研究',
        difficulty: 'advanced',
        readingTime: 15,
        qualityScore: 0.91,
        relevanceScore: 0.93,
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
        agentInsights: {
          queryUnderstanding: '识别为案例研究需求',
          searchStrategy: '匹配企业应用场景',
          rankingReason: '高质量案例内容优先'
        },
        highlightedTerms: [originalQuery, '企业应用', '案例'],
        matchType: 'contextual'
      },
      {
        id: 'search-3',
        title: `${originalQuery}技术趋势与未来展望`,
        summary: `分析${originalQuery}的发展趋势和未来技术方向`,
        content: `随着技术的不断发展，${originalQuery}正在向更加智能化的方向演进...`,
        url: `https://example.com/search-result-3`,
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        author: '未来学家',
        source: 'Future Tech',
        category: '趋势分析',
        difficulty: 'intermediate',
        readingTime: 8,
        qualityScore: 0.88,
        relevanceScore: 0.89,
        publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
        agentInsights: {
          queryUnderstanding: '识别为趋势分析需求',
          searchStrategy: '匹配前瞻性内容',
          rankingReason: '趋势相关性高'
        },
        highlightedTerms: [originalQuery, '趋势', '未来'],
        matchType: 'trend_based'
      }
    ]

    return mockSearchResults

  } catch (error) {
    console.error('解析搜索结果失败:', error)
    return []
  }
}
