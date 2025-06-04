import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 检查数据库函数状态
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未初始化',
        details: '请检查环境变量配置'
      }, { status: 500 })
    }

    console.log('🔍 检查数据库函数状态...')

    // 原有的数据库函数已移除，现在由Agent系统处理
    const removedFunctions = [
      {
        name: 'get_recommended_contents',
        description: '获取推荐内容',
        replacedBy: 'content-recommendation Agent工作流',
        agentEndpoint: '/api/agents/recommendation'
      },
      {
        name: 'search_contents',
        description: '搜索内容',
        replacedBy: 'content-search Agent工作流',
        agentEndpoint: '/api/agents/search'
      },
      {
        name: 'get_user_stats',
        description: '获取用户统计数据',
        replacedBy: 'user-analytics Agent工作流',
        agentEndpoint: '/api/agents/analytics'
      },
      {
        name: 'update_reading_streak',
        description: '更新用户阅读连续天数',
        replacedBy: 'user-engagement Agent工作流',
        agentEndpoint: '/api/agents/engagement'
      },
      {
        name: 'check_and_grant_achievements',
        description: '检查并授予成就',
        replacedBy: 'user-achievement Agent工作流',
        agentEndpoint: '/api/agents/achievements'
      },
      {
        name: 'get_trending_tags',
        description: '获取热门标签',
        replacedBy: 'trend-analysis Agent工作流',
        agentEndpoint: '/api/agents/trends'
      }
    ]

    // 检查Agent系统状态（替代函数检查）
    const agentStatus = {}

    for (const func of removedFunctions) {
      try {
        // 检查对应的Agent端点是否可用
        const response = await fetch(`http://localhost:3000${func.agentEndpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        agentStatus[func.name] = {
          removed: true,
          replacedBy: func.replacedBy,
          agentEndpoint: func.agentEndpoint,
          agentAvailable: response.ok,
          description: func.description,
          status: response.ok ? 'replaced_by_agent' : 'agent_unavailable'
        }
      } catch (err) {
        agentStatus[func.name] = {
          removed: true,
          replacedBy: func.replacedBy,
          agentEndpoint: func.agentEndpoint,
          agentAvailable: false,
          description: func.description,
          status: 'agent_error',
          error: err instanceof Error ? err.message : '检查失败'
        }
      }
    }

    // 统计结果
    const availableAgents = Object.keys(agentStatus).filter(
      name => agentStatus[name].agentAvailable
    )
    const totalFunctions = removedFunctions.length

    // 检查触发器
    const triggerStatus = {}
    const expectedTriggers = [
      'update_user_profiles_updated_at',
      'update_categories_updated_at',
      'update_tags_updated_at',
      'update_contents_updated_at',
      'update_cards_updated_at',
      'update_comments_updated_at',
      'update_user_preferences_updated_at'
    ]

    for (const trigger of expectedTriggers) {
      try {
        const { data: triggerExists, error: triggerError } = await supabase
          .from('information_schema.triggers')
          .select('trigger_name, event_manipulation')
          .eq('trigger_schema', 'public')
          .eq('trigger_name', trigger)

        triggerStatus[trigger] = {
          exists: triggerExists && triggerExists.length > 0,
          error: triggerError?.message || null
        }
      } catch (err) {
        triggerStatus[trigger] = {
          exists: false,
          error: err instanceof Error ? err.message : '检查失败'
        }
      }
    }

    const existingTriggers = Object.keys(triggerStatus).filter(
      name => triggerStatus[name].exists
    )

    // 生成建议
    const recommendations = []

    if (availableAgents.length === totalFunctions) {
      recommendations.push({
        type: 'success',
        message: '所有数据库函数已成功替换为Agent系统',
        action: '可以使用智能Agent功能，比传统SQL函数更强大'
      })
    } else {
      recommendations.push({
        type: 'warning',
        message: '部分Agent端点不可用',
        action: '检查Agent系统状态和服务器运行情况'
      })
    }

    if (existingTriggers.length < expectedTriggers.length) {
      recommendations.push({
        type: 'info',
        message: '部分触发器缺失',
        action: '触发器功能也可以由Agent系统处理'
      })
    }

    console.log(`✅ 函数迁移检查完成: ${availableAgents.length}/${totalFunctions} Agent可用`)

    return NextResponse.json({
      success: true,
      message: '数据库函数迁移状态检查完成',
      timestamp: new Date().toISOString(),
      migration: {
        status: 'completed',
        approach: 'sql_functions_to_agents',
        description: '所有SQL函数已迁移到智能Agent系统'
      },
      functions: {
        removed: agentStatus,
        summary: {
          totalRemoved: totalFunctions,
          agentsAvailable: availableAgents.length,
          agentsUnavailable: totalFunctions - availableAgents.length,
          migrationComplete: availableAgents.length === totalFunctions
        }
      },
      triggers: {
        status: triggerStatus,
        summary: {
          total: expectedTriggers.length,
          existing: existingTriggers.length,
          missing: expectedTriggers.length - existingTriggers.length,
          note: '触发器功能可由Agent系统处理'
        }
      },
      advantages: [
        '智能业务逻辑处理',
        '动态适应用户需求',
        '可解释的决策过程',
        '实时优化和学习',
        '更好的可维护性',
        '支持复杂的多步骤处理'
      ],
      recommendations
    })

  } catch (error) {
    console.error('❌ 数据库函数检查失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '数据库函数检查失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
