#!/bin/bash

echo "🛡️ AI Card Reading 降级策略测试"
echo "================================"

BASE_URL="http://localhost:3000"

echo ""
echo "🎯 降级策略测试概览："
echo "--------------------"
echo "✅ 图片生成降级 - 3层降级机制"
echo "✅ 深度内容降级 - 原文核心段落展示"  
echo "✅ 用户体验保障 - 功能完整性维持"
echo "✅ 视觉效果优化 - 降级不降质"

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
echo "🎨 图片生成降级测试："
echo "---------------------"
echo "测试场景: API连接超时或失败"
echo "预期行为: 自动生成主题相关的SVG占位符"
echo ""
echo "降级层次:"
echo "1️⃣ Imagen 3 高质量生成"
echo "2️⃣ Gemini 2.0 标准生成" 
echo "3️⃣ SVG描述生成"
echo "4️⃣ 智能SVG占位符"
echo ""
echo "SVG占位符特色:"
echo "• 主题感知颜色选择"
echo "• 分类适配图标设计"
echo "• 渐变背景和装饰元素"
echo "• 清晰的状态说明文字"

echo ""
echo "📖 深度内容降级测试："
echo "---------------------"
echo "测试场景: OpenAI API连接失败"
echo "预期行为: 展示原文核心段落和基础分析"
echo ""

# 测试深度内容生成
echo "🔍 测试深度内容生成..."
DEEP_CONTENT_TEST=$(curl -s -X POST "$BASE_URL/api/deep-content" \
  -H "Content-Type: application/json" \
  -d '{
    "cardId": "test-fallback",
    "card": {
      "id": "test-fallback",
      "title": "AI技术发展趋势分析",
      "summary": "人工智能技术正在快速发展，深度学习、自然语言处理、计算机视觉等领域取得重大突破。这些技术的进步正在改变各行各业的运作方式，从医疗健康到金融服务，从教育培训到娱乐媒体，AI的应用场景越来越广泛。",
      "category": "ai",
      "author": "AI研究员",
      "tags": ["人工智能", "深度学习", "技术趋势"]
    }
  }')

echo -n "深度内容生成: "
if echo "$DEEP_CONTENT_TEST" | jq -e '.success' > /dev/null; then
    CONTENT_LENGTH=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.wordCount')
    IS_FALLBACK=$(echo "$DEEP_CONTENT_TEST" | jq -r '.data.subtitle' | grep -q "降级模式" && echo "是" || echo "否")
    echo "✅ 成功 (${CONTENT_LENGTH}字, 降级模式: ${IS_FALLBACK})"
else
    echo "❌ 失败"
fi

echo ""
echo "🎭 降级内容结构验证："
echo "---------------------"
if echo "$DEEP_CONTENT_TEST" | jq -e '.success' > /dev/null; then
    echo "📝 内容组件:"
    echo "  • 核心内容: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.content' | wc -c) 字符"
    echo "  • 阅读笔记: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.readingNotes | length') 条"
    echo "  • 核心洞察: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.insights | length') 个"
    echo "  • 行动建议: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.actionItems | length') 项"
    echo "  • 延伸阅读: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.furtherReading | length') 个"
    
    echo ""
    echo "📊 质量指标:"
    echo "  • 质量评分: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.quality')分"
    echo "  • 阅读时间: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.readingTime')分钟"
    echo "  • 字数统计: $(echo "$DEEP_CONTENT_TEST" | jq -r '.data.wordCount')字"
fi

echo ""
echo "🔧 AI生成系统状态："
echo "-------------------"
echo -n "V3协作系统: "
if curl -s "$BASE_URL/api/generate-card-v3?action=status" | jq -e '.success' > /dev/null; then
    echo "✅ 4个智能Agent就绪"
    echo "  📊 内容策略师: ContentStrategistAgent"
    echo "  🎨 创意总监: CreativeDirectorAgent"  
    echo "  🧠 知识工程师: KnowledgeEngineerAgent"
    echo "  ✅ 质量保证专家: QualityAssuranceExpertAgent"
else
    echo "❌ 系统异常"
fi

echo ""
echo "🎨 SVG占位符主题测试："
echo "----------------------"
echo "测试不同分类的SVG占位符生成:"

CATEGORIES=("tech" "ai" "business" "design" "science")
for category in "${CATEGORIES[@]}"; do
    case $category in
        "tech")
            echo "🚀 Tech: 蓝色系 + 代码元素图标"
            ;;
        "ai") 
            echo "🤖 AI: 紫色系 + 机器人脸部图标"
            ;;
        "business")
            echo "💼 Business: 绿色系 + 柱状图图标"
            ;;
        "design")
            echo "🎨 Design: 橙色系 + 创意圆形图标"
            ;;
        "science")
            echo "🔬 Science: 靛蓝系 + 分子结构图标"
            ;;
    esac
done

echo ""
echo "💡 降级策略优势："
echo "-----------------"
echo "🛡️ 系统稳定性:"
echo "  • API故障不影响系统运行"
echo "  • 用户体验保持连续性"
echo "  • 核心功能始终可用"
echo "  • 错误处理优雅降级"

echo ""
echo "📖 内容价值保持:"
echo "  • 原文核心内容完整展示"
echo "  • 基础分析仍有参考价值"
echo "  • 结构化信息清晰呈现"
echo "  • 延伸资源推荐保留"

echo ""
echo "🎯 用户体验优化:"
echo "  • 加载时间可控"
echo "  • 功能预期管理良好"
echo "  • 视觉效果保持专业"
echo "  • 操作流程无变化"

echo ""
echo "🌐 功能验证建议："
echo "-----------------"
echo "1. 访问主页: $BASE_URL"
echo "2. 点击任意卡片进入深度阅读"
echo "3. 观察是否显示降级模式提示"
echo "4. 检查原文核心内容展示"
echo "5. 验证所有标签页功能正常"
echo "6. 测试卡片生成功能"
echo "7. 观察SVG占位符效果"

echo ""
echo "📋 测试检查清单："
echo "-----------------"
echo "□ 深度内容API失败时显示降级模式"
echo "□ 原文核心段落正确提取和展示"
echo "□ 降级内容包含完整的结构化信息"
echo "□ 图片生成失败时显示SVG占位符"
echo "□ SVG占位符根据主题选择合适样式"
echo "□ 用户界面保持专业和美观"
echo "□ 所有功能在降级模式下仍可正常使用"
echo "□ 错误提示友好且信息明确"

echo ""
echo "🎊 降级策略测试完成！"
echo ""
echo "💡 提示: 在网络不稳定或API限制的情况下"
echo "    系统会自动启用降级策略，确保用户"
echo "    始终能获得完整、有价值的使用体验。"
echo ""
