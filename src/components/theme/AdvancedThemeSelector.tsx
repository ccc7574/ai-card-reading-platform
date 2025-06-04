'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Sparkles, 
  Leaf, 
  Zap, 
  Heart,
  Check,
  Settings
} from 'lucide-react'

interface Theme {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  preview: string
}

const themes: Theme[] = [
  {
    id: 'light',
    name: '经典浅色',
    description: '清新明亮的经典主题',
    icon: <Sun className="w-4 h-4" />,
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b'
    },
    preview: 'bg-gradient-to-br from-blue-50 to-cyan-50'
  },
  {
    id: 'dark',
    name: '深邃暗色',
    description: '护眼的深色主题',
    icon: <Moon className="w-4 h-4" />,
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9'
    },
    preview: 'bg-gradient-to-br from-slate-800 to-slate-900'
  },
  {
    id: 'auto',
    name: '智能切换',
    description: '跟随系统主题自动切换',
    icon: <Monitor className="w-4 h-4" />,
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#c084fc',
      background: 'auto',
      surface: 'auto',
      text: 'auto'
    },
    preview: 'bg-gradient-to-br from-purple-100 to-purple-200'
  },
  {
    id: 'nature',
    name: '自然绿意',
    description: '清新自然的绿色主题',
    icon: <Leaf className="w-4 h-4" />,
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#34d399',
      background: '#f0fdf4',
      surface: '#ecfdf5',
      text: '#064e3b'
    },
    preview: 'bg-gradient-to-br from-green-50 to-emerald-100'
  },
  {
    id: 'energy',
    name: '活力橙色',
    description: '充满活力的橙色主题',
    icon: <Zap className="w-4 h-4" />,
    colors: {
      primary: '#f97316',
      secondary: '#78716c',
      accent: '#fb923c',
      background: '#fffbeb',
      surface: '#fef3c7',
      text: '#9a3412'
    },
    preview: 'bg-gradient-to-br from-orange-50 to-amber-100'
  },
  {
    id: 'romantic',
    name: '浪漫粉色',
    description: '温柔浪漫的粉色主题',
    icon: <Heart className="w-4 h-4" />,
    colors: {
      primary: '#ec4899',
      secondary: '#9ca3af',
      accent: '#f472b6',
      background: '#fdf2f8',
      surface: '#fce7f3',
      text: '#831843'
    },
    preview: 'bg-gradient-to-br from-pink-50 to-rose-100'
  },
  {
    id: 'premium',
    name: '高端紫色',
    description: '奢华高端的紫色主题',
    icon: <Sparkles className="w-4 h-4" />,
    colors: {
      primary: '#8b5cf6',
      secondary: '#6b7280',
      accent: '#a78bfa',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87'
    },
    preview: 'bg-gradient-to-br from-purple-50 to-violet-100'
  }
]

interface AdvancedThemeSelectorProps {
  currentTheme: string
  onThemeChange: (themeId: string) => void
  isOpen: boolean
  onClose: () => void
}

export function AdvancedThemeSelector({ 
  currentTheme, 
  onThemeChange, 
  isOpen, 
  onClose 
}: AdvancedThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    onThemeChange(themeId)
  }

  const handleApply = () => {
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* 主题选择器 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* 头部 */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Palette className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">主题设置</h2>
                    <p className="text-sm text-gray-600">选择您喜欢的界面主题</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 主题网格 */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* 主题预览 */}
                    <div className={`w-full h-20 rounded-lg mb-3 ${theme.preview} relative overflow-hidden`}>
                      <div className="absolute inset-2 bg-white/20 rounded backdrop-blur-sm">
                        <div className="p-2">
                          <div className="w-full h-2 bg-white/40 rounded mb-1" />
                          <div className="w-3/4 h-2 bg-white/30 rounded mb-1" />
                          <div className="w-1/2 h-2 bg-white/20 rounded" />
                        </div>
                      </div>
                      
                      {/* 选中指示器 */}
                      {selectedTheme === theme.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* 主题信息 */}
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {theme.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{theme.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                      </div>
                    </div>

                    {/* 颜色预览 */}
                    <div className="flex items-center space-x-1 mt-3">
                      {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ 
                            backgroundColor: color === 'auto' ? '#8b5cf6' : color 
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 底部操作 */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  当前选择：<span className="font-medium">
                    {themes.find(t => t.id === selectedTheme)?.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    取消
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApply}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    应用主题
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 主题切换按钮组件
export function ThemeToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title="切换主题"
    >
      <Palette className="w-5 h-5 text-gray-600" />
    </motion.button>
  )
}
