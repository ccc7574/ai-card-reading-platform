import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase环境变量未配置，使用模拟模式')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 数据库表结构类型定义
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          birth_date: string | null
          theme_preference: string
          language_preference: string
          timezone: string
          email_notifications: boolean
          push_notifications: boolean
          weekly_digest: boolean
          profile_public: boolean
          show_stats: boolean
          show_activity: boolean
          reading_streak: number
          total_reading_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          birth_date?: string | null
          theme_preference?: string
          language_preference?: string
          timezone?: string
          email_notifications?: boolean
          push_notifications?: boolean
          weekly_digest?: boolean
          profile_public?: boolean
          show_stats?: boolean
          show_activity?: boolean
          reading_streak?: number
          total_reading_time?: number
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          birth_date?: string | null
          theme_preference?: string
          language_preference?: string
          timezone?: string
          email_notifications?: boolean
          push_notifications?: boolean
          weekly_digest?: boolean
          profile_public?: boolean
          show_stats?: boolean
          show_activity?: boolean
          reading_streak?: number
          total_reading_time?: number
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          icon: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          icon?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          color?: string
          icon?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          usage_count: number
          is_trending: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          usage_count?: number
          is_trending?: boolean
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          color?: string
          usage_count?: number
          is_trending?: boolean
        }
      }
      contents: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string | null
          url: string | null
          image_url: string | null
          author: string | null
          source_name: string
          source_id: string | null
          category_id: string | null
          difficulty: string
          reading_time: number | null
          quality_score: number
          trending_score: number
          view_count: number
          like_count: number
          bookmark_count: number
          share_count: number
          comment_count: number
          published_at: string | null
          fetched_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          content?: string | null
          url?: string | null
          image_url?: string | null
          author?: string | null
          source_name: string
          source_id?: string | null
          category_id?: string | null
          difficulty?: string
          reading_time?: number | null
          quality_score?: number
          trending_score?: number
          view_count?: number
          like_count?: number
          bookmark_count?: number
          share_count?: number
          comment_count?: number
          published_at?: string | null
          fetched_at?: string
          is_active?: boolean
        }
        Update: {
          title?: string
          summary?: string | null
          content?: string | null
          url?: string | null
          image_url?: string | null
          author?: string | null
          source_name?: string
          source_id?: string | null
          category_id?: string | null
          difficulty?: string
          reading_time?: number | null
          quality_score?: number
          trending_score?: number
          view_count?: number
          like_count?: number
          bookmark_count?: number
          share_count?: number
          comment_count?: number
          published_at?: string | null
          is_active?: boolean
        }
      }
      cards: {
        Row: {
          id: string
          user_id: string
          title: string
          summary: string | null
          content: string | null
          deep_content: any | null
          source_url: string | null
          source_content_id: string | null
          image_url: string | null
          category_id: string | null
          difficulty: string
          reading_time: number | null
          ai_provider: string | null
          generation_metadata: any | null
          view_count: number
          like_count: number
          bookmark_count: number
          share_count: number
          comment_count: number
          is_public: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          summary?: string | null
          content?: string | null
          deep_content?: any | null
          source_url?: string | null
          source_content_id?: string | null
          image_url?: string | null
          category_id?: string | null
          difficulty?: string
          reading_time?: number | null
          ai_provider?: string | null
          generation_metadata?: any | null
          view_count?: number
          like_count?: number
          bookmark_count?: number
          share_count?: number
          comment_count?: number
          is_public?: boolean
          is_featured?: boolean
        }
        Update: {
          title?: string
          summary?: string | null
          content?: string | null
          deep_content?: any | null
          source_url?: string | null
          source_content_id?: string | null
          image_url?: string | null
          category_id?: string | null
          difficulty?: string
          reading_time?: number | null
          ai_provider?: string | null
          generation_metadata?: any | null
          view_count?: number
          like_count?: number
          bookmark_count?: number
          share_count?: number
          comment_count?: number
          is_public?: boolean
          is_featured?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recommended_contents: {
        Args: {
          user_id_param?: string
          limit_param?: number
          offset_param?: number
        }
        Returns: Array<{
          id: string
          title: string
          summary: string
          image_url: string
          author: string
          source_name: string
          category_name: string
          difficulty: string
          reading_time: number
          quality_score: number
          trending_score: number
          view_count: number
          like_count: number
          bookmark_count: number
          published_at: string
          tags: string[]
        }>
      }
      search_contents: {
        Args: {
          search_query?: string
          category_ids?: string[]
          tag_ids?: string[]
          difficulty_levels?: string[]
          min_reading_time?: number
          max_reading_time?: number
          sort_by?: string
          limit_param?: number
          offset_param?: number
        }
        Returns: Array<{
          id: string
          title: string
          summary: string
          image_url: string
          author: string
          source_name: string
          category_name: string
          difficulty: string
          reading_time: number
          quality_score: number
          view_count: number
          like_count: number
          published_at: string
          relevance_score: number
        }>
      }
      get_user_stats: {
        Args: {
          user_id_param: string
        }
        Returns: Array<{
          total_views: number
          total_likes: number
          total_bookmarks: number
          total_shares: number
          total_cards: number
          reading_streak: number
          total_reading_time: number
          achievements_count: number
          favorite_categories: string[]
        }>
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 导出类型别名
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Content = Database['public']['Tables']['contents']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
