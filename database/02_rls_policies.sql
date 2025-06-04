-- Row Level Security (RLS) 策略
-- 确保数据安全和用户隐私

-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 用户资料策略
CREATE POLICY "用户可以查看公开的用户资料" ON user_profiles
    FOR SELECT USING (profile_public = true OR auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 卡片策略
CREATE POLICY "所有人可以查看公开卡片" ON cards
    FOR SELECT USING (is_public = true);

CREATE POLICY "用户可以查看自己的所有卡片" ON cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建卡片" ON cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的卡片" ON cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的卡片" ON cards
    FOR DELETE USING (auth.uid() = user_id);

-- 用户活动策略
CREATE POLICY "用户可以查看自己的活动" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建活动记录" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 通知策略
CREATE POLICY "用户可以查看自己的通知" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的通知" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 评论策略
CREATE POLICY "所有人可以查看评论" ON comments
    FOR SELECT USING (NOT is_deleted);

CREATE POLICY "认证用户可以创建评论" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的评论" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的评论" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- 点赞策略
CREATE POLICY "所有人可以查看点赞" ON likes
    FOR SELECT USING (true);

CREATE POLICY "认证用户可以点赞" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以取消自己的点赞" ON likes
    FOR DELETE USING (auth.uid() = user_id);

-- 收藏策略
CREATE POLICY "用户可以查看自己的收藏" ON bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建收藏" ON bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的收藏" ON bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的收藏" ON bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- 分享策略
CREATE POLICY "用户可以查看自己的分享记录" ON shares
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建分享记录" ON shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户成就策略
CREATE POLICY "用户可以查看自己的成就" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "系统可以更新用户成就" ON user_achievements
    FOR ALL USING (true); -- 这里需要服务端角色

-- 用户偏好策略
CREATE POLICY "用户可以查看自己的偏好" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的偏好" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 公共表策略 (categories, tags, contents, achievements)
CREATE POLICY "所有人可以查看分类" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "所有人可以查看标签" ON tags
    FOR SELECT USING (true);

CREATE POLICY "所有人可以查看内容" ON contents
    FOR SELECT USING (is_active = true);

CREATE POLICY "所有人可以查看成就" ON achievements
    FOR SELECT USING (is_active = true);

-- 内容标签关联表策略
CREATE POLICY "所有人可以查看内容标签关联" ON content_tags
    FOR SELECT USING (true);

-- 卡片标签关联表策略
CREATE POLICY "所有人可以查看公开卡片的标签" ON card_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cards 
            WHERE cards.id = card_tags.card_id 
            AND (cards.is_public = true OR cards.user_id = auth.uid())
        )
    );

CREATE POLICY "用户可以管理自己卡片的标签" ON card_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cards 
            WHERE cards.id = card_tags.card_id 
            AND cards.user_id = auth.uid()
        )
    );
