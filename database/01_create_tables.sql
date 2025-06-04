-- AI卡片阅读平台数据库表结构
-- 创建时间: 2024-01-31

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户基础表 (可选，用于与Agent系统集成)
-- 注意：这个表是可选的，主要用于需要独立于Supabase auth的场景
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

-- 2. 用户扩展表 (扩展Supabase auth.users或users表)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    user_id UUID REFERENCES users(id), -- 可选：关联到users表
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
    total_reading_time INTEGER DEFAULT 0, -- 分钟
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 分类表
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6', -- hex color
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 标签表
CREATE TABLE public.tags (
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

-- 5. 内容表 (数据源内容)
CREATE TABLE public.contents (
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
    difficulty VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
    reading_time INTEGER, -- 分钟
    quality_score DECIMAL(3,2) DEFAULT 0.0, -- 0.00-1.00
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

-- 5. 内容标签关联表
CREATE TABLE public.content_tags (
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

-- 6. AI生成卡片表
CREATE TABLE public.cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    deep_content JSONB, -- AI生成的深度内容
    source_url VARCHAR(1000),
    source_content_id UUID REFERENCES contents(id),
    image_url VARCHAR(1000),
    category_id UUID REFERENCES categories(id),
    difficulty VARCHAR(20) DEFAULT 'intermediate',
    reading_time INTEGER,
    ai_provider VARCHAR(20), -- openai, gemini
    generation_metadata JSONB, -- AI生成的元数据
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

-- 7. 卡片标签关联表
CREATE TABLE public.card_tags (
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, tag_id)
);

-- 8. 用户活动表
CREATE TABLE public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- view, like, bookmark, share, comment, generate
    target_type VARCHAR(20) NOT NULL, -- card, content
    target_id UUID NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 通知表
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- like, comment, share, bookmark, system, achievement
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    actor_id UUID REFERENCES auth.users(id), -- 触发通知的用户
    target_type VARCHAR(20), -- card, content, user
    target_id UUID,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 评论表
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- card, content
    target_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id), -- 回复评论
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 点赞表
CREATE TABLE public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- card, content, comment
    target_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- 12. 收藏表
CREATE TABLE public.bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- card, content
    target_id UUID NOT NULL,
    folder_name VARCHAR(100) DEFAULT 'default',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- 13. 分享表
CREATE TABLE public.shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- card, content
    target_id UUID NOT NULL,
    platform VARCHAR(50), -- twitter, facebook, linkedin, wechat, copy_link
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. 成就表
CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    category VARCHAR(50), -- reading, social, creation, exploration
    condition_type VARCHAR(50), -- count, streak, milestone
    condition_value INTEGER,
    condition_metadata JSONB,
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. 用户成就表
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 16. 用户偏好表
CREATE TABLE public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferred_categories UUID[] DEFAULT '{}',
    preferred_tags UUID[] DEFAULT '{}',
    preferred_difficulty VARCHAR(20)[] DEFAULT '{}',
    preferred_reading_time INTEGER[], -- [min, max] 分钟
    ai_provider_preference VARCHAR(20) DEFAULT 'gemini',
    content_language VARCHAR(10)[] DEFAULT '{"zh-CN"}',
    recommendation_settings JSONB DEFAULT '{}',
    search_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能

-- users表索引
CREATE INDEX idx_users_auth_user ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- user_profiles表索引
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- contents表索引
CREATE INDEX idx_contents_category ON contents(category_id);
CREATE INDEX idx_contents_source ON contents(source_name);
CREATE INDEX idx_contents_published ON contents(published_at DESC);
CREATE INDEX idx_contents_trending ON contents(trending_score DESC);
CREATE INDEX idx_contents_quality ON contents(quality_score DESC);

CREATE INDEX idx_cards_user ON cards(user_id);
CREATE INDEX idx_cards_category ON cards(category_id);
CREATE INDEX idx_cards_created ON cards(created_at DESC);
CREATE INDEX idx_cards_public ON cards(is_public);

CREATE INDEX idx_activities_user ON user_activities(user_id);
CREATE INDEX idx_activities_type ON user_activities(activity_type);
CREATE INDEX idx_activities_created ON user_activities(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_folder ON bookmarks(user_id, folder_name);

CREATE INDEX idx_shares_user ON shares(user_id);
CREATE INDEX idx_shares_target ON shares(target_type, target_id);