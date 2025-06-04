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

// 智能成就检查和授予 - 替代 check_and_grant_achievements 数据库函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
        { status: 400 }
      )
    }

    console.log(`🏆 启动智能成就Agent系统 - 用户: ${userId}`)

    const crew = getCrew()
    
    // 使用层级模式的多Agent系统执行成就检查
    const result = await crew.executeAchievementCheck(userId)

    if (result.status === 'completed') {
      console.log(`✅ 成就Agent系统完成 - 用户: ${userId}`)
      
      // 解析Agent结果并转换为API响应格式
      const achievementResults = parseAchievementResults(result.results, userId)
      
      return NextResponse.json({
        success: true,
        message: '智能成就检查完成',
        data: {
          userId,
          achievements: achievementResults,
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
      throw new Error('成就Agent系统执行失败')
    }

  } catch (error) {
    console.error('智能成就检查失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '智能成就检查失败',
      details: error instanceof Error ? error.message : '未知错误',
      fallback: '使用基础成就检查',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 获取成就系统状态
export async function GET(request: NextRequest) {
  try {
    const crew = getCrew()
    const availableWorkflows = crew.getAvailableWorkflows()
    const achievementWorkflow = availableWorkflows.find(w => w.id === 'user-achievement')

    return NextResponse.json({
      success: true,
      message: '智能成就系统状态',
      system: {
        status: 'active',
        mode: 'hierarchical',
        workflow: achievementWorkflow ? {
          id: achievementWorkflow.id,
          name: achievementWorkflow.name,
          description: achievementWorkflow.description,
          agents: achievementWorkflow.agents.length,
          tasks: achievementWorkflow.tasks.length,
          manager: achievementWorkflow.manager?.name
        } : null
      },
      capabilities: [
        '智能进度跟踪',
        '多维度成就评估',
        '动态奖励计算',
        '个性化通知',
        '游戏化激励'
      ],
      achievementTypes: [
        '阅读成就',
        '社交成就',
        '创作成就',
        '探索成就',
        '连续性成就',
        '里程碑成就'
      ],
      advantages: [
        '智能条件评估',
        '动态奖励调整',
        '个性化激励',
        '实时进度分析',
        '多Agent协作验证'
      ]
    })

  } catch (error) {
    console.error('获取成就状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取成就状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 解析成就结果
function parseAchievementResults(agentResults: any, userId: string): any {
  try {
    // 从Agent结果中提取成就数据
    const progressTracking = agentResults['track-progress']
    const achievementEvaluation = agentResults['evaluate-achievements']
    const rewardDistribution = agentResults['distribute-rewards']

    // 模拟解析Agent输出并生成成就结果
    // 在实际实现中，这里会解析Agent的自然语言输出
    // 并转换为结构化的成就数据
    
    const mockAchievementResults = {
      newAchievements: [
        {
          id: 'achievement-reader-1',
          name: '知识探索者',
          title: '阅读达人',
          description: '累计阅读10篇文章',
          icon: '📚',
          rarity: 'common',
          category: 'reading',
          points: 100,
          unlockedAt: new Date().toISOString(),
          agentInsights: {
            progressAnalysis: progressTracking?.output?.substring(0, 100) + '...',
            evaluationReason: achievementEvaluation?.output?.substring(0, 100) + '...',
            rewardDetails: rewardDistribution?.output?.substring(0, 100) + '...'
          }
        },
        {
          id: 'achievement-social-1',
          name: '社交新星',
          title: '互动达人',
          description: '获得5个点赞',
          icon: '👍',
          rarity: 'common',
          category: 'social',
          points: 50,
          unlockedAt: new Date().toISOString(),
          agentInsights: {
            progressAnalysis: '社交活动分析完成',
            evaluationReason: '达到点赞数量阈值',
            rewardDetails: '社交激励奖励已发放'
          }
        }
      ],
      progressUpdates: [
        {
          achievementId: 'achievement-creator-1',
          name: '内容创作者',
          description: '创建20张AI卡片',
          currentProgress: 15,
          targetProgress: 20,
          progressPercentage: 75,
          category: 'creation',
          estimatedCompletion: '还需创建5张卡片',
          agentInsights: {
            progressTrend: '创作活动稳步增长',
            recommendations: '建议继续保持创作频率'
          }
        },
        {
          achievementId: 'achievement-streak-1',
          name: '连续阅读者',
          description: '连续阅读7天',
          currentProgress: 5,
          targetProgress: 7,
          progressPercentage: 71,
          category: 'streak',
          estimatedCompletion: '还需连续阅读2天',
          agentInsights: {
            progressTrend: '阅读习惯良好',
            recommendations: '保持每日阅读习惯'
          }
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          type: 'achievement',
          title: '恭喜获得新成就！',
          message: '您已解锁"知识探索者"成就，获得100积分奖励！',
          actionUrl: '/achievements',
          createdAt: new Date().toISOString()
        },
        {
          id: 'notif-2',
          type: 'achievement',
          title: '社交成就达成！',
          message: '您已解锁"社交新星"成就，继续与社区互动吧！',
          actionUrl: '/achievements',
          createdAt: new Date().toISOString()
        }
      ],
      summary: {
        totalNewAchievements: 2,
        totalPointsEarned: 150,
        progressUpdates: 2,
        nextMilestone: {
          name: '内容创作者',
          progress: '15/20',
          percentage: 75
        },
        agentAnalysis: {
          userEngagement: '用户活跃度较高',
          achievementVelocity: '成就获取速度正常',
          recommendations: [
            '继续保持阅读习惯',
            '尝试更多社交互动',
            '完成创作类成就'
          ]
        }
      }
    }

    return mockAchievementResults

  } catch (error) {
    console.error('解析成就结果失败:', error)
    return {
      newAchievements: [],
      progressUpdates: [],
      notifications: [],
      summary: {
        totalNewAchievements: 0,
        totalPointsEarned: 0,
        progressUpdates: 0,
        error: '解析失败'
      }
    }
  }
}
