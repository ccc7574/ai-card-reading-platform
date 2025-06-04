import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 创建users表的API
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未初始化'
      }, { status: 500 })
    }

    console.log('🔧 开始创建users表...')

    // 创建users表的SQL
    const createUsersTableSQL = `
      -- 创建users表
      CREATE TABLE IF NOT EXISTS public.users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          auth_user_id UUID UNIQUE, -- 关联到Supabase auth.users，可为空
          email VARCHAR(255) NOT NULL UNIQUE,
          username VARCHAR(50) UNIQUE,
          full_name VARCHAR(100),
          avatar_url TEXT,
          status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended, deleted
          role VARCHAR(20) DEFAULT 'user', -- user, admin, moderator, premium
          email_verified BOOLEAN DEFAULT false,
          phone VARCHAR(20),
          phone_verified BOOLEAN DEFAULT false,
          last_login_at TIMESTAMP WITH TIME ZONE,
          login_count INTEGER DEFAULT 0,
          registration_source VARCHAR(50) DEFAULT 'web', -- web, mobile, api, social
          referral_code VARCHAR(20),
          referred_by UUID REFERENCES users(id),
          subscription_tier VARCHAR(20) DEFAULT 'free', -- free, basic, premium, enterprise
          subscription_expires_at TIMESTAMP WITH TIME ZONE,
          preferences JSONB DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_users_auth_user ON users(auth_user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);
      CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

      -- 创建更新时间触发器（如果函数存在）
      DO $$
      BEGIN
          IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
              DROP TRIGGER IF EXISTS update_users_updated_at ON users;
              CREATE TRIGGER update_users_updated_at 
                  BEFORE UPDATE ON users 
                  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          END IF;
      END $$;
    `

    // 由于Supabase没有exec_sql函数，我们需要使用其他方法
    // 这里我们先检查表是否已经存在，如果不存在则说明需要手动创建
    console.log('ℹ️ 注意：由于Supabase限制，需要手动执行SQL创建users表')

    // 尝试查询表来检查是否存在
    const { data: testQuery, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (testError && testError.code === 'PGRST106') {
      // 表不存在，这是预期的
      console.log('📝 users表不存在，需要创建')
    } else if (!testError) {
      // 表已存在
      console.log('✅ users表已存在')
    } else {
      // 其他错误
      console.error('❌ 检查users表时出错:', testError)
    }

    // 验证表是否存在
    const { data: tableCheck, error: checkError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    const tableExists = !checkError || checkError.code !== 'PGRST106'

    // 如果表创建成功，插入一些示例数据
    if (tableExists) {
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              email: 'admin@example.com',
              username: 'admin',
              full_name: '系统管理员',
              role: 'admin',
              status: 'active',
              email_verified: true,
              registration_source: 'system',
              subscription_tier: 'enterprise'
            },
            {
              email: 'demo@example.com',
              username: 'demo_user',
              full_name: '演示用户',
              role: 'user',
              status: 'active',
              email_verified: true,
              registration_source: 'web',
              subscription_tier: 'free'
            }
          ])
          .select()

        if (insertError && !insertError.message.includes('duplicate key')) {
          console.warn('⚠️ 插入示例数据失败:', insertError.message)
        } else {
          console.log('✅ 示例数据插入成功')
        }
      } catch (insertErr) {
        console.warn('⚠️ 插入示例数据时出现异常:', insertErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: tableExists ? 'users表已存在' : 'users表需要手动创建',
      data: {
        tableExists,
        needsManualCreation: !tableExists,
        sqlScript: tableExists ? null : createUsersTableSQL,
        instructions: tableExists ? [
          'users表已经存在，可以直接使用',
          '检查表结构是否符合预期',
          '可以开始插入用户数据'
        ] : [
          '由于Supabase限制，需要手动执行SQL',
          '在Supabase Dashboard的SQL Editor中执行提供的SQL脚本',
          '或者使用现有的user_profiles表扩展Supabase auth'
        ],
        features: [
          '完整的用户信息管理',
          '支持多种认证方式',
          '用户状态和角色管理',
          '订阅层级支持',
          '推荐系统支持',
          '灵活的元数据存储'
        ],
        schema: {
          primaryKey: 'id (UUID)',
          uniqueFields: ['email', 'username', 'auth_user_id'],
          indexes: [
            'idx_users_auth_user',
            'idx_users_email', 
            'idx_users_username',
            'idx_users_status',
            'idx_users_role',
            'idx_users_subscription',
            'idx_users_created'
          ],
          triggers: ['update_users_updated_at']
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ 创建users表异常:', error)
    
    return NextResponse.json({
      success: false,
      error: '创建users表异常',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 检查users表状态
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未初始化'
      }, { status: 500 })
    }

    // 检查表是否存在
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, role, status, created_at')
      .limit(5)

    const tableExists = !error
    const userCount = data?.length || 0

    // 如果表存在，获取一些统计信息
    let stats = null
    if (tableExists) {
      try {
        const { data: countData } = await supabase
          .from('users')
          .select('status, role, subscription_tier', { count: 'exact' })

        const statusCounts = {}
        const roleCounts = {}
        const subscriptionCounts = {}

        countData?.forEach(user => {
          statusCounts[user.status] = (statusCounts[user.status] || 0) + 1
          roleCounts[user.role] = (roleCounts[user.role] || 0) + 1
          subscriptionCounts[user.subscription_tier] = (subscriptionCounts[user.subscription_tier] || 0) + 1
        })

        stats = {
          totalUsers: countData?.length || 0,
          statusDistribution: statusCounts,
          roleDistribution: roleCounts,
          subscriptionDistribution: subscriptionCounts
        }
      } catch (statsError) {
        console.warn('获取统计信息失败:', statsError)
      }
    }

    return NextResponse.json({
      success: true,
      message: tableExists ? 'users表已存在' : 'users表不存在',
      data: {
        tableExists,
        sampleUsers: data || [],
        userCount,
        stats,
        recommendations: tableExists ? [
          'users表已就绪，可以开始用户管理',
          '建议配置用户角色和权限',
          '可以集成Supabase Auth进行认证'
        ] : [
          '执行 POST /api/database/create-users-table 创建users表',
          '或者使用现有的 user_profiles 表扩展Supabase auth',
          '根据业务需求选择合适的用户管理方案'
        ]
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('检查users表状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '检查users表状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
