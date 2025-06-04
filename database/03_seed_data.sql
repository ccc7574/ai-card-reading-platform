-- 数据初始化脚本
-- 插入基础数据和示例数据

-- 1. 插入分类数据
INSERT INTO categories (id, name, slug, description, color, icon, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'AI技术', 'ai-technology', '人工智能相关技术和趋势', '#3b82f6', '🤖', 1),
('550e8400-e29b-41d4-a716-446655440002', '产品设计', 'product-design', '产品设计理念和最佳实践', '#10b981', '🎨', 2),
('550e8400-e29b-41d4-a716-446655440003', '商业洞察', 'business-insights', '商业模式和市场分析', '#f59e0b', '💼', 3),
('550e8400-e29b-41d4-a716-446655440004', '开发技术', 'development', '软件开发技术和工具', '#8b5cf6', '💻', 4),
('550e8400-e29b-41d4-a716-446655440005', '数据科学', 'data-science', '数据分析和机器学习', '#ef4444', '📊', 5),
('550e8400-e29b-41d4-a716-446655440006', '用户体验', 'user-experience', 'UX设计和用户研究', '#06b6d4', '👥', 6);

-- 2. 插入标签数据
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
('650e8400-e29b-41d4-a716-446655440010', '数据分析', 'data-analysis', '数据分析方法', '#ef4444', 43, false),
('650e8400-e29b-41d4-a716-446655440011', '创业', 'startup', '创业相关', '#f59e0b', 38, false),
('650e8400-e29b-41d4-a716-446655440012', '投资', 'investment', '投资理财', '#10b981', 29, false);

-- 3. 插入示例内容数据
INSERT INTO contents (id, title, summary, content, url, image_url, author, source_name, source_id, category_id, difficulty, reading_time, quality_score, trending_score, view_count, like_count, bookmark_count, share_count, published_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', 
'AI驱动的代码生成工具革命', 
'探索最新的AI代码生成技术，如何改变软件开发流程，提高开发效率和代码质量。',
'随着人工智能技术的快速发展，AI驱动的代码生成工具正在彻底改变软件开发的方式。从GitHub Copilot到ChatGPT，这些工具不仅能够理解开发者的意图，还能生成高质量的代码片段。本文深入分析了这一技术趋势对软件开发行业的影响，以及开发者如何适应这一变化。',
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
NOW() - INTERVAL '2 hours'),

('750e8400-e29b-41d4-a716-446655440002',
'2024年产品设计趋势预测',
'分析即将到来的产品设计趋势，为设计师提供前瞻性指导，包括AI辅助设计、可持续设计等。',
'2024年的产品设计将迎来重大变革。AI辅助设计工具的普及让设计师能够更快速地创建原型和迭代设计。同时，可持续设计理念也越来越受到重视，设计师需要考虑产品的环境影响。本文总结了2024年最值得关注的设计趋势。',
'https://example.com/design-trends-2024',
'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
'产品经理',
'Design Inspiration',
'design-001',
'550e8400-e29b-41d4-a716-446655440002',
'beginner',
6,
0.88,
78.3,
1234,
189,
67,
32,
NOW() - INTERVAL '4 hours'),

('750e8400-e29b-41d4-a716-446655440003',
'商业模式创新的五个关键要素',
'深入分析成功商业模式创新的核心要素，通过实际案例展示如何构建可持续的商业模式。',
'在快速变化的商业环境中，传统的商业模式正面临前所未有的挑战。本文通过分析多个成功案例，总结出商业模式创新的五个关键要素：价值主张创新、客户细分重新定义、渠道策略优化、收入模式多元化和成本结构优化。',
'https://example.com/business-model-innovation',
'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
'商业分析师',
'Business Insights',
'business-001',
'550e8400-e29b-41d4-a716-446655440003',
'advanced',
12,
0.95,
92.1,
2156,
298,
134,
67,
NOW() - INTERVAL '6 hours'),

('750e8400-e29b-41d4-a716-446655440004',
'Next.js 15新特性深度解析',
'全面解析Next.js 15的新特性，包括性能优化、开发体验改进和新的API设计。',
'Next.js 15带来了许多令人兴奋的新特性。Turbopack的稳定版本显著提升了开发和构建速度，新的App Router提供了更灵活的路由管理，Server Components的改进让服务端渲染更加高效。本文详细介绍了这些新特性的使用方法和最佳实践。',
'https://example.com/nextjs-15-features',
'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
'前端工程师',
'Hacker News',
'hn-001',
'550e8400-e29b-41d4-a716-446655440004',
'intermediate',
10,
0.90,
88.7,
1876,
267,
98,
54,
NOW() - INTERVAL '8 hours'),

('750e8400-e29b-41d4-a716-446655440005',
'数据驱动的用户体验优化策略',
'介绍如何通过数据分析来优化用户体验，提高产品的用户满意度和转化率。',
'在数字化时代，数据已成为优化用户体验的重要工具。通过用户行为分析、A/B测试、热力图分析等方法，我们可以深入了解用户需求，发现体验痛点，并制定有针对性的优化策略。本文分享了数据驱动UX优化的完整方法论。',
'https://example.com/data-driven-ux',
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
'UX研究员',
'Product Hunt',
'ph-001',
'550e8400-e29b-41d4-a716-446655440006',
'intermediate',
9,
0.87,
76.4,
1345,
198,
76,
38,
NOW() - INTERVAL '10 hours');

