# AI集成配置指南

## 🚀 概述

本项目已成功集成OpenAI和Google Gemini两大AI服务提供商，实现了真实的AI驱动内容分析和简笔画生成功能。

## 🔧 环境配置

### 1. 获取API密钥

#### OpenAI API Key
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账户
3. 进入 API Keys 页面
4. 创建新的API密钥
5. 复制密钥（注意：只显示一次）

#### Google Gemini API Key
1. 访问 [Google AI Studio](https://makersuite.google.com/)
2. 登录Google账户
3. 创建新项目或选择现有项目
4. 获取API密钥
5. 确保启用了Generative AI API

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```bash
# OpenAI配置
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Gemini配置
GOOGLE_API_KEY=your-google-api-key-here

# 可选：自定义API端点
OPENAI_BASE_URL=https://api.openai.com/v1
GOOGLE_AI_BASE_URL=https://generativelanguage.googleapis.com
```

## 🎯 功能特性

### OpenAI集成
- **内容分析**: 使用GPT-4进行深度内容理解和摘要生成
- **简笔画生成**: 使用DALL-E 3生成高质量的概念图
- **智能标签**: 自动提取和分类内容标签
- **金句提取**: 生成朗朗上口的核心观点

### Gemini集成
- **内容分析**: 使用Gemini Pro进行内容理解
- **SVG生成**: 生成简洁的SVG简笔画
- **多语言支持**: 优秀的中文理解能力
- **成本效益**: 相对较低的API调用成本

## 🔄 工作流程

### 1. 内容抓取
```typescript
// 自动抓取网页内容
const scrapedContent = await ContentScraper.scrapeUrl(url)
```

### 2. AI内容分析
```typescript
// 选择AI服务提供商进行分析
const analysisResult = await AIServiceFactory.analyzeContent(
  provider, // 'openai' 或 'gemini'
  url,
  content
)
```

### 3. 简笔画生成
```typescript
// 生成概念图
const sketchResult = await AIServiceFactory.generateSketch(
  provider,
  prompt
)
```

## 🧪 测试API

### 健康检查
```bash
curl http://localhost:3000/api/test?type=health
```

### 测试内容抓取
```bash
curl "http://localhost:3000/api/test?type=scraper&url=https://example.com"
```

### 测试OpenAI
```bash
curl http://localhost:3000/api/test?type=openai
```

### 测试Gemini
```bash
curl http://localhost:3000/api/test?type=gemini
```

## 📊 使用示例

### 生成AI卡片
```javascript
const response = await fetch('/api/generate-card', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/ai-article',
    type: 'article',
    aiProvider: 'openai' // 或 'gemini'
  })
})

const result = await response.json()
```

### 响应格式
```json
{
  "success": true,
  "card": {
    "id": "generated-1234567890",
    "title": "AI技术突破：多模态能力的新进展",
    "summary": "🚀 AI不再只是处理文本，现在能够理解图像、音频等多种模态...",
    "content": "<h2>技术突破</h2><p>详细内容...</p>",
    "tags": ["AI", "多模态", "技术突破"],
    "imageUrl": "https://...",
    "category": "article",
    "difficulty": "intermediate",
    "readingTime": 5
  },
  "processing": {
    "contentScraping": "✅ 内容抓取完成",
    "contentAnalysis": "✅ AI内容分析完成",
    "summaryGeneration": "✅ 金句摘要生成完成",
    "sketchGeneration": "✅ 简笔画生成完成",
    "tagging": "✅ 智能标签提取完成"
  },
  "metadata": {
    "aiProvider": "openai",
    "originalDomain": "example.com",
    "processingTime": 1234567890
  }
}
```

## ⚠️ 注意事项

### API限制
- **OpenAI**: 注意token限制和费率限制
- **Gemini**: 免费层有请求次数限制
- **网络抓取**: 某些网站可能有反爬虫机制

### 错误处理
- 所有AI服务调用都有完善的错误处理
- 如果AI分析失败，会使用抓取的原始内容作为备选
- 如果图像生成失败，会使用SVG占位符

### 性能优化
- 内容抓取有10秒超时限制
- AI分析结果会缓存（计划中）
- 图像生成支持多种格式

## 🔮 未来扩展

### 计划中的功能
- [ ] 支持更多AI服务提供商（Claude、文心一言等）
- [ ] 批量处理和队列系统
- [ ] 结果缓存和数据库存储
- [ ] 用户偏好学习
- [ ] 多语言内容支持
- [ ] 实时协作功能

### 技术改进
- [ ] 流式响应支持
- [ ] WebSocket实时更新
- [ ] 图像压缩和CDN
- [ ] 智能重试机制
- [ ] 监控和日志系统

## 🛠️ 故障排除

### 常见问题

1. **API密钥无效**
   - 检查密钥格式是否正确
   - 确认密钥权限和余额

2. **内容抓取失败**
   - 检查URL是否可访问
   - 某些网站需要特殊处理

3. **AI分析超时**
   - 内容过长可能导致超时
   - 可以尝试分段处理

4. **图像生成失败**
   - DALL-E 3对某些内容有限制
   - Gemini SVG生成可能不稳定

### 调试技巧
- 查看浏览器控制台错误
- 检查服务器日志
- 使用测试API验证配置
- 逐步测试各个组件

## 📞 支持

如果遇到问题，请：
1. 检查环境变量配置
2. 运行健康检查API
3. 查看错误日志
4. 参考本文档的故障排除部分

---

**注意**: 请妥善保管API密钥，不要将其提交到版本控制系统中。
