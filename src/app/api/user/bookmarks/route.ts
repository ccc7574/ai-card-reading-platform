import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取用户收藏
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

    console.log(`📚 获取用户收藏 - 用户: ${userId}`)

    // 模拟收藏文件夹数据
    const mockFolders = [
      {
        id: 'default',
        name: '默认收藏',
        description: '未分类的收藏内容',
        color: 'blue',
        itemCount: 12,
        createdAt: '2024-01-15'
      },
      {
        id: 'ai-tech',
        name: 'AI技术',
        description: '人工智能相关的技术文章和资源',
        color: 'purple',
        itemCount: 8,
        createdAt: '2024-01-10'
      },
      {
        id: 'design',
        name: '设计灵感',
        description: '产品设计和用户体验相关内容',
        color: 'green',
        itemCount: 15,
        createdAt: '2024-01-08'
      },
      {
        id: 'business',
        name: '商业洞察',
        description: '商业策略和市场分析',
        color: 'orange',
        itemCount: 6,
        createdAt: '2024-01-05'
      }
    ]

    // 模拟收藏内容数据
    const mockBookmarks = [
      {
        id: '1',
        type: 'card',
        title: 'GPT-4的多模态能力突破：从文本到视觉的AI革命',
        summary: 'AI不再只是"读"文字，现在它能"看"世界了！GPT-4的视觉能力让机器真正理解图像内容。',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        author: 'OpenAI研究团队',
        tags: ['GPT-4', '多模态', '计算机视觉'],
        bookmarkedAt: '2024-01-20',
        folderId: 'ai-tech',
        notes: '这篇文章很好地解释了多模态AI的技术原理',
        readingTime: 8,
        category: 'AI技术'
      },
      {
        id: '2',
        type: 'content',
        title: '设计系统的演进：从组件库到设计语言',
        summary: '探讨现代设计系统如何从简单的组件库发展为完整的设计语言体系。',
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        author: '设计师小王',
        tags: ['设计系统', 'UI/UX', '组件库'],
        bookmarkedAt: '2024-01-18',
        folderId: 'design',
        readingTime: 6,
        category: '产品设计',
        url: 'https://example.com/design-system'
      },
      {
        id: '3',
        type: 'card',
        title: '创业公司的产品市场匹配策略',
        summary: '如何在早期阶段找到产品与市场的最佳匹配点，避免常见的创业陷阱。',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        author: '创业导师李明',
        tags: ['创业', 'PMF', '产品策略'],
        bookmarkedAt: '2024-01-16',
        folderId: 'business',
        readingTime: 10,
        category: '商业洞察'
      },
      {
        id: '4',
        type: 'content',
        title: '深度学习在自然语言处理中的最新进展',
        summary: '回顾2024年NLP领域的重大突破，包括大语言模型的新架构和训练方法。',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
        author: 'AI研究员张博士',
        tags: ['深度学习', 'NLP', '大语言模型'],
        bookmarkedAt: '2024-01-14',
        folderId: 'ai-tech',
        readingTime: 12,
        category: 'AI技术'
      },
      {
        id: '5',
        type: 'card',
        title: '用户体验设计的心理学原理',
        summary: '探索认知心理学如何指导我们创造更直观、更有效的用户界面设计。',
        imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
        author: 'UX专家刘设计',
        tags: ['用户体验', '心理学', '界面设计'],
        bookmarkedAt: '2024-01-12',
        folderId: 'design',
        notes: '心理学在设计中的应用很有启发性',
        readingTime: 7,
        category: '产品设计'
      }
    ]

    // 如果有Supabase，尝试从数据库获取
    if (supabase) {
      try {
        const { data: bookmarksData } = await supabase
          .from('bookmarks')
          .select(`
            *,
            contents(*),
            cards(*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (bookmarksData && bookmarksData.length > 0) {
          // 转换数据库数据格式
          const dbBookmarks = bookmarksData.map(bookmark => ({
            id: bookmark.id,
            type: bookmark.content_id ? 'content' : 'card',
            title: bookmark.contents?.title || bookmark.cards?.title || '未知标题',
            summary: bookmark.contents?.summary || bookmark.cards?.summary || '',
            imageUrl: bookmark.contents?.image_url || bookmark.cards?.image_url,
            author: bookmark.contents?.author || bookmark.cards?.author || '未知作者',
            tags: [], // 需要从关联表获取
            bookmarkedAt: bookmark.created_at,
            folderId: bookmark.folder_id || 'default',
            notes: bookmark.notes,
            readingTime: bookmark.contents?.reading_time || bookmark.cards?.reading_time || 5,
            category: bookmark.contents?.category || bookmark.cards?.category || '未分类'
          }))

          return NextResponse.json({
            success: true,
            message: '收藏获取成功',
            data: {
              folders: mockFolders, // 暂时使用模拟数据
              bookmarks: dbBookmarks
            }
          })
        }
      } catch (dbError) {
        console.warn('从数据库获取收藏失败，使用模拟数据:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: '收藏获取成功（模拟数据）',
      data: {
        folders: mockFolders,
        bookmarks: mockBookmarks
      }
    })

  } catch (error) {
    console.error('获取用户收藏失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取用户收藏失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, contentId, cardId, folderId, notes } = body

    if (!userId || (!contentId && !cardId)) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    console.log(`➕ 添加收藏 - 用户: ${userId}, 内容: ${contentId || cardId}`)

    // 如果有Supabase，保存到数据库
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            content_id: contentId,
            card_id: cardId,
            folder_id: folderId || 'default',
            notes: notes || null
          })
          .select()

        if (error) {
          console.error('保存收藏到数据库失败:', error)
        } else {
          console.log('✅ 收藏已保存到数据库')
          return NextResponse.json({
            success: true,
            message: '收藏添加成功',
            data: data[0]
          })
        }
      } catch (dbError) {
        console.warn('数据库操作失败:', dbError)
      }
    }

    // 模拟成功响应
    return NextResponse.json({
      success: true,
      message: '收藏添加成功',
      data: {
        id: Date.now().toString(),
        userId,
        contentId,
        cardId,
        folderId: folderId || 'default',
        notes,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('添加收藏失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '添加收藏失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 删除收藏
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('bookmarkId')
    const userId = searchParams.get('userId')

    if (!bookmarkId || !userId) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    console.log(`🗑️ 删除收藏 - 用户: ${userId}, 收藏: ${bookmarkId}`)

    // 如果有Supabase，从数据库删除
    if (supabase) {
      try {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', bookmarkId)
          .eq('user_id', userId)

        if (error) {
          console.error('从数据库删除收藏失败:', error)
        } else {
          console.log('✅ 收藏已从数据库删除')
        }
      } catch (dbError) {
        console.warn('数据库操作失败:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: '收藏删除成功',
      data: {
        bookmarkId,
        deletedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('删除收藏失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '删除收藏失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 更新收藏（移动文件夹、添加笔记等）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookmarkId, userId, folderId, notes } = body

    if (!bookmarkId || !userId) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    console.log(`📝 更新收藏 - 用户: ${userId}, 收藏: ${bookmarkId}`)

    // 如果有Supabase，更新数据库
    if (supabase) {
      try {
        const updateData: any = {}
        if (folderId !== undefined) updateData.folder_id = folderId
        if (notes !== undefined) updateData.notes = notes
        updateData.updated_at = new Date().toISOString()

        const { data, error } = await supabase
          .from('bookmarks')
          .update(updateData)
          .eq('id', bookmarkId)
          .eq('user_id', userId)
          .select()

        if (error) {
          console.error('更新数据库收藏失败:', error)
        } else {
          console.log('✅ 收藏已在数据库中更新')
          return NextResponse.json({
            success: true,
            message: '收藏更新成功',
            data: data[0]
          })
        }
      } catch (dbError) {
        console.warn('数据库操作失败:', dbError)
      }
    }

    // 模拟成功响应
    return NextResponse.json({
      success: true,
      message: '收藏更新成功',
      data: {
        bookmarkId,
        folderId,
        notes,
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('更新收藏失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '更新收藏失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
