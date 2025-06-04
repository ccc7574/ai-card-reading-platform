import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

// 创建缺失的数据库表
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未初始化',
        details: '请检查环境变量配置'
      }, { status: 500 })
    }

    console.log('🔧 开始创建缺失的数据库表...')

    // 读取SQL文件
    const sqlFilePath = join(process.cwd(), 'database', '05_missing_tables.sql')
    let sqlContent: string

    try {
      sqlContent = readFileSync(sqlFilePath, 'utf-8')
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: '无法读取SQL文件',
        details: `文件路径: ${sqlFilePath}`,
        sqlError: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 })
    }

    // 分割SQL语句（按分号分割，但要处理函数定义中的分号）
    const sqlStatements = splitSqlStatements(sqlContent)
    
    console.log(`📝 准备执行 ${sqlStatements.length} 个SQL语句`)

    const results = []
    let successCount = 0
    let errorCount = 0

    // 逐个执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i].trim()
      
      if (!statement || statement.startsWith('--')) {
        continue // 跳过空语句和注释
      }

      try {
        console.log(`🔧 执行语句 ${i + 1}/${sqlStatements.length}`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        })

        if (error) {
          console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message)
          errorCount++
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: false,
            error: error.message
          })
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`)
          successCount++
          results.push({
            statement: statement.substring(0, 100) + '...',
            success: true,
            result: data
          })
        }
      } catch (err) {
        console.error(`❌ 语句 ${i + 1} 执行异常:`, err)
        errorCount++
        results.push({
          statement: statement.substring(0, 100) + '...',
          success: false,
          error: err instanceof Error ? err.message : '执行异常'
        })
      }
    }

    console.log(`🎉 SQL执行完成: ${successCount} 成功, ${errorCount} 失败`)

    // 检查表是否创建成功
    const tableCheckResults = await checkTablesExist(['users', 'data_sources'])

    return NextResponse.json({
      success: errorCount === 0,
      message: `数据库表创建完成: ${successCount} 成功, ${errorCount} 失败`,
      data: {
        execution: {
          totalStatements: sqlStatements.length,
          successCount,
          errorCount,
          results: results.slice(0, 10) // 只返回前10个结果
        },
        tableCheck: tableCheckResults,
        createdTables: Object.keys(tableCheckResults).filter(
          table => tableCheckResults[table].exists
        )
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ 创建数据库表失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '创建数据库表失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 获取缺失表的创建状态
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未初始化'
      }, { status: 500 })
    }

    // 检查缺失的表
    const missingTables = ['users', 'data_sources', 'data_source_items', 'data_source_stats']
    const tableStatus = await checkTablesExist(missingTables)

    const existingTables = Object.keys(tableStatus).filter(
      table => tableStatus[table].exists
    )
    const missingTablesList = Object.keys(tableStatus).filter(
      table => !tableStatus[table].exists
    )

    return NextResponse.json({
      success: true,
      message: '缺失表检查完成',
      data: {
        tables: tableStatus,
        summary: {
          total: missingTables.length,
          existing: existingTables.length,
          missing: missingTablesList.length
        },
        existingTables,
        missingTables: missingTablesList,
        recommendations: missingTablesList.length > 0 ? [
          '执行 POST /api/database/create-missing-tables 创建缺失的表',
          '确保有足够的数据库权限',
          '检查SQL脚本是否正确'
        ] : [
          '所有必要的表都已存在',
          '可以开始使用完整的数据库功能'
        ]
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('检查缺失表失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '检查缺失表失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 辅助函数：分割SQL语句
function splitSqlStatements(sqlContent: string): string[] {
  const statements = []
  let currentStatement = ''
  let inFunction = false
  let dollarQuoteTag = ''
  
  const lines = sqlContent.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 检查是否进入函数定义
    if (trimmedLine.includes('$$')) {
      if (!inFunction) {
        // 开始函数定义
        inFunction = true
        dollarQuoteTag = '$$'
      } else if (trimmedLine.includes(dollarQuoteTag)) {
        // 结束函数定义
        inFunction = false
        dollarQuoteTag = ''
      }
    }
    
    currentStatement += line + '\n'
    
    // 如果不在函数内且行以分号结尾，则认为是语句结束
    if (!inFunction && trimmedLine.endsWith(';')) {
      statements.push(currentStatement.trim())
      currentStatement = ''
    }
  }
  
  // 添加最后一个语句（如果有）
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim())
  }
  
  return statements.filter(stmt => stmt.length > 0)
}

// 辅助函数：检查表是否存在
async function checkTablesExist(tableNames: string[]): Promise<Record<string, any>> {
  const results = {}
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      results[tableName] = {
        exists: !error,
        error: error?.message || null
      }
    } catch (err) {
      results[tableName] = {
        exists: false,
        error: err instanceof Error ? err.message : '检查失败'
      }
    }
  }
  
  return results
}
