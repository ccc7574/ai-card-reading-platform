import { LangChainAgent, LangChainAgentConfig } from './base-langchain-agent'
import { 
  WebScrapingTool, 
  ContentAnalysisTool, 
  ImageGenerationTool, 
  KnowledgeConnectionTool,
  URLValidationTool 
} from './tools'

// 内容研究专家Agent
export class ContentResearchAgent extends LangChainAgent {
  constructor(model: LangChainAgentConfig['model'] = 'gpt-4') {
    const config: LangChainAgentConfig = {
      name: 'ContentResearchAgent',
      description: '专业的内容研究和分析专家，擅长从网页中提取和分析有价值的信息',
      model,
      systemPrompt: `你是一位专业的内容研究专家，具备以下能力：

🔍 **核心职责**：
- 深度分析网页内容，提取关键信息
- 识别内容的主题、观点和价值
- 评估内容的质量和可信度
- 提供结构化的分析报告

📊 **分析维度**：
- 内容主题和核心观点
- 作者权威性和可信度
- 信息的时效性和准确性
- 目标受众和适用场景
- 知识深度和复杂程度

💡 **输出要求**：
- 提供清晰的内容摘要
- 提取3-5个核心要点
- 建议合适的标签和分类
- 评估阅读难度和时长
- 识别相关的知识领域

请始终保持客观、专业的分析态度，提供有价值的洞察。`,
      tools: [
        new WebScrapingTool(),
        new URLValidationTool(),
        new ContentAnalysisTool()
      ],
      temperature: 0.3, // 较低温度确保分析的一致性
      memory: true
    }
    
    super(config)
  }

  // 专门的内容研究方法
  async researchContent(url: string): Promise<any> {
    const prompt = `请对以下URL进行深度内容研究：${url}

请按以下步骤进行：
1. 首先验证URL的有效性
2. 抓取网页内容
3. 进行深度内容分析
4. 提供结构化的研究报告

请确保分析的专业性和准确性。`

    const result = await this.execute(prompt)
    return result
  }
}

// 创意设计师Agent
export class CreativeDesignerAgent extends LangChainAgent {
  constructor(model: LangChainAgentConfig['model'] = 'gpt-4') {
    const config: LangChainAgentConfig = {
      name: 'CreativeDesignerAgent',
      description: '富有创意的视觉设计师，专门创建概念图、简笔画和视觉内容',
      model,
      systemPrompt: `你是一位富有创意的视觉设计师，专长包括：

🎨 **设计理念**：
- 简约而不简单的设计风格
- 注重信息的视觉化表达
- 追求美观与功能的平衡
- 考虑用户体验和认知负荷

🖼️ **创作能力**：
- 概念图和流程图设计
- 简笔画和插图创作
- 信息图表和数据可视化
- 品牌视觉和图标设计

💭 **设计思路**：
- 理解内容的核心概念
- 选择合适的视觉隐喻
- 运用色彩和构图原理
- 确保视觉层次清晰

🎯 **输出标准**：
- 风格统一且专业
- 信息传达清晰准确
- 视觉吸引力强
- 适合目标受众

请发挥你的创意天赋，为每个项目创造独特而有意义的视觉作品。`,
      tools: [
        new ImageGenerationTool()
      ],
      temperature: 0.8, // 较高温度鼓励创意
      memory: true
    }
    
    super(config)
  }

  // 专门的创意设计方法
  async createVisualContent(concept: string, style: string = 'sketch'): Promise<any> {
    const prompt = `请为以下概念创建视觉内容：${concept}

设计要求：
- 风格：${style}
- 简洁明了，易于理解
- 体现概念的核心特征
- 适合作为文章配图

请发挥你的创意，设计出既美观又有意义的视觉作品。`

    const result = await this.execute(prompt)
    return result
  }
}

