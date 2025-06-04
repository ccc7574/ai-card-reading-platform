#!/usr/bin/env node

/**
 * 数据库部署脚本
 * 将数据库架构部署到Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误: 请配置Supabase环境变量')
  console.error('需要: NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 读取SQL文件
function readSQLFile(filename) {
  const filePath = path.join(__dirname, '..', 'database', filename)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ SQL文件不存在: ${filename}`)
    return null
  }
  return fs.readFileSync(filePath, 'utf8')
}

// 执行SQL语句
async function executeSQLFile(filename, description) {
  console.log(`📄 执行 ${description}...`)
  
  const sql = readSQLFile(filename)
  if (!sql) {
    return false
  }

  try {
    // 将SQL分割成单独的语句
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
        if (error) {
          console.error(`❌ 执行SQL失败:`, error.message)
          console.error(`SQL: ${statement.substring(0, 100)}...`)
          return false
        }
      }
    }

    console.log(`✅ ${description} 完成`)
    return true
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message)
    return false
  }
}

// 检查数据库连接
async function checkConnection() {
  console.log('🔗 检查数据库连接...')
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)

    if (error) {
      console.error('❌ 数据库连接失败:', error.message)
      return false
    }

    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    return false
  }
}

// 主部署函数
async function deployDatabase() {
  console.log('🚀 开始部署数据库架构到Supabase...')
  console.log(`📍 目标: ${supabaseUrl}`)
  
  // 1. 检查连接
  if (!(await checkConnection())) {
    process.exit(1)
  }

  // 2. 创建表结构
  if (!(await executeSQLFile('01_create_tables.sql', '创建表结构'))) {
    process.exit(1)
  }

  // 3. 设置行级安全策略
  if (!(await executeSQLFile('02_rls_policies.sql', '设置行级安全策略'))) {
    console.warn('⚠️ 行级安全策略设置失败，继续执行...')
  }

  // 4. 创建数据库函数
  if (!(await executeSQLFile('04_functions.sql', '创建数据库函数'))) {
    console.warn('⚠️ 数据库函数创建失败，继续执行...')
  }

  // 5. 插入种子数据
  if (!(await executeSQLFile('03_seed_data.sql', '插入种子数据'))) {
    console.warn('⚠️ 种子数据插入失败，继续执行...')
  }

  console.log('🎉 数据库部署完成!')
  console.log('📊 数据库架构已成功部署到Supabase')
}

// 验证部署
async function verifyDeployment() {
  console.log('🔍 验证部署结果...')
  
  try {
    // 检查主要表是否存在
    const tables = ['users', 'cards', 'data_sources', 'user_preferences']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`❌ 表 ${table} 不存在或无法访问:`, error.message)
      } else {
        console.log(`✅ 表 ${table} 验证成功`)
      }
    }

    console.log('✅ 部署验证完成')
  } catch (error) {
    console.error('❌ 部署验证失败:', error.message)
  }
}

// 主程序
async function main() {
  try {
    await deployDatabase()
    await verifyDeployment()
  } catch (error) {
    console.error('❌ 部署过程中发生错误:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { deployDatabase, verifyDeployment }