-- 4. 插入内容标签关联
INSERT INTO content_tags (content_id, tag_id) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001'), -- AI
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'), -- 机器学习
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004'), -- ChatGPT
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005'), -- 产品管理
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440006'), -- UI设计
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440011'), -- 创业
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440012'), -- 投资
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440007'), -- React
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440008'), -- Next.js
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440009'), -- TypeScript
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440010'), -- 数据分析
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440006'); -- UI设计

-- 5. 插入成就数据
INSERT INTO achievements (id, name, title, description, icon, rarity, category, condition_type, condition_value, points) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'first_read', '初次阅读', '完成第一次内容阅读', '📚', 'common', 'reading', 'count', 1, 10),
('850e8400-e29b-41d4-a716-446655440002', 'knowledge_explorer', '知识探索者', '累计阅读100篇文章', '🔍', 'rare', 'reading', 'count', 100, 100),
('850e8400-e29b-41d4-a716-446655440003', 'reading_streak_7', '连续阅读7天', '连续7天进行阅读', '🔥', 'rare', 'reading', 'streak', 7, 50),
('850e8400-e29b-41d4-a716-446655440004', 'reading_streak_30', '阅读达人', '连续30天进行阅读', '⭐', 'epic', 'reading', 'streak', 30, 200),
('850e8400-e29b-41d4-a716-446655440005', 'first_like', '初次点赞', '给内容点第一个赞', '❤️', 'common', 'social', 'count', 1, 5),
('850e8400-e29b-41d4-a716-446655440006', 'social_butterfly', '社交达人', '获得1000个点赞', '🦋', 'epic', 'social', 'count', 1000, 300),
('850e8400-e29b-41d4-a716-446655440007', 'first_card', '首张卡片', '创建第一张AI卡片', '🎴', 'common', 'creation', 'count', 1, 20),
('850e8400-e29b-41d4-a716-446655440008', 'card_master', '卡片大师', '创建100张AI卡片', '🏆', 'legendary', 'creation', 'count', 100, 500),
('850e8400-e29b-41d4-a716-446655440009', 'ai_expert', 'AI专家', '在AI技术分类中阅读50篇文章', '🤖', 'epic', 'exploration', 'count', 50, 150),
('850e8400-e29b-41d4-a716-446655440010', 'early_adopter', '早期用户', '注册成为平台前1000名用户', '🚀', 'legendary', 'milestone', 'count', 1000, 1000);

-- 6. 更新标签使用计数
UPDATE tags SET usage_count = (
    SELECT COUNT(*) FROM content_tags WHERE content_tags.tag_id = tags.id
) + (
    SELECT COUNT(*) FROM card_tags WHERE card_tags.tag_id = tags.id
);

-- 7. 创建一些示例用户资料 (这些会在用户注册时自动创建)
-- 注意：实际的用户ID会在用户注册时由Supabase Auth生成

-- 8. 创建函数来自动创建用户资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- 创建用户偏好
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    -- 给新用户第一个成就
    INSERT INTO public.user_achievements (user_id, achievement_id, progress, is_completed, completed_at)
    VALUES (
        NEW.id,
        '850e8400-e29b-41d4-a716-446655440001', -- 初次阅读成就ID (需要在用户第一次阅读时触发)
        0,
        false,
        NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 创建触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. 创建函数来更新统计数据
CREATE OR REPLACE FUNCTION update_content_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新内容统计
        IF NEW.target_type = 'content' THEN
            UPDATE contents SET
                view_count = CASE WHEN NEW.activity_type = 'view' THEN view_count + 1 ELSE view_count END,
                like_count = (SELECT COUNT(*) FROM likes WHERE target_type = 'content' AND target_id = NEW.target_id),
                bookmark_count = (SELECT COUNT(*) FROM bookmarks WHERE target_type = 'content' AND target_id = NEW.target_id),
                share_count = (SELECT COUNT(*) FROM shares WHERE target_type = 'content' AND target_id = NEW.target_id)
            WHERE id = NEW.target_id;
        END IF;
        
        -- 更新卡片统计
        IF NEW.target_type = 'card' THEN
            UPDATE cards SET
                view_count = CASE WHEN NEW.activity_type = 'view' THEN view_count + 1 ELSE view_count END,
                like_count = (SELECT COUNT(*) FROM likes WHERE target_type = 'card' AND target_id = NEW.target_id),
                bookmark_count = (SELECT COUNT(*) FROM bookmarks WHERE target_type = 'card' AND target_id = NEW.target_id),
                share_count = (SELECT COUNT(*) FROM shares WHERE target_type = 'card' AND target_id = NEW.target_id)
            WHERE id = NEW.target_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 11. 创建统计更新触发器
CREATE TRIGGER update_stats_on_activity
    AFTER INSERT OR DELETE ON user_activities
    FOR EACH ROW EXECUTE FUNCTION update_content_stats();

CREATE TRIGGER update_stats_on_like
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_content_stats();

CREATE TRIGGER update_stats_on_bookmark
    AFTER INSERT OR DELETE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_content_stats();

CREATE TRIGGER update_stats_on_share
    AFTER INSERT OR DELETE ON shares
    FOR EACH ROW EXECUTE FUNCTION update_content_stats();
