#!/bin/bash

echo "🧪 测试AI Card Reading高级功能"
echo "================================"

BASE_URL="http://localhost:3000"

echo ""
echo "1. 📊 测试数据源状态"
echo "-------------------"
curl -s "$BASE_URL/api/data-sources?action=status" | jq '.data'

echo ""
echo "2. 📰 测试最新内容获取"
echo "-------------------"
curl -s "$BASE_URL/api/data-sources?action=latest&limit=2" | jq '.data[] | {title, category, trending}'

echo ""
echo "3. 🔥 测试热门内容"
echo "-------------------"
curl -s "$BASE_URL/api/data-sources?action=trending&limit=2" | jq '.data[] | {title, trending}'

echo ""
echo "4. 💬 测试评论系统"
echo "-------------------"
curl -s "$BASE_URL/api/comments?cardId=test-card&action=mock" | jq '.data | length'
echo "生成的评论数量: $(curl -s "$BASE_URL/api/comments?cardId=test-card&action=list" | jq '.data.comments | length')"

echo ""
echo "5. 📈 测试评论统计"
echo "-------------------"
curl -s "$BASE_URL/api/comments?cardId=test-card&action=stats" | jq '.data | {totalComments, averageRating}'

echo ""
echo "6. 🧠 测试智能Agent状态"
echo "-------------------"
curl -s "$BASE_URL/api/generate-card-v3?action=status" | jq '.data.agentTeam | length'

echo ""
echo "7. 🎯 测试深度内容缓存"
echo "-------------------"
curl -s "$BASE_URL/api/deep-content?action=stats" | jq '.data'

echo ""
echo "✅ 所有功能测试完成！"
echo ""
echo "🌐 访问主页: $BASE_URL"
echo "📱 功能特性:"
echo "   - 定时数据源更新 (每小时)"
echo "   - 用户评论和回复系统"
echo "   - 高级卡片UI设计"
echo "   - 深度内容扩展"
echo "   - 智能Agent协作"
echo ""
