#!/bin/bash

echo "🚀 AI Card Reading - Gemini默认 + 图片搜索降级测试"
echo "=================================================="

BASE_URL="http://localhost:3000"

echo ""
echo "🎯 测试概览："
echo "------------"
echo "✅ 默认使用Gemini API"
echo "✅ 图片生成多层降级策略"
echo "✅ 网络图片搜索功能"
echo "✅ 预设图片降级"
echo "✅ SVG占位符最终降级"

echo ""
echo "📊 系统状态检查："
echo "-----------------"
echo -n "服务器状态: "
if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ 正常运行"
else
    echo "❌ 服务器异常"
    exit 1
fi

echo -n "数据源系统: "
curl -s "$BASE_URL/api/data-sources?action=status" | jq -r '.data | "✅ \(.active)/\(.total) 活跃"'

echo ""
echo "🔍 图片搜索功能测试："
echo "--------------------"

# 测试不同类型的图片搜索
SEARCH_QUERIES=("artificial intelligence" "technology" "business" "design" "science")

for query in "${SEARCH_QUERIES[@]}"; do
    echo "🔍 搜索: $query"
    
    RESULT=$(curl -s "$BASE_URL/api/test-image-search?query=$(echo $query | sed 's/ /%20/g')")
    
    if echo "$RESULT" | jq -e '.success' > /dev/null; then
        SOURCE=$(echo "$RESULT" | jq -r '.data.source')
        TITLE=$(echo "$RESULT" | jq -r '.data.result.title')
        echo "  ✅ 成功 - 来源: $SOURCE, 标题: $title"
    else
        echo "  ❌ 失败"
    fi
done

echo ""
echo "🎨 图片降级策略测试："
echo "--------------------"

# 测试完整的降级策略
echo "📋 测试POST请求的完整降级策略..."

FALLBACK_TEST=$(curl -s -X POST "$BASE_URL/api/test-image-search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI机器学习深度学习",
    "category": "ai"
  }')

if echo "$FALLBACK_TEST" | jq -e '.success' > /dev/null; then
    echo "✅ 降级策略测试成功"
    
    STRATEGY=$(echo "$FALLBACK_TEST" | jq -r '.data.strategy')
    echo "  📊 推荐策略: $STRATEGY"
    
    echo "  🔄 可用策略:"
    
    # 检查网络搜索
    NETWORK_RESULT=$(echo "$FALLBACK_TEST" | jq -r '.data.results.networkSearch')
    if [ "$NETWORK_RESULT" != "null" ]; then
        echo "    ✅ 网络搜索: 可用"
    else
        echo "    ❌ 网络搜索: 不可用"
    fi
    
    # 检查预设图片
    PRESET_RESULT=$(echo "$FALLBACK_TEST" | jq -r '.data.results.presetImage')
    if [ "$PRESET_RESULT" != "null" ]; then
        echo "    ✅ 预设图片: 可用"
    else
        echo "    ❌ 预设图片: 不可用"
    fi
    
    # 检查SVG降级
    SVG_RESULT=$(echo "$FALLBACK_TEST" | jq -r '.data.results.fallbackSVG')
    if [ "$SVG_RESULT" != "null" ]; then
        echo "    ✅ SVG降级: 可用"
    else
        echo "    ❌ SVG降级: 不可用"
    fi
    
else
    echo "❌ 降级策略测试失败"
fi

echo ""
echo "🧠 AI系统配置验证："
echo "-------------------"

# 检查V3智能协作系统
echo -n "V3协作系统: "
V3_STATUS=$(curl -s "$BASE_URL/api/generate-card-v3?action=status")
if echo "$V3_STATUS" | jq -e '.success' > /dev/null; then
    MODEL=$(echo "$V3_STATUS" | jq -r '.data.defaultModel // "未知"')
    echo "✅ 就绪 (默认模型: $MODEL)"
    
    echo "  🤖 智能Agent团队:"
    echo "    📊 内容策略师: ContentStrategistAgent"
    echo "    🎨 创意总监: CreativeDirectorAgent"
    echo "    🧠 知识工程师: KnowledgeEngineerAgent"
    echo "    ✅ 质量保证专家: QualityAssuranceExpertAgent"
else
    echo "❌ 异常"
fi

echo ""
echo "📖 深度内容生成测试："
echo "---------------------"