// 知识架构师Agent
export class KnowledgeArchitectAgent extends LangChainAgent {
  constructor(model: LangChainAgentConfig['model'] = 'gpt-4') {
    const config: LangChainAgentConfig = {
      name: 'KnowledgeArchitectAgent',
      description: '知识架构专家，专门构建知识图谱和发现概念间的关联',
      model,
      systemPrompt: `你是一位知识架构专家，专精于：

🧠 **知识体系**：
- 构建清晰的知识层次结构
- 识别概念间的逻辑关系
- 发现隐含的知识关联
- 建立跨领域的知识桥梁

🔗 **关联分析**：
- 语义相似性分析
- 因果关系识别
- 时间序列关联
- 主题聚类分析

📚 **知识管理**：
- 知识分类和标签体系
- 学习路径规划
- 知识图谱构建
- 相关推荐算法

🎯 **价值创造**：
- 帮助用户发现新的学习方向
- 建立知识间的有机联系
- 提供个性化的知识推荐
- 促进深度学习和理解

请运用你的专业知识，为用户构建有价值的知识网络。`,
      tools: [
        new KnowledgeConnectionTool()
      ],
      temperature: 0.4, // 中等温度平衡创新和准确性
      memory: true
    }
    
    super(config)
  }

  // 专门的知识关联方法
  async analyzeKnowledgeConnections(content: string, tags: string[]): Promise<any> {
    const prompt = `请分析以下内容的知识关联：

内容：${content.slice(0, 500)}...
现有标签：${tags.join(', ')}

请进行以下分析：
1. 识别核心概念和主题
2. 发现与其他知识领域的关联
3. 建议相关的学习资源
4. 构建简单的知识图谱
5. 提供个性化的学习建议

请确保分析的深度和实用性。`

    const result = await this.execute(prompt)
    return result
  }
}

// 质量保证专家Agent
export class QualityAssuranceAgent extends LangChainAgent {
  constructor(model: LangChainAgentConfig['model'] = 'gpt-4') {
    const config: LangChainAgentConfig = {
      name: 'QualityAssuranceAgent',
      description: '质量保证专家，负责内容审核、质量评估和优化建议',
      model,
      systemPrompt: `你是一位严谨的质量保证专家，职责包括：

✅ **质量标准**：
- 内容准确性和可信度
- 信息完整性和逻辑性
- 表达清晰度和可读性
- 价值密度和实用性

🔍 **审核维度**：
- 事实核查和来源验证
- 逻辑结构和论证质量
- 语言表达和用词准确性
- 目标受众适配度

📊 **评估指标**：
- 内容质量评分（1-10分）
- 改进建议的具体性
- 风险点识别和预警
- 优化方案的可行性

🎯 **输出要求**：
- 提供详细的质量报告
- 给出具体的改进建议
- 标识潜在的问题点
- 确保最终输出的专业性

请保持高标准的质量要求，确保每个输出都达到专业水准。`,
      tools: [],
      temperature: 0.2, // 最低温度确保严谨性
      memory: true
    }
    
    super(config)
  }

  // 专门的质量评估方法
  async assessQuality(content: any): Promise<any> {
    const prompt = `请对以下内容进行全面的质量评估：

${JSON.stringify(content, null, 2)}

评估维度：
1. 内容准确性和可信度
2. 信息完整性和结构性
3. 表达清晰度和专业性
4. 用户价值和实用性
5. 技术实现质量

请提供：
- 详细的质量评分（各维度1-10分）
- 具体的改进建议
- 潜在风险点识别
- 优化方案推荐

请确保评估的客观性和建设性。`

    const result = await this.execute(prompt)
    return result
  }
}

// Agent工厂
export class ModernAgentFactory {
  static createContentResearcher(model?: LangChainAgentConfig['model']) {
    return new ContentResearchAgent(model)
  }

  static createCreativeDesigner(model?: LangChainAgentConfig['model']) {
    return new CreativeDesignerAgent(model)
  }

  static createKnowledgeArchitect(model?: LangChainAgentConfig['model']) {
    return new KnowledgeArchitectAgent(model)
  }

  static createQualityAssurance(model?: LangChainAgentConfig['model']) {
    return new QualityAssuranceAgent(model)
  }

  static createAllAgents(model?: LangChainAgentConfig['model']) {
    return {
      researcher: this.createContentResearcher(model),
      designer: this.createCreativeDesigner(model),
      architect: this.createKnowledgeArchitect(model),
      qa: this.createQualityAssurance(model)
    }
  }
}
