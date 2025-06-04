import { NextRequest, NextResponse } from 'next/server'
import { ImageSearchService } from '@/lib/image-search-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || 'technology'
  
  try {
    console.log(`🔍 测试图片搜索: ${query}`)
    
    // 测试网络图片搜索
    const searchResult = await ImageSearchService.searchImages(query)
    
    if (searchResult) {
      return NextResponse.json({
        success: true,
        data: {
          result: searchResult,
          source: 'network_search',
          query
        }
      })
    }
    
    // 如果搜索失败，返回预设图片
    const presetImage = ImageSearchService.getPresetImageByCategory('tech')
    
    return NextResponse.json({
      success: true,
      data: {
        result: presetImage,
        source: 'preset_image',
        query,
        fallback: true
      }
    })
    
  } catch (error) {
    console.error('图片搜索测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: {
        result: ImageSearchService.getPresetImageByCategory('tech'),
        source: 'error_fallback'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, category } = await request.json()
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: '缺少查询参数'
      }, { status: 400 })
    }
    
    console.log(`🔍 POST测试图片搜索: ${query} (分类: ${category})`)
    
    // 测试完整的降级策略
    const results = {
      networkSearch: null,
      presetImage: null,
      fallbackSVG: null
    }
    
    // 1. 尝试网络搜索
    try {
      results.networkSearch = await ImageSearchService.searchImages(query)
    } catch (error) {
      console.log('网络搜索失败:', error.message)
    }
    
    // 2. 获取预设图片
    try {
      results.presetImage = ImageSearchService.getPresetImageByCategory(category || 'tech')
    } catch (error) {
      console.log('预设图片获取失败:', error.message)
    }
    
    // 3. SVG降级（这里只返回描述，实际SVG由前端生成）
    results.fallbackSVG = {
      imageUrl: 'data:image/svg+xml;base64,...',
      title: `${query}概念图`,
      source: 'SVG生成',
      description: `${query}的SVG概念图`
    }
    
    return NextResponse.json({
      success: true,
      data: {
        query,
        category,
        results,
        recommendation: results.networkSearch || results.presetImage || results.fallbackSVG,
        strategy: results.networkSearch ? 'network_search' : 
                 results.presetImage ? 'preset_image' : 'svg_fallback'
      }
    })
    
  } catch (error) {
    console.error('POST图片搜索测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
