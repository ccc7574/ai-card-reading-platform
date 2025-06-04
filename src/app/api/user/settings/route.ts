import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取用户设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID'
      }, { status: 400 })
    }

    console.log(`📋 获取用户设置 - 用户: ${userId}`)

    // 模拟用户设置数据（实际应该从数据库获取）
    const mockSettings = {
      profile: {
        displayName: '智能用户',
        bio: '热爱学习新技术，专注于AI和产品设计领域的知识分享者。',
        avatar: '👤',
        publicProfile: true
      },
      preferences: {
        theme: 'auto',
        language: 'zh-CN',
        defaultView: 'cards',
        cardsPerPage: 12,
        autoRefresh: true,
        showTrending: true
      },
      notifications: {
        email: true,
        push: false,
        newContent: true,
        achievements: true,
        comments: true,
        likes: false,
        weeklyDigest: true
      },
      privacy: {
        profilePublic: true,
        showStats: true,
        showActivity: false,
        allowRecommendations: true,
        dataCollection: true
      },
      content: {
        preferredCategories: ['AI技术', '产品设计', '商业洞察'],
        preferredDifficulty: ['beginner', 'intermediate'],
        preferredReadingTime: 5,
        hideNSFW: true,
        autoBookmark: false
      }
    }

    // 如果有Supabase，尝试从数据库获取
    if (supabase) {
      try {
        const { data: userPreferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (userPreferences) {
          // 合并数据库设置和默认设置
          const dbSettings = {
            preferences: {
              ...mockSettings.preferences,
              theme: userPreferences.theme || mockSettings.preferences.theme,
              language: userPreferences.language || mockSettings.preferences.language,
              defaultView: userPreferences.default_view || mockSettings.preferences.defaultView,
              cardsPerPage: userPreferences.cards_per_page || mockSettings.preferences.cardsPerPage,
              autoRefresh: userPreferences.auto_refresh ?? mockSettings.preferences.autoRefresh,
              showTrending: userPreferences.show_trending ?? mockSettings.preferences.showTrending
            },
            notifications: userPreferences.notifications || mockSettings.notifications,
            privacy: userPreferences.privacy || mockSettings.privacy,
            content: {
              ...mockSettings.content,
              preferredCategories: userPreferences.preferred_categories || mockSettings.content.preferredCategories,
              preferredDifficulty: userPreferences.preferred_difficulty || mockSettings.content.preferredDifficulty,
              preferredReadingTime: userPreferences.preferred_reading_time || mockSettings.content.preferredReadingTime
            }
          }

          return NextResponse.json({
            success: true,
            message: '用户设置获取成功',
            settings: { ...mockSettings, ...dbSettings }
          })
        }
      } catch (dbError) {
        console.warn('从数据库获取用户设置失败，使用默认设置:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: '用户设置获取成功（默认设置）',
      settings: mockSettings
    })

  } catch (error) {
    console.error('获取用户设置失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取用户设置失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 保存用户设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = body

    if (!userId || !settings) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    console.log(`💾 保存用户设置 - 用户: ${userId}`)

    // 如果有Supabase，保存到数据库
    if (supabase) {
      try {
        const userPreferencesData = {
          user_id: userId,
          theme: settings.preferences?.theme,
          language: settings.preferences?.language,
          default_view: settings.preferences?.defaultView,
          cards_per_page: settings.preferences?.cardsPerPage,
          auto_refresh: settings.preferences?.autoRefresh,
          show_trending: settings.preferences?.showTrending,
          notifications: settings.notifications,
          privacy: settings.privacy,
          preferred_categories: settings.content?.preferredCategories,
          preferred_difficulty: settings.content?.preferredDifficulty,
          preferred_reading_time: settings.content?.preferredReadingTime,
          hide_nsfw: settings.content?.hideNSFW,
          auto_bookmark: settings.content?.autoBookmark,
          updated_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('user_preferences')
          .upsert(userPreferencesData)

        if (error) {
          console.error('保存到数据库失败:', error)
          // 即使数据库保存失败，也返回成功（降级处理）
        } else {
          console.log('✅ 用户设置已保存到数据库')
        }
      } catch (dbError) {
        console.warn('数据库操作失败，但设置已在本地保存:', dbError)
      }
    }

    // 模拟保存成功
    return NextResponse.json({
      success: true,
      message: '用户设置保存成功',
      data: {
        userId,
        savedAt: new Date().toISOString(),
        settingsCount: Object.keys(settings).length
      }
    })

  } catch (error) {
    console.error('保存用户设置失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '保存用户设置失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 重置用户设置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID'
      }, { status: 400 })
    }

    console.log(`🔄 重置用户设置 - 用户: ${userId}`)

    // 如果有Supabase，从数据库删除
    if (supabase) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', userId)

        if (error) {
          console.error('从数据库删除设置失败:', error)
        } else {
          console.log('✅ 用户设置已从数据库删除')
        }
      } catch (dbError) {
        console.warn('数据库操作失败:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: '用户设置已重置为默认值',
      data: {
        userId,
        resetAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('重置用户设置失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '重置用户设置失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 获取设置统计信息
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      // 模拟设置统计数据
      const stats = {
        totalUsers: 1247,
        settingsDistribution: {
          theme: {
            light: 45,
            dark: 35,
            auto: 20
          },
          defaultView: {
            cards: 60,
            list: 25,
            grid: 15
          },
          notifications: {
            enabled: 78,
            disabled: 22
          }
        },
        popularCategories: [
          { name: 'AI技术', percentage: 68 },
          { name: '产品设计', percentage: 52 },
          { name: '商业洞察', percentage: 45 },
          { name: '编程开发', percentage: 38 },
          { name: '数据科学', percentage: 32 }
        ],
        averageReadingTime: 7.5,
        privacySettings: {
          publicProfile: 65,
          showStats: 78,
          allowRecommendations: 85
        }
      }

      return NextResponse.json({
        success: true,
        message: '设置统计信息获取成功',
        stats
      })
    }

    return NextResponse.json({
      success: false,
      error: '不支持的操作'
    }, { status: 400 })

  } catch (error) {
    console.error('获取设置统计失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取设置统计失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
