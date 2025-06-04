# 数据库部署指南

## 🎯 概述

本指南将帮助您在Supabase中部署AI卡片阅读平台的数据库架构。

## 📋 前置条件

1. **Supabase账户** - 在 [supabase.com](https://supabase.com) 注册
2. **项目创建** - 创建一个新的Supabase项目
3. **环境变量** - 获取项目的URL和API密钥

## 🚀 部署步骤

### 第一步：获取Supabase凭据

1. 登录Supabase控制台
2. 选择您的项目
3. 进入 `Settings` > `API`
4. 复制以下信息：
   - `Project URL`
   - `anon/public key`
   - `service_role key` (可选，用于管理操作)

### 第二步：更新环境变量

在 `.env.local` 文件中更新：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 第三步：执行SQL脚本

在Supabase控制台的SQL编辑器中，按顺序执行以下文件：

#### 1. 创建表结构
```sql
-- 复制并执行 database/01_create_tables.sql 的内容
```

#### 2. 设置行级安全策略
```sql
-- 复制并执行 database/02_rls_policies.sql 的内容
```

#### 3. 创建数据库函数
```sql
-- 复制并执行 database/04_functions.sql 的内容
```

#### 4. 插入种子数据
```sql
-- 复制并执行 database/03_seed_data.sql 的内容
```

## 🔧 自动化部署 (可选)

如果您有service role key，可以使用自动化脚本：

```bash
# 安装依赖
npm install @supabase/supabase-js

# 运行部署脚本
node scripts/deploy-database.js
```

## ✅ 验证部署

部署完成后，验证以下表是否创建成功：

### 核心表
- ✅ `users` - 用户信息
- ✅ `cards` - 卡片数据
- ✅ `data_sources` - 数据源配置
- ✅ `user_preferences` - 用户偏好设置

### 功能表
- ✅ `card_interactions` - 卡片交互记录
- ✅ `user_achievements` - 用户成就
- ✅ `reading_sessions` - 阅读会话
- ✅ `content_analysis` - 内容分析结果

### 系统表
- ✅ `ai_generation_logs` - AI生成日志
- ✅ `data_source_status` - 数据源状态
- ✅ `system_metrics` - 系统指标

## 🔍 测试连接

在应用中测试数据库连接：

```javascript
// 测试代码
import { supabase } from '@/lib/supabase'

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1)
    
  if (error) {
    console.error('数据库连接失败:', error)
  } else {
    console.log('数据库连接成功!')
  }
}
```

## 🛠️ 故障排除

### 常见问题

1. **权限错误**
   - 确保使用正确的API密钥
   - 检查RLS策略是否正确设置

2. **表不存在**
   - 确认SQL脚本执行顺序正确
   - 检查是否有语法错误

3. **连接超时**
   - 检查网络连接
   - 验证Supabase项目状态

### 重置数据库

如果需要重新部署：

```sql
-- 删除所有表 (谨慎使用!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## 📊 数据库架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │    │     cards       │    │  data_sources   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (UUID)       │    │ id (UUID)       │    │ id (UUID)       │
│ email           │    │ title           │    │ name            │
│ name            │    │ summary         │    │ url             │
│ avatar_url      │    │ content         │    │ status          │
│ created_at      │    │ category        │    │ last_updated    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ card_interactions│
                    ├─────────────────┤
                    │ user_id         │
                    │ card_id         │
                    │ interaction_type│
                    │ created_at      │
                    └─────────────────┘
```

## 🎉 完成

数据库部署完成后，您的AI卡片阅读平台将具备：

- ✅ 完整的用户管理系统
- ✅ 卡片存储和管理
- ✅ 数据源配置和监控
- ✅ 用户行为分析
- ✅ 成就和游戏化系统
- ✅ 高级搜索和推荐功能

现在可以启动应用并开始使用完整的数据库功能！
