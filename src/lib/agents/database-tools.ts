// Agent数据库操作工具
// 替代SQL函数，为Agent提供数据库查询能力

import { supabase } from '@/lib/supabase'

export class AgentDatabaseTools {
  
  // 获取推荐内容的原始数据（供推荐Agent使用）
  static async getContentsForRecommendation(userId?: string, limit: number = 50): Promise<any[]> {
    try {
      let query = supabase
        .from('contents')
        .select(`
          id,
          title,
          summary,
          content,
          image_url,
          author,
          source_name,
          difficulty,
          reading_time,
          quality_score,
          trending_score,
          view_count,
          like_count,
          bookmark_count,
          published_at,
          category_id,
          categories(name),
          content_tags(tags(name))
        `)
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('获取推荐内容数据失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取推荐内容数据异常:', error)
      return []
    }
  }

  // 获取用户偏好数据（供推荐Agent使用）
  static async getUserPreferences(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('获取用户偏好失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取用户偏好异常:', error)
      return null
    }
  }

  // 获取用户活动数据（供分析Agent使用）
  static async getUserActivities(userId: string, limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('获取用户活动数据失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取用户活动数据异常:', error)
      return []
    }
  }

  // 搜索内容（供搜索Agent使用）
  static async searchContents(searchQuery: string, filters: any = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('contents')
        .select(`
          id,
          title,
          summary,
          content,
          image_url,
          author,
          source_name,
          difficulty,
          reading_time,
          quality_score,
          view_count,
          like_count,
          published_at,
          categories(name),
          content_tags(tags(name))
        `)
        .eq('is_active', true)

      // 应用过滤器
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        query = query.in('category_id', filters.categoryIds)
      }

      if (filters.difficultyLevels && filters.difficultyLevels.length > 0) {
        query = query.in('difficulty', filters.difficultyLevels)
      }

      if (filters.minReadingTime) {
        query = query.gte('reading_time', filters.minReadingTime)
      }

      if (filters.maxReadingTime) {
        query = query.lte('reading_time', filters.maxReadingTime)
      }

      // 文本搜索（简化版）
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      // 排序
      const sortBy = filters.sortBy || 'relevance'
      switch (sortBy) {
        case 'date':
          query = query.order('published_at', { ascending: false })
          break
        case 'popularity':
          query = query.order('view_count', { ascending: false })
          break
        case 'quality':
          query = query.order('quality_score', { ascending: false })
          break
        default:
          query = query.order('published_at', { ascending: false })
      }

      query = query.limit(filters.limit || 20)

      const { data, error } = await query

      if (error) {
        console.error('搜索内容失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('搜索内容异常:', error)
      return []
    }
  }

  // 获取用户统计数据（供分析Agent使用）
  static async getUserStats(userId: string): Promise<any> {
    try {
      // 并行查询多个统计数据
      const [
        activitiesResult,
        likesResult,
        bookmarksResult,
        sharesResult,
        cardsResult,
        profileResult,
        achievementsResult
      ] = await Promise.all([
        supabase.from('user_activities').select('activity_type').eq('user_id', userId),
        supabase.from('likes').select('id').eq('user_id', userId),
        supabase.from('bookmarks').select('id').eq('user_id', userId),
        supabase.from('shares').select('id').eq('user_id', userId),
        supabase.from('cards').select('id').eq('user_id', userId),
        supabase.from('user_profiles').select('reading_streak, total_reading_time').eq('id', userId).single(),
        supabase.from('user_achievements').select('id').eq('user_id', userId).eq('is_completed', true)
      ])

      const activities = activitiesResult.data || []
      const viewCount = activities.filter(a => a.activity_type === 'view').length

      return {
        totalViews: viewCount,
        totalLikes: likesResult.data?.length || 0,
        totalBookmarks: bookmarksResult.data?.length || 0,
        totalShares: sharesResult.data?.length || 0,
        totalCards: cardsResult.data?.length || 0,
        readingStreak: profileResult.data?.reading_streak || 0,
        totalReadingTime: profileResult.data?.total_reading_time || 0,
        achievementsCount: achievementsResult.data?.length || 0
      }
    } catch (error) {
      console.error('获取用户统计数据异常:', error)
      return {
        totalViews: 0,
        totalLikes: 0,
        totalBookmarks: 0,
        totalShares: 0,
        totalCards: 0,
        readingStreak: 0,
        totalReadingTime: 0,
        achievementsCount: 0
      }
    }
  }

  // 获取成就数据（供成就Agent使用）
  static async getAchievements(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('获取成就数据失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取成就数据异常:', error)
      return []
    }
  }

  // 获取用户成就进度（供成就Agent使用）
  static async getUserAchievements(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements(*)
        `)
        .eq('user_id', userId)

      if (error) {
        console.error('获取用户成就进度失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取用户成就进度异常:', error)
      return []
    }
  }

  // 获取热门标签数据（供趋势Agent使用）
  static async getTrendingTags(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('获取热门标签失败:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('获取热门标签异常:', error)
      return []
    }
  }

  // 更新用户阅读连续性（供参与度Agent使用）
  static async updateReadingStreak(userId: string): Promise<number> {
    try {
      // 获取用户今天是否有阅读活动
      const today = new Date().toISOString().split('T')[0]
      const { data: todayActivity } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_type', 'view')
        .gte('created_at', today)
        .limit(1)

      if (!todayActivity || todayActivity.length === 0) {
        // 今天还没有阅读活动，不更新连续性
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('reading_streak')
          .eq('id', userId)
          .single()

        return profile?.reading_streak || 0
      }

      // 检查昨天是否有阅读活动
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const { data: yesterdayActivity } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_type', 'view')
        .gte('created_at', yesterdayStr)
        .lt('created_at', today)
        .limit(1)

      // 获取当前连续天数
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('reading_streak')
        .eq('id', userId)
        .single()

      let newStreak = 1
      if (yesterdayActivity && yesterdayActivity.length > 0) {
        // 昨天也有阅读，连续天数+1
        newStreak = (profile?.reading_streak || 0) + 1
      }

      // 更新连续天数
      await supabase
        .from('user_profiles')
        .update({ reading_streak: newStreak })
        .eq('id', userId)

      return newStreak
    } catch (error) {
      console.error('更新阅读连续性异常:', error)
      return 0
    }
  }

  // 创建通知（供Agent使用）
  static async createNotification(userId: string, type: string, title: string, message: string, metadata: any = {}): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          metadata
        })

      if (error) {
        console.error('创建通知失败:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('创建通知异常:', error)
      return false
    }
  }

  // 记录用户活动（供Agent使用）
  static async recordUserActivity(userId: string, activityType: string, targetId?: string, metadata: any = {}): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          target_id: targetId,
          metadata
        })

      if (error) {
        console.error('记录用户活动失败:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('记录用户活动异常:', error)
      return false
    }
  }
}
