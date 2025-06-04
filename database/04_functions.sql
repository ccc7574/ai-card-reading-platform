-- 数据库函数已移除
-- 所有业务逻辑现在由Agent系统处理

-- 原有的SQL函数功能现在由以下Agent工作流替代：
-- 1. get_recommended_contents -> content-recommendation Agent工作流
-- 2. search_contents -> content-search Agent工作流
-- 3. get_user_stats -> user-analytics Agent工作流
-- 4. update_reading_streak -> user-engagement Agent工作流
-- 5. check_and_grant_achievements -> user-achievement Agent工作流
-- 6. get_trending_tags -> trend-analysis Agent工作流

-- 优势：
-- 1. 更智能的业务逻辑处理
-- 2. 动态适应用户需求
-- 3. 可解释的决策过程
-- 4. 实时优化和学习
-- 5. 更好的可维护性

-- 保留必要的索引以支持Agent查询
-- 这些索引帮助Agent系统更高效地查询数据

-- 所有SQL函数已移除，业务逻辑现在由Agent系统处理

-- 7. 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_contents_fts ON contents 
USING gin(to_tsvector('chinese', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')));

-- 8. 创建复合索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_contents_category_quality ON contents(category_id, quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_contents_trending_published ON contents(trending_score DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type_date ON user_activities(user_id, activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_user_public_created ON cards(user_id, is_public, created_at DESC);
