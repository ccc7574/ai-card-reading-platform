import { NextRequest, NextResponse } from 'next/server'
import { CommentSystem } from '@/lib/comments/comment-system'

// 评论系统API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')
    const action = searchParams.get('action') || 'list'

    const commentSystem = CommentSystem.getInstance()

    switch (action) {
      case 'list':
        if (!cardId) {
          return NextResponse.json(
            { error: '需要提供卡片ID' },
            { status: 400 }
          )
        }

        const comments = commentSystem.getCardComments(cardId)
        const stats = commentSystem.getCommentStats(cardId)

        return NextResponse.json({
          success: true,
          data: {
            comments,
            stats
          }
        })

      case 'stats':
        if (!cardId) {
          return NextResponse.json(
            { error: '需要提供卡片ID' },
            { status: 400 }
          )
        }

        const commentStats = commentSystem.getCommentStats(cardId)
        return NextResponse.json({
          success: true,
          data: commentStats
        })

      case 'mock':
        if (!cardId) {
          return NextResponse.json(
            { error: '需要提供卡片ID' },
            { status: 400 }
          )
        }

        const mockComments = commentSystem.generateMockComments(cardId, 3)
        return NextResponse.json({
          success: true,
          data: mockComments,
          message: '生成模拟评论'
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('评论API错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '评论API错误',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 添加评论
export async function POST(request: NextRequest) {
  try {
    const { action, cardId, userId, content, commentId, replyTo } = await request.json()

    const commentSystem = CommentSystem.getInstance()

    switch (action) {
      case 'add_comment':
        if (!cardId || !userId || !content) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          )
        }

        // 如果用户不存在，创建一个临时用户
        let user = commentSystem.getUser(userId)
        if (!user) {
          user = commentSystem.createUser(
            `用户${userId.slice(-4)}`,
            `user${userId}@example.com`,
            `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format&q=80`
          )
        }

        const comment = commentSystem.addComment(cardId, user.id, content)
        
        return NextResponse.json({
          success: true,
          data: comment,
          message: '评论添加成功'
        })

      case 'add_reply':
        if (!commentId || !userId || !content) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          )
        }

        let replyUser = commentSystem.getUser(userId)
        if (!replyUser) {
          replyUser = commentSystem.createUser(
            `用户${userId.slice(-4)}`,
            `user${userId}@example.com`,
            `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format&q=80`
          )
        }

        const reply = commentSystem.addReply(commentId, replyUser.id, content, replyTo)
        
        return NextResponse.json({
          success: true,
          data: reply,
          message: '回复添加成功'
        })

      case 'like_comment':
        if (!commentId || !userId) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          )
        }

        const likeSuccess = commentSystem.likeComment(commentId, userId)
        
        return NextResponse.json({
          success: likeSuccess,
          message: likeSuccess ? '点赞成功' : '点赞失败'
        })

      case 'like_reply':
        if (!commentId || !userId || !request.body) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          )
        }

        const { replyId } = await request.json()
        const replyLikeSuccess = commentSystem.likeReply(commentId, replyId, userId)
        
        return NextResponse.json({
          success: replyLikeSuccess,
          message: replyLikeSuccess ? '回复点赞成功' : '回复点赞失败'
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('评论操作错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '评论操作失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 编辑和删除评论
export async function PUT(request: NextRequest) {
  try {
    const { action, commentId, userId, content } = await request.json()

    const commentSystem = CommentSystem.getInstance()

    switch (action) {
      case 'edit':
        if (!commentId || !userId || !content) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          )
        }

        const editSuccess = commentSystem.editComment(commentId, userId, content)
        
        return NextResponse.json({
          success: editSuccess,
          message: editSuccess ? '编辑成功' : '编辑失败'
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('评论编辑错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '评论编辑失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 删除评论
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const userId = searchParams.get('userId')

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const commentSystem = CommentSystem.getInstance()
    const deleteSuccess = commentSystem.deleteComment(commentId, userId)
    
    return NextResponse.json({
      success: deleteSuccess,
      message: deleteSuccess ? '删除成功' : '删除失败'
    })

  } catch (error) {
    console.error('评论删除错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '评论删除失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
