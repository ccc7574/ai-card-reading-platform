// RAG引擎 - 基于最新RAG技术的智能数据处理系统
import { OpenAI } from 'openai'
import { agenticRAGEngine, AgenticQuery } from './agentic-rag-engine'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface VectorDocument {
  id: string
  content: string
  metadata: {
    title: string
    source: string
    category: string
    tags: string[]
    publishedAt: Date
    author?: string
    url?: string
    difficulty?: string
    readingTime?: number
  }
  embedding: number[]
  chunks: DocumentChunk[]
  lastUpdated: Date
}

export interface DocumentChunk {
  id: string
  content: string
  embedding: number[]
  position: number
  metadata: {
    chunkType: 'title' | 'summary' | 'content' | 'conclusion'
    importance: number
    keywords: string[]
  }
}

export interface RAGQuery {
  query: string
  userId?: string
  context?: any
  filters?: {
    category?: string[]
    source?: string[]
    dateRange?: { start: Date; end: Date }
    difficulty?: string[]
    tags?: string[]
  }
  options?: {
    topK?: number
    threshold?: number
    rerank?: boolean
    includeMetadata?: boolean
    mode?: 'traditional' | 'agentic' // 新增：支持Agentic模式
    agenticConfig?: {
      intent?: 'research' | 'learning' | 'problem_solving' | 'exploration'
      complexity?: 'simple' | 'medium' | 'complex'
      maxSteps?: number
      enableReasoning?: boolean
    }
  }
}

export interface RAGResponse {
  results: VectorDocument[]
  query: string
  totalResults: number
  processingTime: number
  confidence: number
  explanation: string
  relatedQueries: string[]
  sources: string[]
  agenticData?: {
    finalAnswer: string
    retrievalSteps: any[]
    agentDecisions: any[]
    qualityScore: number
  }
}

