import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 测试数据库连接和表结构
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未初始化',
        details: '请检查环境变量配置',
        config: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置'
        },
        recommendations: [
          {
            type: 'error',
            message: '数据库未配置',
            action: '请在.env.local中配置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY'
          }
        ]
      }, { status: 500 })
    }

    console.log('🔍 开始测试数据库连接...')

    // 测试基本连接 - 尝试查询一个简单的表
    const { data: connectionTest, error: connectionError } = await supabase
      .from('auth.users')
      .select('count')
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: '数据库连接失败',
        details: connectionError.message
      }, { status: 500 })
    }

    console.log('✅ 数据库连接成功')

    // 测试核心表
    const coreTables = [
      'users',
      'cards', 
      'data_sources',
      'user_preferences',
      'card_interactions',
      'user_achievements'
    ]

    const tableStatus = {}
    const tableDetails = {}

    for (const table of coreTables) {
      try {
        // 测试表是否存在并可访问
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1)

        if (error) {
          tableStatus[table] = {
            exists: false,
            error: error.message,
            accessible: false
          }
        } else {
          tableStatus[table] = {
            exists: true,
            accessible: true,
            recordCount: count || 0,
            hasData: (count || 0) > 0
          }

          // 获取表结构信息
          const { data: columns } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', table)
            .eq('table_schema', 'public')

          tableDetails[table] = {
            columns: columns || [],
            columnCount: columns?.length || 0
          }
        }
      } catch (err) {
        tableStatus[table] = {
          exists: false,
          error: err instanceof Error ? err.message : '未知错误',
          accessible: false
        }
      }
    }

    // 统计结果
    const existingTables = Object.keys(tableStatus).filter(
      table => tableStatus[table].exists
    )
    const accessibleTables = Object.keys(tableStatus).filter(
      table => tableStatus[table].accessible
    )
    const tablesWithData = Object.keys(tableStatus).filter(
      table => tableStatus[table].hasData
    )

    // 测试RLS策略
    let rlsStatus = 'unknown'
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (rlsError && rlsError.message.includes('RLS')) {
        rlsStatus = 'enabled'
      } else if (!rlsError) {
        rlsStatus = 'disabled_or_permissive'
      } else {
        rlsStatus = 'error'
      }
    } catch (err) {
      rlsStatus = 'error'
    }

    // 测试数据库函数
    const functions = [
      'search_cards',
      'get_user_recommendations', 
      'update_user_stats'
    ]

    const functionStatus = {}
    for (const func of functions) {
      try {
        // 尝试调用函数（可能会失败，但能检测是否存在）
        const { error } = await supabase.rpc(func, {})
        functionStatus[func] = {
          exists: true,
          callable: !error || !error.message.includes('does not exist')
        }
      } catch (err) {
        functionStatus[func] = {
          exists: false,
          callable: false
        }
      }
    }

    const deploymentStatus = {
      overall: existingTables.length === coreTables.length ? 'complete' : 'partial',
      tablesDeployed: `${existingTables.length}/${coreTables.length}`,
      allTablesAccessible: accessibleTables.length === existingTables.length,
      hasData: tablesWithData.length > 0,
      rlsEnabled: rlsStatus === 'enabled'
    }

    console.log('✅ 数据库测试完成')

    return NextResponse.json({
      success: true,
      message: '数据库连接测试完成',
      timestamp: new Date().toISOString(),
      connection: {
        status: 'connected',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/.*/, '/***') || 'not_configured'
      },
      deployment: deploymentStatus,
      tables: {
        status: tableStatus,
        details: tableDetails,
        summary: {
          total: coreTables.length,
          existing: existingTables.length,
          accessible: accessibleTables.length,
          withData: tablesWithData.length
        }
      },
      security: {
        rls: rlsStatus,
        authEnabled: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      functions: {
        status: functionStatus,
        summary: {
          total: functions.length,
          existing: Object.values(functionStatus).filter(f => f.exists).length,
          callable: Object.values(functionStatus).filter(f => f.callable).length
        }
      },
      recommendations: generateRecommendations(deploymentStatus, tableStatus, rlsStatus)
    })

  } catch (error) {
    console.error('❌ 数据库测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '数据库测试失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 生成部署建议
function generateRecommendations(deploymentStatus: any, tableStatus: any, rlsStatus: string) {
  const recommendations = []

  if (deploymentStatus.overall === 'partial') {
    recommendations.push({
      type: 'warning',
      message: '数据库部署不完整',
      action: '请执行完整的数据库部署脚本'
    })
  }

  if (!deploymentStatus.allTablesAccessible) {
    recommendations.push({
      type: 'error', 
      message: '部分表无法访问',
      action: '检查数据库权限和RLS策略'
    })
  }

  if (rlsStatus === 'disabled_or_permissive') {
    recommendations.push({
      type: 'security',
      message: 'RLS策略可能未启用',
      action: '为生产环境启用行级安全策略'
    })
  }

  if (!deploymentStatus.hasData) {
    recommendations.push({
      type: 'info',
      message: '数据库为空',
      action: '考虑插入种子数据进行测试'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: '数据库配置良好',
      action: '可以开始使用完整功能'
    })
  }

  return recommendations
}