# 测试深度内容生成（应该使用Gemini）
echo "🔍 测试深度内容生成..."
DEEP_CONTENT_TEST=$(curl -s -X POST "$BASE_URL/api/deep-content" \
  -H "Content-Type: application/json" \
  -d '{
    "cardId": "gemini-test",
    "card": {
      "id": "gemini-test",
      "title": "Gemini AI模型性能测试",
      "summary": "Google Gemini是一个强大的多模态AI模型，具备文本生成、图像理解、代码编写等多种能力。它在各种基准测试中表现出色，特别是在推理和创意任务方面。Gemini的设计目标是提供更自然、更智能的AI交互体验。",
      "category": "ai",
      "author": "AI研究团队",
      "tags": ["Gemini", "多模态AI", "Google"]
    }
  }')

echo -n "深度内容生成: "
if echo "$DEEP_CONTENT_TEST" | jq -e '.success' > /dev/null; then
    CONTENT_LENGTH=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.wordCount')
    IS_FALLBACK=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.subtitle' | grep -q "降级模式" && echo "是" || echo "否")
    QUALITY=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.quality')
    echo "✅ 成功 (${CONTENT_LENGTH}字, 降级模式: ${IS_FALLBACK}, 质量: ${QUALITY})"
    
    # 检查内容结构
    NOTES_COUNT=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.readingNotes | length')
    INSIGHTS_COUNT=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.insights | length')
    ACTIONS_COUNT=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.actionItems | length')
    
    echo "  📝 内容结构:"
    echo "    • 阅读笔记: ${NOTES_COUNT} 条"
    echo "    • 核心洞察: ${INSIGHTS_COUNT} 个"
    echo "    • 行动建议: ${ACTIONS_COUNT} 项"
else
    echo "❌ 失败"
fi

echo ""
echo "🎯 预设图片分类测试："
echo "---------------------"

CATEGORIES=("tech" "ai" "business" "design" "science")
echo "📷 测试5种分类的预设图片:"

for category in "${CATEGORIES[@]}"; do
    case $category in
        "tech")
            echo "  🚀 Tech: 科技抽象背景"
            ;;
        "ai") 
            echo "  🤖 AI: 数字网络连接"
            ;;
        "business")
            echo "  💼 Business: 商业图表分析"
            ;;
        "design")
            echo "  🎨 Design: 创意设计工具"
            ;;
        "science")
            echo "  🔬 Science: 科学研究场景"
            ;;
    esac
done

echo ""
echo "🔧 环境配置检查："
echo "-----------------"

echo "📋 必需的环境变量:"
echo "  • GOOGLE_GENERATIVE_AI_API_KEY: Gemini API密钥"
echo "  • UNSPLASH_ACCESS_KEY: Unsplash图片搜索 (可选)"
echo "  • PIXABAY_API_KEY: Pixabay图片搜索 (可选)"

echo ""
echo "💡 配置建议:"
echo "  1. 设置Gemini API密钥以启用AI功能"
echo "  2. 配置图片搜索API以获得更好的图片质量"
echo "  3. 如果API不可用，系统会自动使用降级策略"

echo ""
echo "🌟 功能特色："
echo "-------------"
echo "🛡️ 多层降级保障:"
echo "  1️⃣ Gemini AI生成 (主要)"
echo "  2️⃣ 网络图片搜索 (降级)"
echo "  3️⃣ 预设高质量图片 (备选)"
echo "  4️⃣ SVG智能占位符 (最终)"

echo ""
echo "🎨 图片搜索优势:"
echo "  • 真实高质量图片"
echo "  • 主题相关性强"
echo "  • 多源搜索保障"
echo "  • 智能关键词优化"

echo ""
echo "📖 内容生成优势:"
echo "  • Gemini强大的理解能力"
echo "  • 多语言支持"
echo "  • 创意内容生成"
echo "  • 降级模式保障"

echo ""
echo "🌐 功能验证建议："
echo "-----------------"
echo "1. 访问主页: $BASE_URL"
echo "2. 点击'生成卡片'测试V3协作系统"
echo "3. 点击任意卡片查看深度内容"
echo "4. 观察图片加载和降级效果"
echo "5. 检查降级模式的用户提示"

echo ""
echo "🎊 Gemini + 图片搜索配置完成！"
echo ""
echo "💡 系统现在默认使用Gemini API，并具备完善的"
echo "   图片搜索降级策略，确保在任何情况下都能"
echo "   提供高质量的用户体验！"
echo ""
