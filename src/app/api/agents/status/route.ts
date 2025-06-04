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

// 获取多Agent系统总体状态
export async function GET(request: NextRequest) {
  try {
    console.log('🤖 检查多Agent系统状态...')

    const crew = getCrew()
    const availableWorkflows = crew.getAvailableWorkflows()

    // 统计各个工作流的信息
    const workflowStats = availableWorkflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      mode: workflow.mode,
      agents: workflow.agents.length,
      tasks: workflow.tasks.length,
      manager: workflow.manager ? {
        name: workflow.manager.name,
        role: workflow.manager.role,
        goal: workflow.manager.goal
      } : null,
      capabilities: workflow.agents.map(agent => agent.role),
      businessFunction: getBusinessFunction(workflow.id)
    }))

    // 系统能力统计
    const systemCapabilities = {
      totalWorkflows: availableWorkflows.length,
      totalAgents: availableWorkflows.reduce((sum, w) => sum + w.agents.length, 0),
      totalTasks: availableWorkflows.reduce((sum, w) => sum + w.tasks.length, 0),
      hierarchicalWorkflows: availableWorkflows.filter(w => w.mode === 'hierarchical').length,
      managedWorkflows: availableWorkflows.filter(w => w.manager).length
    }

    // 替代的数据库函数
    const replacedDatabaseFunctions = [
      {
        originalFunction: 'get_recommended_contents',
        agentWorkflow: 'content-recommendation',
        status: 'replaced',
        advantages: [
          '动态用户行为分析',
          '智能内容匹配',
          '实时趋势融合',
          '自适应推荐策略'
        ]
      },
      {
        originalFunction: 'search_contents',
        agentWorkflow: 'content-search',
        status: 'replaced',
        advantages: [
          '自然语言查询理解',
          '语义搜索匹配',
          '智能结果排序',
          '动态搜索策略'
        ]
      },
      {
        originalFunction: 'check_and_grant_achievements',
        agentWorkflow: 'user-achievement',
        status: 'replaced',
        advantages: [
          '智能进度分析',
          '动态成就评估',
          '个性化奖励计算',
          '游戏化激励优化'
        ]
      },
      {
        originalFunction: 'get_user_stats',
        agentWorkflow: 'user-analytics',
        status: 'completed',
        advantages: [
          '多维度数据分析',
          '智能洞察生成',
          '预测性分析',
          '个性化报告'
        ]
      },
      {
        originalFunction: 'update_reading_streak',
        agentWorkflow: 'user-engagement',
        status: 'completed',
        advantages: [
          '智能习惯分析',
          '动态激励调整',
          '个性化提醒',
          '行为模式识别'
        ]
      },
      {
        originalFunction: 'get_trending_tags',
        agentWorkflow: 'trend-analysis',
        status: 'completed',
        advantages: [
          '实时趋势检测',
          '智能标签分析',
          '预测性趋势',
          '多维度热度计算'
        ]
      }
    ]

    console.log(`✅ 多Agent系统状态检查完成: ${availableWorkflows.length} 个工作流`)

    return NextResponse.json({
      success: true,
      message: '多Agent系统状态检查完成',
      timestamp: new Date().toISOString(),
      system: {
        status: 'active',
        architecture: 'hierarchical_multi_agent',
        framework: 'CrewAI-inspired',
        mode: 'production',
        capabilities: systemCapabilities
      },
      workflows: workflowStats,
      databaseReplacement: {
        strategy: 'agent_based_business_logic',
        totalFunctions: replacedDatabaseFunctions.length,
        replaced: replacedDatabaseFunctions.filter(f => f.status === 'replaced').length,
        completed: replacedDatabaseFunctions.filter(f => f.status === 'completed').length,
        functions: replacedDatabaseFunctions
      },
      advantages: [
        '动态工作流调度',
        '智能任务分配',
        '实时策略调整',
        '自适应优化',
        '多维度分析',
        '个性化处理',
        '可扩展架构',
        '智能决策支持'
      ],
      technicalFeatures: [
        '层级模式管理',
        '管理者LLM决策',
        '动态任务调度',
        '反思机制',
        '错误恢复',
        '性能监控',
        '结果缓存',
        '负载均衡'
      ],
      businessValue: [
        '替代复杂数据库函数',
        '提供智能业务逻辑',
        '支持个性化体验',
        '实现自适应系统',
        '降低维护成本',
        '提升用户体验',
        '支持快速迭代',
        '增强系统智能'
      ]
    })

  } catch (error) {
    console.error('❌ 多Agent系统状态检查失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '多Agent系统状态检查失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 获取工作流的业务功能描述
function getBusinessFunction(workflowId: string): string {
  const functions = {
    'content-recommendation': '智能内容推荐 - 替代get_recommended_contents数据库函数',
    'content-search': '智能内容搜索 - 替代search_contents数据库函数',
    'user-achievement': '智能成就系统 - 替代check_and_grant_achievements数据库函数',
    'user-analytics': '用户数据分析 - 替代get_user_stats数据库函数',
    'user-engagement': '用户参与度管理 - 替代update_reading_streak数据库函数',
    'trend-analysis': '趋势分析系统 - 替代get_trending_tags数据库函数'
  }
  
  return functions[workflowId] || '未知业务功能'
}
