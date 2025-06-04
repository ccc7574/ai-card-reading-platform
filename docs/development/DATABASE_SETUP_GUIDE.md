# 🗄️ AI卡片阅读平台 - 数据库设置指南

## 📋 概述

本指南将帮助您为AI卡片阅读平台设置完整的Supabase数据库，包括表结构、安全策略、初始数据和函数。

## 🚀 快速开始

### 1. 创建Supabase项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目URL和API密钥

### 2. 更新环境变量

更新 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### 3. 执行数据库脚本

在Supabase SQL编辑器中按顺序执行以下脚本：

#### 方法一：一键设置（推荐）
```sql
-- 复制并执行 database/setup_database.sql 的全部内容
```

#### 方法二：分步设置
```sql
-- 1. 创建表结构
-- 复制并执行 database/01_create_tables.sql

-- 2. 设置安全策略
-- 复制并执行 database/02_rls_policies.sql

-- 3. 插入初始数据
-- 复制并执行 database/03_seed_data.sql

-- 4. 创建函数和索引
-- 复制并执行 database/04_functions.sql
```

## 📊 数据库架构

### 核心表结构

#### 1. 用户相关表
- **user_profiles** - 用户扩展信息
- **user_preferences** - 用户偏好设置
- **user_activities** - 用户活动记录
- **user_achievements** - 用户成就

#### 2. 内容相关表
- **contents** - 数据源内容
- **categories** - 内容分类
- **tags** - 标签系统
- **content_tags** - 内容标签关联

#### 3. AI卡片相关表
- **cards** - AI生成的卡片
- **card_tags** - 卡片标签关联

#### 4. 交互相关表
- **likes** - 点赞记录
- **bookmarks** - 收藏记录
- **shares** - 分享记录
- **comments** - 评论系统

#### 5. 系统相关表
- **notifications** - 通知系统
- **achievements** - 成就定义

### 关键功能

#### 1. 行级安全 (RLS)
- 用户只能访问自己的私有数据
- 公开内容对所有用户可见
- 管理员权限控制

#### 2. 自动触发器
- 新用户注册时自动创建用户资料
- 更新时间自动维护
- 统计数据自动更新

#### 3. 高级函数
- **get_recommended_contents()** - 个性化推荐
- **search_contents()** - 全文搜索
- **get_user_stats()** - 用户统计
- **update_reading_streak()** - 阅读连续天数
- **check_and_grant_achievements()** - 成就系统

## 🔧 配置说明

### 环境变量配置

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI服务配置
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_DEFAULT_AI_PROVIDER=gemini
```

### 数据库配置验证

执行以下查询验证设置：

```sql
-- 检查表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 检查初始数据
SELECT 'categories' as table_name, count(*) as count FROM categories
UNION ALL
SELECT 'tags', count(*) FROM tags
UNION ALL
SELECT 'contents', count(*) FROM contents;

-- 检查RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📈 数据初始化

### 预置数据

数据库将自动创建以下初始数据：

#### 分类 (6个)
- AI技术 🤖
- 产品设计 🎨
- 商业洞察 💼
- 开发技术 💻
- 数据科学 📊
- 用户体验 👥

#### 标签 (12个)
- AI、机器学习、深度学习
- ChatGPT、产品管理、UI设计
- React、Next.js、TypeScript
- 数据分析、创业、投资

#### 示例内容 (5篇)
- AI驱动的代码生成工具革命
- 2024年产品设计趋势预测
- 商业模式创新的五个关键要素
- Next.js 15新特性深度解析
- 数据驱动的用户体验优化策略

#### 成就系统 (10个)
- 从初次阅读到卡片大师
- 不同稀有度：普通、稀有、史诗、传说

## 🔒 安全配置

### RLS策略概述

1. **用户资料** - 用户只能查看公开资料或自己的资料
2. **卡片** - 公开卡片所有人可见，私有卡片仅创建者可见
3. **活动记录** - 用户只能查看自己的活动
4. **通知** - 用户只能查看自己的通知
5. **评论** - 所有人可查看，仅创建者可修改
6. **互动** - 点赞、收藏、分享记录有相应权限控制

### 数据库函数权限

- 推荐算法函数：所有认证用户可调用
- 搜索函数：所有用户可调用
- 统计函数：仅用户自己的数据
- 成就系统：系统自动触发

## 🚨 故障排除

### 常见问题

#### 1. 连接失败
```
Error: Invalid API key
```
**解决方案**：检查 `.env.local` 中的 Supabase URL 和 API 密钥

#### 2. 权限错误
```
Error: Row Level Security policy violation
```
**解决方案**：确保 RLS 策略已正确设置

#### 3. 函数调用失败
```
Error: Function not found
```
**解决方案**：确保已执行 `04_functions.sql` 脚本

#### 4. 触发器错误
```
Error: Trigger function does not exist
```
**解决方案**：按顺序重新执行所有脚本

### 重置数据库

如需重置数据库：

```sql
-- 警告：这将删除所有数据！
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 然后重新执行设置脚本
```

## 📚 API使用示例

### 获取推荐内容

```typescript
const { data, error } = await supabase
  .rpc('get_recommended_contents', {
    user_id_param: userId,
    limit_param: 10
  })
```

### 搜索内容

```typescript
const { data, error } = await supabase
  .rpc('search_contents', {
    search_query: '人工智能',
    category_ids: [categoryId],
    sort_by: 'relevance'
  })
```

### 获取用户统计

```typescript
const { data, error } = await supabase
  .rpc('get_user_stats', {
    user_id_param: userId
  })
```

## 🎯 下一步

1. **测试连接** - 确保应用能正常连接数据库
2. **创建测试用户** - 注册测试账号验证功能
3. **导入真实数据** - 替换示例数据为真实内容
4. **性能优化** - 根据使用情况调整索引
5. **监控设置** - 配置数据库监控和告警

## 📞 支持

如果遇到问题：

1. 检查 Supabase 项目日志
2. 验证环境变量配置
3. 确认数据库脚本执行顺序
4. 查看应用控制台错误信息

---

**🎉 数据库设置完成后，您的AI卡片阅读平台就可以正常运行了！**
