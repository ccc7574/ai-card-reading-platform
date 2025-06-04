-- 简化的基础表结构
-- 创建时间: 2024-01-31
-- 注意：所有业务逻辑都在Agent系统中处理，数据库只存储数据

-- 说明：我们实际上不需要这些表，因为：
-- 1. users表 - 使用Supabase auth.users + user_profiles扩展
-- 2. data_sources表 - 使用内存数据源管理器

-- 但如果将来需要持久化数据源配置，可以使用以下简化表结构：

-- 数据源配置表（可选，当前使用内存管理器）
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- rss, api, scraper, manual
    url VARCHAR(1000),
    config JSONB DEFAULT '{}', -- 所有配置参数
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, error
    is_enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 基础索引（仅必要的）
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);
CREATE INDEX IF NOT EXISTS idx_data_sources_enabled ON data_sources(is_enabled);

-- 简单的更新时间触发器（如果需要）
-- 注意：这个触发器依赖于update_updated_at_column函数，如果没有则跳过
-- CREATE TRIGGER IF NOT EXISTS update_data_sources_updated_at
--     BEFORE UPDATE ON data_sources
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 注意：
-- 1. 不插入默认数据，由数据源管理器处理
-- 2. 不创建任何SQL函数，所有逻辑在Agent中
-- 3. 保持数据库结构简单，只存储数据
