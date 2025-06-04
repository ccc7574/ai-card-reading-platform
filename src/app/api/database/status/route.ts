import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 简化的数据库状态检查
export async function GET() {
  try {
    console.log('🔍 检查数据库配置状态...')

    // 检查环境变量
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasClient = !!supabase

    const config = {
      url: hasUrl ? '已配置' : '未配置',
      key: hasKey ? '已配置' : '未配置',
      client: hasClient ? '已初始化' : '未初始化'
    }

    console.log('📊 配置状态:', config)

    if (!hasClient) {
      return NextResponse.json({
        success: false,
        status: 'not_configured',
        message: 'Supabase数据库未配置',
        config,
        recommendations: [
          {
            type: 'error',
            message: '数据库未配置',
            action: '请在.env.local中配置Supabase环境变量'
          },
          {
            type: 'info',
            message: '需要配置项',
            action: 'NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY'
          }
        ]
      })
    }

    // 尝试简单的连接测试
    let connectionStatus = 'unknown'
    let connectionError = null

    try {
      // 使用一个简单的查询来测试连接
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        connectionStatus = 'error'
        connectionError = error.message
      } else {
        connectionStatus = 'connected'
      }
    } catch (err) {
      connectionStatus = 'failed'
      connectionError = err instanceof Error ? err.message : '连接失败'
    }

    console.log('🔗 连接状态:', connectionStatus)

    // 检查表是否存在（完整版）
    const tables = [
      // 核心表
      'user_profiles',
      'categories',
      'tags',
      'contents',
      'cards',

      // 关联表
      'content_tags',
      'card_tags',

      // 用户活动表
      'user_activities',
      'notifications',
      'comments',
      'likes',
      'bookmarks',
      'shares',

      // 成就系统
      'achievements',
      'user_achievements',

      // 用户偏好
      'user_preferences'
    ]

    // 特殊表状态（不需要在数据库中创建的表）
    const specialTables = {
      'users': {
        exists: true,
        type: 'supabase_auth',
        note: '使用Supabase auth.users表'
      },
      'data_sources': {
        exists: true,
        type: 'memory_manager',
        note: '使用内存数据源管理器'
      }
    }
    const tableStatus = {}

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        tableStatus[table] = {
          exists: !error,
          error: error?.message || null
        }
      } catch (err) {
        tableStatus[table] = {
          exists: false,
          error: err instanceof Error ? err.message : '查询失败'
        }
      }
    }

    // 合并特殊表状态
    const allTableStatus = { ...tableStatus, ...specialTables }

    const existingTables = Object.keys(allTableStatus).filter(
      table => allTableStatus[table].exists
    )
    const missingTables = Object.keys(allTableStatus).filter(
      table => !allTableStatus[table].exists
    )

    // 生成建议
    const recommendations = []

    if (connectionStatus === 'connected') {
      if (existingTables.length === 0) {
        recommendations.push({
          type: 'warning',
          message: '数据库连接成功但表不存在',
          action: '需要部署数据库架构'
        })
      } else if (existingTables.length < tables.length) {
        recommendations.push({
          type: 'warning',
          message: '部分表缺失',
          action: '需要完成数据库部署'
        })
      } else {
        recommendations.push({
          type: 'success',
          message: '数据库配置正常',
          action: '可以开始使用数据库功能'
        })
      }
    } else {
      recommendations.push({
        type: 'error',
        message: '数据库连接失败',
        action: '请检查Supabase项目状态和网络连接'
      })
    }

    return NextResponse.json({
      success: connectionStatus === 'connected',
      status: connectionStatus,
      message: connectionStatus === 'connected' ? '数据库状态检查完成' : '数据库连接失败',
      timestamp: new Date().toISOString(),
      config,
      connection: {
        status: connectionStatus,
        error: connectionError,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/.*/, '/***') || 'not_configured'
      },
      tables: {
        status: allTableStatus,
        summary: {
          total: Object.keys(allTableStatus).length,
          existing: existingTables.length,
          missing: missingTables.length,
          databaseTables: tables.length,
          specialTables: Object.keys(specialTables).length
        },
        categories: {
          database: tableStatus,
          special: specialTables
        }
      },
      deployment: {
        isComplete: missingTables.length === 0,
        progress: `${existingTables.length}/${Object.keys(allTableStatus).length}`,
        databaseTablesComplete: Object.keys(tableStatus).filter(t => tableStatus[t].exists).length === tables.length,
        nextSteps: missingTables.length === 0
          ? ['数据库架构完整', '所有表都已就绪']
          : missingTables.length > 0
          ? [`完成剩余表的创建: ${missingTables.join(', ')}`, '验证表结构']
          : ['数据库已就绪'],
        architecture: {
          authentication: 'Supabase Auth (auth.users)',
          userProfiles: 'Database Table (user_profiles)',
          dataSources: 'Memory-based Manager',
          content: 'Database Tables (contents, cards)',
          activities: 'Database Tables (user_activities, etc.)'
        }
      },
      recommendations
    })

  } catch (error) {
    console.error('❌ 数据库状态检查失败:', error)
    
    return NextResponse.json({
      success: false,
      status: 'error',
      error: '数据库状态检查失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
      recommendations: [
        {
          type: 'error',
          message: '状态检查失败',
          action: '请检查服务器日志获取详细信息'
        }
      ]
    }, { status: 500 })
  }
}
