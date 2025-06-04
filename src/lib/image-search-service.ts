// 图片搜索服务
export interface ImageSearchResult {
  imageUrl: string
  title: string
  source: string
  description: string
}

export class ImageSearchService {
  // 使用Unsplash API搜索图片
  static async searchUnsplash(query: string): Promise<ImageSearchResult[]> {
    try {
      if (!process.env.UNSPLASH_ACCESS_KEY) {
        console.warn('UNSPLASH_ACCESS_KEY not configured, using fallback')
        return []
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.results?.map((photo: any) => ({
        imageUrl: photo.urls.regular,
        title: photo.alt_description || photo.description || 'Unsplash图片',
        source: 'Unsplash',
        description: `由${photo.user.name}拍摄的${photo.alt_description || '图片'}`
      })) || []

    } catch (error) {
      console.error('Unsplash搜索失败:', error)
      return []
    }
  }

  // 使用Pixabay API搜索图片
  static async searchPixabay(query: string): Promise<ImageSearchResult[]> {
    try {
      if (!process.env.PIXABAY_API_KEY) {
        console.warn('PIXABAY_API_KEY not configured, using fallback')
        return []
      }

      const response = await fetch(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&category=backgrounds&min_width=640&per_page=5&safesearch=true`,
        {
          headers: {
            'User-Agent': 'AI-Card-Reading/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.hits?.map((image: any) => ({
        imageUrl: image.webformatURL,
        title: image.tags || 'Pixabay图片',
        source: 'Pixabay',
        description: `${image.tags}相关图片`
      })) || []

    } catch (error) {
      console.error('Pixabay搜索失败:', error)
      return []
    }
  }

  // 综合搜索图片
  static async searchImages(query: string): Promise<ImageSearchResult | null> {
    console.log(`🔍 搜索网络图片: ${query}`)

    // 优化搜索关键词
    const optimizedQuery = this.optimizeSearchQuery(query)
    
    try {
      // 并行搜索多个图片源
      const [unsplashResults, pixabayResults] = await Promise.allSettled([
        this.searchUnsplash(optimizedQuery),
        this.searchPixabay(optimizedQuery)
      ])

      // 合并结果
      const allResults: ImageSearchResult[] = []
      
      if (unsplashResults.status === 'fulfilled') {
        allResults.push(...unsplashResults.value)
      }
      
      if (pixabayResults.status === 'fulfilled') {
        allResults.push(...pixabayResults.value)
      }

      // 如果有结果，返回第一个
      if (allResults.length > 0) {
        const selectedImage = allResults[0]
        console.log(`✅ 找到网络图片: ${selectedImage.title} (来源: ${selectedImage.source})`)
        return selectedImage
      }

      console.log('❌ 未找到合适的网络图片')
      return null

    } catch (error) {
      console.error('图片搜索失败:', error)
      return null
    }
  }

  // 优化搜索关键词
  private static optimizeSearchQuery(query: string): string {
    // 移除中文，使用英文关键词
    const keywordMap: Record<string, string> = {
      '技术': 'technology',
      '人工智能': 'artificial intelligence',
      'AI': 'artificial intelligence',
      '商业': 'business',
      '设计': 'design',
      '科学': 'science',
      '创新': 'innovation',
      '数据': 'data',
      '网络': 'network',
      '云计算': 'cloud computing',
      '区块链': 'blockchain',
      '机器学习': 'machine learning',
      '深度学习': 'deep learning',
      '编程': 'programming',
      '代码': 'code',
      '算法': 'algorithm',
      '软件': 'software',
      '硬件': 'hardware',
      '互联网': 'internet',
      '移动': 'mobile',
      '应用': 'application',
      '平台': 'platform',
      '系统': 'system',
      '架构': 'architecture',
      '开发': 'development',
      '产品': 'product',
      '用户': 'user',
      '体验': 'experience',
      '界面': 'interface',
      '交互': 'interaction'
    }

    let optimizedQuery = query.toLowerCase()

    // 替换中文关键词为英文
    for (const [chinese, english] of Object.entries(keywordMap)) {
      if (optimizedQuery.includes(chinese.toLowerCase())) {
        optimizedQuery = english
        break
      }
    }

    // 如果没有匹配到特定关键词，使用通用关键词
    if (optimizedQuery === query.toLowerCase()) {
      // 根据内容类型选择通用关键词
      if (query.includes('技术') || query.includes('AI') || query.includes('科技')) {
        optimizedQuery = 'technology abstract'
      } else if (query.includes('商业') || query.includes('管理') || query.includes('企业')) {
        optimizedQuery = 'business professional'
      } else if (query.includes('设计') || query.includes('创意') || query.includes('艺术')) {
        optimizedQuery = 'design creative'
      } else if (query.includes('科学') || query.includes('研究') || query.includes('学术')) {
        optimizedQuery = 'science research'
      } else {
        optimizedQuery = 'abstract concept'
      }
    }

    return optimizedQuery
  }

  // 获取预设的高质量图片
  static getPresetImages(): ImageSearchResult[] {
    return [
      {
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80',
        title: '科技抽象背景',
        source: 'Unsplash',
        description: '现代科技感抽象背景图'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
        title: '数字网络',
        source: 'Unsplash', 
        description: '数字化网络连接概念图'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        title: '商业图表',
        source: 'Unsplash',
        description: '商业数据分析图表'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&q=80',
        title: '创意设计',
        source: 'Unsplash',
        description: '创意设计工具和概念'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        title: '科学研究',
        source: 'Unsplash',
        description: '科学实验和研究场景'
      }
    ]
  }

  // 根据分类获取预设图片
  static getPresetImageByCategory(category: string): ImageSearchResult | null {
    const presetImages = this.getPresetImages()
    const categoryMap: Record<string, number> = {
      'tech': 0,
      'ai': 1,
      'business': 2,
      'design': 3,
      'science': 4
    }

    const index = categoryMap[category] ?? 0
    return presetImages[index] || presetImages[0]
  }
}
