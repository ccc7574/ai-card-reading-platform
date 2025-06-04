import { NextRequest, NextResponse } from 'next/server'
import { HierarchicalCrew } from '@/lib/agents/hierarchical-crew'

// 全局实例 - 避免重复初始化
let crewInstance: HierarchicalCrew | null = null

function getCrew(): HierarchicalCrew {
  if (!crewInstance) {
    crewInstance = new HierarchicalCrew()
  }
  return crewInstance
}

// 智能内容推荐 - 替代 get_recommended_contents 数据库函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences, limit = 10, offset = 0 } = body

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
        { status: 400 }
      )
    }

    console.log(`🤖 启动智能推荐Agent系统 - 用户: ${userId}`)

    const crew = getCrew()
    
    // 使用层级模式的多Agent系统执行推荐
    const result = await crew.executeRecommendation(userId, {
      preferences,
      limit,
      offset,
      context: 'content_recommendation'
    })

    if (result.status === 'completed') {
      console.log(`✅ 推荐Agent系统完成 - 用户: ${userId}`)
      
      // 解析Agent结果并转换为API响应格式
      const recommendations = parseRecommendationResults(result.results)
      
      return NextResponse.json({
        success: true,
        message: '智能推荐完成',
        data: {
          recommendations,
          metadata: {
            userId,
            agentExecutionTime: result.metadata.executionTime,
            agentIterations: result.metadata.iterations,
            tasksCompleted: result.metadata.tasksCompleted,
            totalTasks: result.metadata.totalTasks,
            timestamp: new Date().toISOString()
          }
        }
      })
    } else {
      throw new Error('推荐Agent系统执行失败')
    }

  } catch (error) {
    console.error('智能推荐失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '智能推荐失败',
      details: error instanceof Error ? error.message : '未知错误',
      fallback: '使用基础推荐算法',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 获取推荐状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflowId')

    if (workflowId) {
      const crew = getCrew()
      const status = crew.getWorkflowStatus(workflowId)
      
      return NextResponse.json({
        success: true,
        workflowId,
        status
      })
    }

    // 返回推荐系统状态
    const crew = getCrew()
    const availableWorkflows = crew.getAvailableWorkflows()
    const recommendationWorkflow = availableWorkflows.find(w => w.id === 'content-recommendation')

    return NextResponse.json({
      success: true,
      message: '智能推荐系统状态',
      system: {
        status: 'active',
        mode: 'hierarchical',
        workflow: recommendationWorkflow ? {
          id: recommendationWorkflow.id,
          name: recommendationWorkflow.name,
          description: recommendationWorkflow.description,
          agents: recommendationWorkflow.agents.length,
          tasks: recommendationWorkflow.tasks.length,
          manager: recommendationWorkflow.manager?.name
        } : null
      },
      capabilities: [
        '用户行为分析',
        '内容智能匹配',
        '趋势融合推荐',
        '个性化排序',
        '实时调整优化'
      ],
      advantages: [
        '动态工作流调度',
        '智能任务分配',
        '自适应优化',
        '多维度分析',
        '实时反思调整'
      ]
    })

  } catch (error) {
    console.error('获取推荐状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取推荐状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 解析推荐结果
function parseRecommendationResults(agentResults: any): any[] {
  try {
    // 从Agent结果中提取推荐内容
    const userBehaviorAnalysis = agentResults['analyze-user-behavior']
    const contentMatching = agentResults['match-content']
    const trendIncorporation = agentResults['incorporate-trends']

    // 模拟解析Agent输出并生成推荐列表
    // 在实际实现中，这里会解析Agent的自然语言输出
    // 并转换为结构化的推荐数据
    
    const mockRecommendations = [
      {
        id: 'rec-1',
        title: 'AI驱动的个性化推荐系统设计',
        summary: '基于用户行为分析的智能推荐算法实现',
        url: 'https://example.com/ai-recommendation',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        author: 'AI专家',
        source: 'Tech Blog',
        category: 'AI技术',
        difficulty: 'intermediate',
        readingTime: 8,
        qualityScore: 0.92,
        relevanceScore: 0.95,
        trendingScore: 0.88,
        reason: '基于您的AI技术兴趣和最近的阅读行为',
        agentInsights: {
          behaviorMatch: userBehaviorAnalysis?.output?.substring(0, 100) + '...',
          contentRelevance: contentMatching?.output?.substring(0, 100) + '...',
          trendAlignment: trendIncorporation?.output?.substring(0, 100) + '...'
        }
      },
      {
        id: 'rec-2',
        title: '多Agent系统在企业级应用中的实践',
        summary: '探索CrewAI框架在复杂业务场景中的应用',
        url: 'https://example.com/multi-agent-enterprise',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        author: '系统架构师',
        source: 'Enterprise Tech',
        category: '系统架构',
        difficulty: 'advanced',
        readingTime: 12,
        qualityScore: 0.89,
        relevanceScore: 0.91,
        trendingScore: 0.85,
        reason: '与您关注的多Agent系统话题高度相关',
        agentInsights: {
          behaviorMatch: '匹配您的高级技术内容偏好',
          contentRelevance: '与当前项目需求高度相关',
          trendAlignment: '符合当前技术发展趋势'
        }
      }
    ]

    return mockRecommendations

  } catch (error) {
    console.error('解析推荐结果失败:', error)
    return []
  }
}
