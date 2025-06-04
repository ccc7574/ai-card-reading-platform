#!/bin/bash

# 🚀 AI Card Reading Platform - GitHub推送脚本
# 用户: ccc7574
# 仓库: ai-card-reading-platform

echo "🚀 开始推送AI卡片阅读平台到GitHub..."
echo "👤 用户: ccc7574"
echo "📦 仓库: ai-card-reading-platform"
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录执行此脚本"
    exit 1
fi

# 检查Git状态
echo "📊 检查Git状态..."
git status

echo ""
echo "🔗 推送到GitHub..."
echo "📍 远程仓库: https://github.com/ccc7574/ai-card-reading-platform.git"

# 推送代码
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 推送成功！"
    echo ""
    echo "🌟 您的AI卡片阅读平台现在可以在以下地址访问："
    echo "📍 GitHub仓库: https://github.com/ccc7574/ai-card-reading-platform"
    echo ""
    echo "✨ 项目亮点:"
    echo "  🤖 18个AI Agent系统"
    echo "  🎨 12种渐变配色设计"
    echo "  🌍 4种语言支持 (中英日韩)"
    echo "  📱 PWA离线功能"
    echo "  ⚡ 实时交互系统"
    echo "  🔐 完整认证系统"
    echo "  📊 18/18数据表部署"
    echo ""
    echo "🚀 下一步建议:"
    echo "  1. 在GitHub上添加项目标签 (Topics)"
    echo "  2. 部署到Vercel: vercel --prod"
    echo "  3. 设置环境变量"
    echo "  4. 邀请协作者"
    echo ""
    echo "🎯 推荐标签: ai, nextjs, typescript, supabase, tailwindcss, pwa, multilingual, agentic-rag"
else
    echo ""
    echo "❌ 推送失败！"
    echo "💡 可能的原因:"
    echo "  1. 仓库尚未在GitHub上创建"
    echo "  2. 需要GitHub认证"
    echo "  3. 网络连接问题"
    echo ""
    echo "🔧 解决方案:"
    echo "  1. 确保在GitHub上创建了仓库: ai-card-reading-platform"
    echo "  2. 检查GitHub认证: git config --global user.name"
    echo "  3. 重试推送: git push -u origin main"
fi
