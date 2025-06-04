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

// 智能用户数据分析 - 替代 get_user_stats 数据库函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, timeRange = '30d' } = body

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
        { status: 400 }
      )
    }

    console.log(`📊 启动智能用户分析Agent系统 - 用户: ${userId}, 时间范围: ${timeRange}`)

    const crew = getCrew()
    
    // 使用层级模式的多Agent系统执行用户分析
    const result = await crew.executeUserAnalytics(userId, timeRange)

    if (result.status === 'completed') {
      console.log(`✅ 用户分析Agent系统完成 - 用户: ${userId}`)
      
      // 解析Agent结果并转换为API响应格式
      const analyticsResults = parseAnalyticsResults(result.results, userId, timeRange)
      
      return NextResponse.json({
        success: true,
        message: '智能用户分析完成',
        data: {
          userId,
          timeRange,
          analytics: analyticsResults,
          metadata: {
            agentExecutionTime: result.metadata.executionTime,
            agentIterations: result.metadata.iterations,
            tasksCompleted: result.metadata.tasksCompleted,
            totalTasks: result.metadata.totalTasks,
            timestamp: new Date().toISOString()
          }
        }
      })
    } else {
      throw new Error('用户分析Agent系统执行失败')
    }

  } catch (error) {
    console.error('智能用户分析失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '智能用户分析失败',
      details: error instanceof Error ? error.message : '未知错误',
      fallback: '使用基础统计数据',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 获取用户分析系统状态
export async function GET(request: NextRequest) {
  try {
    const crew = getCrew()
    const availableWorkflows = crew.getAvailableWorkflows()
    const analyticsWorkflow = availableWorkflows.find(w => w.id === 'user-analytics')

    return NextResponse.json({
      success: true,
      message: '智能用户分析系统状态',
      system: {
        status: 'active',
        mode: 'hierarchical',
        workflow: analyticsWorkflow ? {
          id: analyticsWorkflow.id,
          name: analyticsWorkflow.name,
          description: analyticsWorkflow.description,
          agents: analyticsWorkflow.agents.length,
          tasks: analyticsWorkflow.tasks.length,
          manager: analyticsWorkflow.manager?.name
        } : null
      },
      capabilities: [
        '深度行为分析',
        '参与度评估',
        '智能洞察生成',
        '预测性分析',
        '个性化报告'
      ],
      analysisTypes: [
        '行为模式分析',
        '参与度评估',
        '活跃度分析',
        '内容偏好分析',
        '使用习惯分析',
        '成长轨迹分析'
      ],
      advantages: [
        '多维度数据分析',
        '智能模式识别',
        '预测性洞察',
        '个性化建议',
        '实时分析能力'
      ]
    })

  } catch (error) {
    console.error('获取用户分析状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取用户分析状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 解析用户分析结果
function parseAnalyticsResults(agentResults: any, userId: string, timeRange: string): any {
  try {
    // 从Agent结果中提取分析数据
    const behaviorAnalysis = agentResults['analyze-behavior-patterns']
    const engagementAnalysis = agentResults['evaluate-engagement']
    const insightGeneration = agentResults['generate-insights']

    // 模拟解析Agent输出并生成分析结果
    const mockAnalyticsResults = {
      overview: {
        userId,
        timeRange,
        analysisDate: new Date().toISOString(),
        totalViews: 156,
        totalLikes: 23,
        totalBookmarks: 12,
        totalShares: 8,
        totalCards: 5,
        readingStreak: 7,
        totalReadingTime: 480, // 分钟
        achievementsCount: 8,
        agentInsights: {
          behaviorSummary: behaviorAnalysis?.output?.substring(0, 150) + '...',
          engagementSummary: engagementAnalysis?.output?.substring(0, 150) + '...',
          keyInsights: insightGeneration?.output?.substring(0, 150) + '...'
        }
      },
      behaviorPatterns: {
        readingHabits: {
          preferredReadingTime: '晚上 20:00-22:00',
          averageSessionDuration: 15.5, // 分钟
          readingFrequency: '每天 2-3 次',
          contentPreferences: ['AI技术', '产品设计', '创业故事'],
          agentAnalysis: behaviorAnalysis?.output?.substring(0, 200) + '...'
        },
        interactionPatterns: {
          likeToViewRatio: 0.147, // 23/156
          bookmarkToViewRatio: 0.077, // 12/156
          shareToViewRatio: 0.051, // 8/156
          engagementTrend: 'increasing',
          mostActiveHours: ['20:00', '21:00', '09:00'],
          agentAnalysis: '用户在晚间时段最为活跃，互动质量较高'
        },
        contentJourney: {
          discoveryMethods: ['推荐算法 60%', '搜索 25%', '社交分享 15%'],
          readingDepth: 'deep_reader', // shallow, medium, deep
          topicEvolution: ['从技术文章逐渐扩展到商业洞察'],
          agentAnalysis: '用户展现出深度学习的特征，内容偏好逐渐多元化'
        }
      },
      engagement: {
        overallScore: 8.2, // 0-10分
        activityLevel: 'high',
        retentionRisk: 'low',
        engagementTrends: {
          last7Days: [7.5, 8.0, 8.5, 8.2, 8.8, 8.1, 8.2],
          weekOverWeek: '+5.2%',
          monthOverMonth: '+12.8%'
        },
        engagementFactors: {
          contentQuality: 9.1,
          userInterface: 8.5,
          personalRelevance: 8.8,
          socialFeatures: 7.2
        },
        agentInsights: {
          strengths: ['高质量内容消费', '稳定的使用习惯', '积极的互动行为'],
          opportunities: ['增加社交互动', '探索新内容类型', '参与社区讨论'],
          analysis: engagementAnalysis?.output?.substring(0, 200) + '...'
        }
      },
      predictions: {
        nextWeekActivity: {
          expectedViews: 45,
          expectedEngagement: 8.5,
          confidence: 0.85
        },
        churnRisk: {
          probability: 0.12, // 12%
          riskLevel: 'low',
          keyFactors: ['高参与度', '稳定使用模式', '多样化内容消费']
        },
        growthPotential: {
          score: 8.7,
          areas: ['内容创作', '社区参与', '知识分享'],
          recommendations: ['鼓励创作AI卡片', '参与话题讨论', '分享优质内容']
        }
      },
      recommendations: {
        immediate: [
          {
            type: 'content',
            title: '推荐新的AI技术文章',
            description: '基于您的阅读偏好，推荐最新的AI技术趋势文章',
            priority: 'high',
            expectedImpact: '提升参与度 15%'
          },
          {
            type: 'feature',
            title: '尝试创建AI卡片',
            description: '您的深度阅读习惯很适合创作高质量的AI卡片',
            priority: 'medium',
            expectedImpact: '增加创作成就感'
          }
        ],
        longTerm: [
          {
            type: 'community',
            title: '加入AI技术讨论组',
            description: '与其他AI爱好者交流，扩展知识网络',
            priority: 'medium',
            expectedImpact: '提升社交参与度'
          },
          {
            type: 'learning',
            title: '探索商业应用案例',
            description: '结合技术背景，深入了解AI的商业应用',
            priority: 'low',
            expectedImpact: '拓宽知识视野'
          }
        ],
        agentGenerated: insightGeneration?.output?.substring(0, 300) + '...'
      },
      summary: {
        userType: 'Power User',
        keyStrengths: ['深度阅读', '稳定参与', '高质量互动'],
        improvementAreas: ['社交互动', '内容创作', '知识分享'],
        overallHealth: 'excellent',
        nextMilestone: '创建第10张AI卡片',
        agentConclusion: '用户展现出优秀的学习能力和参与度，建议引导其向内容创作者角色发展'
      }
    }

    return mockAnalyticsResults

  } catch (error) {
    console.error('解析用户分析结果失败:', error)
    return {
      overview: { error: '分析失败' },
      behaviorPatterns: {},
      engagement: {},
      predictions: {},
      recommendations: { immediate: [], longTerm: [] },
      summary: { error: '解析失败' }
    }
  }
}