export class RAGEngine {
  private static instance: RAGEngine
  private openai: OpenAI
  private gemini: GoogleGenerativeAI
  private vectorStore = new Map<string, VectorDocument>()
  private queryCache = new Map<string, RAGResponse>()
  private embeddingCache = new Map<string, number[]>()

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  }

  public static getInstance(): RAGEngine {
    if (!RAGEngine.instance) {
      RAGEngine.instance = new RAGEngine()
    }
    return RAGEngine.instance
  }

  // 智能文档处理和向量化
  public async processDocument(document: any): Promise<VectorDocument> {
    console.log(`🔍 RAG处理文档: ${document.title}`)

    try {
      // 1. 智能内容分块
      const chunks = await this.intelligentChunking(document.content, document.title)
      
      // 2. 生成文档级别的embedding
      const documentEmbedding = await this.generateEmbedding(
        `${document.title}\n${document.summary}\n${document.content.substring(0, 1000)}`
      )
      
      // 3. 为每个chunk生成embedding
      const processedChunks: DocumentChunk[] = []
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const chunkEmbedding = await this.generateEmbedding(chunk.content)
        
        processedChunks.push({
          id: `${document.id}_chunk_${i}`,
          content: chunk.content,
          embedding: chunkEmbedding,
          position: i,
          metadata: {
            chunkType: chunk.type,
            importance: chunk.importance,
            keywords: await this.extractKeywords(chunk.content)
          }
        })
      }

      // 4. 智能标签提取和分类
      const enhancedMetadata = await this.enhanceMetadata(document)

      const vectorDocument: VectorDocument = {
        id: document.id,
        content: document.content,
        metadata: {
          ...document,
          ...enhancedMetadata
        },
        embedding: documentEmbedding,
        chunks: processedChunks,
        lastUpdated: new Date()
      }

      // 5. 存储到向量数据库
      this.vectorStore.set(document.id, vectorDocument)
      
      console.log(`✅ 文档处理完成: ${chunks.length} 个chunks`)
      return vectorDocument

    } catch (error) {
      console.error('RAG文档处理失败:', error)
      throw error
    }
  }

  // 智能内容分块
  private async intelligentChunking(content: string, title: string): Promise<any[]> {
    try {
      const prompt = `
作为一个智能文档分析专家，请将以下内容进行智能分块。
每个分块应该是语义完整的单元，包含相关的概念和信息。

标题: ${title}
内容: ${content}

请返回JSON格式的分块结果，每个分块包含：
- content: 分块内容
- type: 分块类型 (title/summary/content/conclusion)
- importance: 重要性评分 (1-10)
- summary: 分块摘要

要求：
1. 每个分块200-500字
2. 保持语义完整性
3. 识别关键概念和要点
4. 按重要性排序
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(result) ? result : []

    } catch (error) {
      console.error('智能分块失败:', error)
      // 降级到简单分块
      return this.simpleChunking(content)
    }
  }

  // 简单分块（降级方案）
  private simpleChunking(content: string): any[] {
    const chunks = []
    const chunkSize = 400
    const overlap = 50

    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunk = content.slice(i, i + chunkSize)
      chunks.push({
        content: chunk,
        type: 'content',
        importance: 5,
        summary: chunk.substring(0, 100) + '...'
      })
    }

    return chunks
  }

  // 生成embedding向量
  private async generateEmbedding(text: string): Promise<number[]> {
    // 检查缓存
    const cacheKey = this.hashText(text)
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: text,
        dimensions: 1536 // 使用最新的高维embedding
      })

      const embedding = response.data[0].embedding
      this.embeddingCache.set(cacheKey, embedding)
      
      return embedding

    } catch (error) {
      console.error('生成embedding失败:', error)
      // 返回随机向量作为降级
      return Array.from({ length: 1536 }, () => Math.random() - 0.5)
    }
  }

  // 提取关键词
  private async extractKeywords(text: string): Promise<string[]> {
    try {
      const prompt = `
从以下文本中提取5-10个最重要的关键词，返回JSON数组格式：

文本: ${text.substring(0, 500)}

要求：
1. 提取核心概念和技术术语
2. 包含领域专业词汇
3. 避免常见停用词
4. 返回格式: ["关键词1", "关键词2", ...]
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })

      const keywords = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(keywords) ? keywords : []

    } catch (error) {
      console.error('关键词提取失败:', error)
      return []
    }
  }

  // 增强元数据
  private async enhanceMetadata(document: any): Promise<any> {
    try {
      const prompt = `
作为内容分析专家，请分析以下文档并提供增强的元数据：

标题: ${document.title}
内容: ${document.content.substring(0, 1000)}

请返回JSON格式的增强元数据：
{
  "difficulty": "beginner|intermediate|advanced|expert",
  "readingTime": 预估阅读时间(分钟),
  "category": "更精确的分类",
  "tags": ["标签1", "标签2", ...],
  "topics": ["主题1", "主题2", ...],
  "sentiment": "positive|neutral|negative",
  "complexity": 1-10,
  "actionable": true/false,
  "prerequisites": ["前置知识1", "前置知识2", ...],
  "relatedConcepts": ["相关概念1", "相关概念2", ...]
}
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      return JSON.parse(response.choices[0].message.content || '{}')

    } catch (error) {
      console.error('元数据增强失败:', error)
      return {}
    }
  }

  // 智能检索
  public async search(query: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now()

    try {
      console.log(`🔍 RAG检索 (${query.options?.mode || 'traditional'}): ${query.query}`)

      // 检查是否使用Agentic模式
      if (query.options?.mode === 'agentic') {
        return await this.agenticSearch(query)
      }

      // 1. 检查查询缓存
      const cacheKey = this.hashQuery(query)
      if (this.queryCache.has(cacheKey)) {
        const cached = this.queryCache.get(cacheKey)!
        console.log('✅ 使用缓存结果')
        return cached
      }

      // 2. 查询扩展和重写
      const expandedQuery = await this.expandQuery(query.query, query.context)

      // 3. 生成查询embedding
      const queryEmbedding = await this.generateEmbedding(expandedQuery)

      // 4. 向量相似度搜索
      const candidates = await this.vectorSearch(queryEmbedding, query.filters, query.options?.topK || 10)

      // 5. 重排序
      const rerankedResults = query.options?.rerank 
        ? await this.rerank(candidates, query.query)
        : candidates

      // 6. 生成解释和相关查询
      const explanation = await this.generateExplanation(query.query, rerankedResults)
      const relatedQueries = await this.generateRelatedQueries(query.query)

      const response: RAGResponse = {
        results: rerankedResults.slice(0, query.options?.topK || 10),
        query: query.query,
        totalResults: candidates.length,
        processingTime: Date.now() - startTime,
        confidence: this.calculateConfidence(rerankedResults),
        explanation,
        relatedQueries,
        sources: [...new Set(rerankedResults.map(r => r.metadata.source))]
      }

      // 7. 缓存结果
      this.queryCache.set(cacheKey, response)

      console.log(`✅ RAG检索完成: ${response.results.length} 个结果`)
      return response

    } catch (error) {
      console.error('RAG检索失败:', error)
      throw error
    }
  }

  // Agentic RAG搜索
  private async agenticSearch(query: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now()

    try {
      console.log(`🧠 启动Agentic RAG模式`)

      // 构建Agentic查询
      const agenticQuery: AgenticQuery = {
        originalQuery: query.query,
        userId: query.userId,
        context: {
          userIntent: query.options?.agenticConfig?.intent || 'research',
          complexity: query.options?.agenticConfig?.complexity || 'medium',
          conversationHistory: query.context?.history || []
        },
        constraints: {
          maxSteps: query.options?.agenticConfig?.maxSteps || 5,
          timeLimit: 30000,
          language: 'zh'
        }
      }

      // 调用Agentic RAG引擎
      const agenticResult = await agenticRAGEngine.processQuery(agenticQuery)

      // 转换为RAG响应格式
      const ragResponse: RAGResponse = {
        results: [], // Agentic RAG有自己的结果格式
        query: query.query,
        totalResults: agenticResult.sources.length,
        processingTime: Date.now() - startTime,
        confidence: agenticResult.confidence,
        explanation: agenticResult.reasoning,
        relatedQueries: [], // 可以从Agentic结果中提取
        sources: agenticResult.sources.map(s => s.title),
        // 添加Agentic特有的信息
        agenticData: {
          finalAnswer: agenticResult.finalAnswer,
          retrievalSteps: agenticResult.retrievalSteps,
          agentDecisions: agenticResult.metadata.agentDecisions,
          qualityScore: agenticResult.metadata.qualityScore
        }
      }

      console.log(`✅ Agentic RAG完成: ${agenticResult.metadata.totalSteps} 步骤`)
      return ragResponse

    } catch (error) {
      console.error('Agentic RAG搜索失败:', error)

      // 降级到传统RAG
      console.log('🔄 降级到传统RAG模式')
      const fallbackQuery: RAGQuery = {
        ...query,
        options: {
          ...query.options,
          mode: 'traditional' as const
        }
      }
      return await this.search(fallbackQuery)
    }
  }

  // 查询扩展
  private async expandQuery(query: string, context?: any): Promise<string> {
    try {
      const prompt = `
作为查询优化专家，请扩展和优化以下查询，使其更适合语义搜索：

原始查询: ${query}
上下文: ${context ? JSON.stringify(context) : '无'}

请返回优化后的查询，要求：
1. 保持原意
2. 添加相关同义词
3. 包含领域术语
4. 适合向量检索

只返回优化后的查询文本，不要其他内容。
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      return response.choices[0].message.content || query

    } catch (error) {
      console.error('查询扩展失败:', error)
      return query
    }
  }

  // 向量搜索
  private async vectorSearch(
    queryEmbedding: number[], 
    filters?: RAGQuery['filters'], 
    topK: number = 10
  ): Promise<VectorDocument[]> {
    const candidates: { document: VectorDocument; score: number }[] = []

    for (const [id, document] of this.vectorStore) {
      // 应用过滤器
      if (filters && !this.applyFilters(document, filters)) {
        continue
      }

      // 计算相似度
      const similarity = this.cosineSimilarity(queryEmbedding, document.embedding)
      
      // 同时检查chunk级别的相似度
      let maxChunkSimilarity = 0
      for (const chunk of document.chunks) {
        const chunkSimilarity = this.cosineSimilarity(queryEmbedding, chunk.embedding)
        maxChunkSimilarity = Math.max(maxChunkSimilarity, chunkSimilarity)
      }

      // 综合文档和chunk相似度
      const finalScore = similarity * 0.7 + maxChunkSimilarity * 0.3

      candidates.push({ document, score: finalScore })
    }

    // 按相似度排序
    candidates.sort((a, b) => b.score - a.score)

    return candidates.slice(0, topK * 2).map(c => c.document) // 返回更多候选用于重排序
  }

  // 重排序
  private async rerank(documents: VectorDocument[], query: string): Promise<VectorDocument[]> {
    try {
      const prompt = `
作为内容相关性专家，请根据查询对以下文档进行重排序：

查询: ${query}

文档列表:
${documents.map((doc, i) => `${i + 1}. ${doc.metadata.title}\n摘要: ${doc.content.substring(0, 200)}...`).join('\n\n')}

请返回重排序后的文档ID列表，格式为JSON数组: ["id1", "id2", ...]
按相关性从高到低排序。
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })

      const reorderedIds = JSON.parse(response.choices[0].message.content || '[]')
      
      // 根据重排序结果重新组织文档
      const reranked: VectorDocument[] = []
      for (const id of reorderedIds) {
        const doc = documents.find(d => d.id === id)
        if (doc) reranked.push(doc)
      }

      // 添加未在重排序中的文档
      for (const doc of documents) {
        if (!reranked.find(r => r.id === doc.id)) {
          reranked.push(doc)
        }
      }

      return reranked

    } catch (error) {
      console.error('重排序失败:', error)
      return documents
    }
  }

  // 生成解释
  private async generateExplanation(query: string, results: VectorDocument[]): Promise<string> {
    try {
      const prompt = `
请为以下检索结果生成简洁的解释：

查询: ${query}
结果数量: ${results.length}
主要来源: ${[...new Set(results.slice(0, 3).map(r => r.metadata.source))].join(', ')}

请生成一句话的解释，说明为什么这些结果与查询相关。
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      return response.choices[0].message.content || '基于语义相似度匹配的相关内容'

    } catch (error) {
      console.error('生成解释失败:', error)
      return '基于AI语义理解的智能检索结果'
    }
  }

  // 生成相关查询
  private async generateRelatedQueries(query: string): Promise<string[]> {
    try {
      const prompt = `
基于查询"${query}"，生成3-5个相关的查询建议。
返回JSON数组格式: ["查询1", "查询2", ...]

要求：
1. 与原查询相关但角度不同
2. 可能是用户的后续问题
3. 涵盖相关主题
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5
      })

      const related = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(related) ? related : []

    } catch (error) {
      console.error('生成相关查询失败:', error)
      return []
    }
  }

  // 应用过滤器
  private applyFilters(document: VectorDocument, filters: RAGQuery['filters']): boolean {
    if (filters?.category && !filters.category.includes(document.metadata.category)) {
      return false
    }

    if (filters?.source && !filters.source.includes(document.metadata.source)) {
      return false
    }

    if (filters?.difficulty && !filters.difficulty.includes(document.metadata.difficulty || '')) {
      return false
    }

    if (filters?.tags && !filters.tags.some(tag => document.metadata.tags.includes(tag))) {
      return false
    }

    if (filters?.dateRange) {
      const docDate = new Date(document.metadata.publishedAt)
      if (docDate < filters.dateRange.start || docDate > filters.dateRange.end) {
        return false
      }
    }

    return true
  }

  // 计算余弦相似度
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
  }

  // 计算置信度
  private calculateConfidence(results: VectorDocument[]): number {
    if (results.length === 0) return 0
    
    // 基于结果数量和质量计算置信度
    const baseConfidence = Math.min(results.length / 10, 1) * 0.5
    const qualityBonus = results.length > 0 ? 0.3 : 0
    const diversityBonus = new Set(results.map(r => r.metadata.source)).size > 1 ? 0.2 : 0
    
    return Math.min(baseConfidence + qualityBonus + diversityBonus, 1)
  }

  // 哈希函数
  private hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString()
  }

  private hashQuery(query: RAGQuery): string {
    return this.hashText(JSON.stringify({
      query: query.query,
      filters: query.filters,
      options: query.options
    }))
  }

  // 获取统计信息
  public getStats() {
    const totalDocuments = this.vectorStore.size
    const totalChunks = Array.from(this.vectorStore.values())
      .reduce((sum, doc) => sum + doc.chunks.length, 0)
    
    return {
      totalDocuments,
      totalChunks,
      averageChunksPerDocument: totalDocuments > 0 ? totalChunks / totalDocuments : 0,
      cacheSize: {
        queries: this.queryCache.size,
        embeddings: this.embeddingCache.size
      },
      lastUpdated: new Date().toISOString()
    }
  }

  // 清理缓存
  public clearCache() {
    this.queryCache.clear()
    this.embeddingCache.clear()
    console.log('✅ RAG缓存已清理')
  }
}

// 导出单例实例
export const ragEngine = RAGEngine.getInstance()
