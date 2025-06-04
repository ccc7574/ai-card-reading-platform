-- AI卡片阅读平台 - 完整数据库设置脚本
-- 执行顺序：表结构 -> RLS策略 -> 初始数据 -> 函数和索引

-- ============================================================================
-- 1. 创建表结构
-- ============================================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户扩展表
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    website VARCHAR(255),
    location VARCHAR(100),
    birth_date DATE,
    theme_preference VARCHAR(20) DEFAULT 'light',
    language_preference VARCHAR(10) DEFAULT 'zh-CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT false,
    profile_public BOOLEAN DEFAULT true,
    show_stats BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT false,
    reading_streak INTEGER DEFAULT 0,
    total_reading_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 分类表
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 标签表
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6b7280',
    usage_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 内容表
CREATE TABLE IF NOT EXISTS public.contents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    url VARCHAR(1000),
    image_url VARCHAR(1000),
    author VARCHAR(100),
    source_name VARCHAR(100) NOT NULL,
    source_id VARCHAR(100),
    category_id UUID REFERENCES categories(id),
    difficulty VARCHAR(20) DEFAULT 'intermediate',
    reading_time INTEGER,
    quality_score DECIMAL(3,2) DEFAULT 0.0,
    trending_score DECIMAL(5,2) DEFAULT 0.0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 其他表（简化版本，完整版本请参考01_create_tables.sql）
CREATE TABLE IF NOT EXISTS public.content_tags (
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    deep_content JSONB,
    source_url VARCHAR(1000),
    source_content_id UUID REFERENCES contents(id),
    image_url VARCHAR(1000),
    category_id UUID REFERENCES categories(id),
    difficulty VARCHAR(20) DEFAULT 'intermediate',
    reading_time INTEGER,
    ai_provider VARCHAR(20),
    generation_metadata JSONB,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. 启用RLS并创建策略
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- 基本RLS策略
CREATE POLICY IF NOT EXISTS "用户可以查看公开的用户资料" ON user_profiles
    FOR SELECT USING (profile_public = true OR auth.uid() = id);

CREATE POLICY IF NOT EXISTS "用户可以更新自己的资料" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "用户可以插入自己的资料" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "所有人可以查看公开卡片" ON cards
    FOR SELECT USING (is_public = true);

CREATE POLICY IF NOT EXISTS "用户可以查看自己的所有卡片" ON cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "用户可以创建卡片" ON cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 公共表策略
CREATE POLICY IF NOT EXISTS "所有人可以查看分类" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "所有人可以查看标签" ON tags
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "所有人可以查看内容" ON contents
    FOR SELECT USING (is_active = true);

-- ============================================================================
-- 3. 插入初始数据
-- ============================================================================

-- 插入分类数据
INSERT INTO categories (id, name, slug, description, color, icon, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'AI技术', 'ai-technology', '人工智能相关技术和趋势', '#3b82f6', '🤖', 1),
('550e8400-e29b-41d4-a716-446655440002', '产品设计', 'product-design', '产品设计理念和最佳实践', '#10b981', '🎨', 2),
('550e8400-e29b-41d4-a716-446655440003', '商业洞察', 'business-insights', '商业模式和市场分析', '#f59e0b', '💼', 3),
('550e8400-e29b-41d4-a716-446655440004', '开发技术', 'development', '软件开发技术和工具', '#8b5cf6', '💻', 4),
('550e8400-e29b-41d4-a716-446655440005', '数据科学', 'data-science', '数据分析和机器学习', '#ef4444', '📊', 5),
('550e8400-e29b-41d4-a716-446655440006', '用户体验', 'user-experience', 'UX设计和用户研究', '#06b6d4', '👥', 6)
ON CONFLICT (id) DO NOTHING;

-- 插入标签数据
INSERT INTO tags (id, name, slug, description, color, usage_count, is_trending) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'AI', 'ai', '人工智能', '#3b82f6', 156, true),
('650e8400-e29b-41d4-a716-446655440002', '机器学习', 'machine-learning', '机器学习技术', '#3b82f6', 134, true),
('650e8400-e29b-41d4-a716-446655440003', '深度学习', 'deep-learning', '深度学习算法', '#3b82f6', 98, true),
('650e8400-e29b-41d4-a716-446655440004', 'ChatGPT', 'chatgpt', 'OpenAI ChatGPT', '#10b981', 87, true),
('650e8400-e29b-41d4-a716-446655440005', '产品管理', 'product-management', '产品管理方法', '#f59e0b', 76, false),
('650e8400-e29b-41d4-a716-446655440006', 'UI设计', 'ui-design', '用户界面设计', '#8b5cf6', 65, false),
('650e8400-e29b-41d4-a716-446655440007', 'React', 'react', 'React框架', '#06b6d4', 89, true),
('650e8400-e29b-41d4-a716-446655440008', 'Next.js', 'nextjs', 'Next.js框架', '#000000', 54, true),
('650e8400-e29b-41d4-a716-446655440009', 'TypeScript', 'typescript', 'TypeScript语言', '#3178c6', 67, false),
('650e8400-e29b-41d4-a716-446655440010', '数据分析', 'data-analysis', '数据分析方法', '#ef4444', 43, false)
ON CONFLICT (id) DO NOTHING;

-- 插入示例内容
INSERT INTO contents (id, title, summary, content, url, image_url, author, source_name, source_id, category_id, difficulty, reading_time, quality_score, trending_score, view_count, like_count, bookmark_count, share_count, published_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', 
'AI驱动的代码生成工具革命', 
'探索最新的AI代码生成技术，如何改变软件开发流程，提高开发效率和代码质量。',
'随着人工智能技术的快速发展，AI驱动的代码生成工具正在彻底改变软件开发的方式。从GitHub Copilot到ChatGPT，这些工具不仅能够理解开发者的意图，还能生成高质量的代码片段。',
'https://example.com/ai-code-generation',
'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
'AI专家',
'AI News',
'ai-news-001',
'550e8400-e29b-41d4-a716-446655440001',
'intermediate',
8,
0.92,
85.5,
1567,
234,
89,
45,
NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. 创建函数和触发器
-- ============================================================================

-- 自动创建用户资料函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加更新时间触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. 创建索引
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category_id);
CREATE INDEX IF NOT EXISTS idx_contents_source ON contents(source_name);
CREATE INDEX IF NOT EXISTS idx_contents_published ON contents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_trending ON contents(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_contents_quality ON contents(quality_score DESC);

CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category_id);
CREATE INDEX IF NOT EXISTS idx_cards_created ON cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_public ON cards(is_public);

-- ============================================================================
-- 完成
-- ============================================================================

-- 验证设置
DO $$
BEGIN
    RAISE NOTICE '数据库设置完成！';
    RAISE NOTICE '分类数量: %', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE '标签数量: %', (SELECT COUNT(*) FROM tags);
    RAISE NOTICE '内容数量: %', (SELECT COUNT(*) FROM contents);
END $$;
