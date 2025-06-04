'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { 
  Globe, 
  Check, 
  ChevronDown 
} from 'lucide-react'
import { locales, localeConfig, type Locale } from '@/i18n/config'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'dropdown' | 'inline'
}

export function LanguageSwitcher({ 
  className = '', 
  variant = 'dropdown' 
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale() as Locale
  const t = useTranslations('header')

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) return

    startTransition(() => {
      // 替换当前路径中的语言代码
      const segments = pathname.split('/')
      segments[1] = newLocale
      const newPath = segments.join('/')
      
      router.push(newPath)
      setIsOpen(false)
    })
  }

  const currentLanguage = localeConfig[locale]

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {locales.map((lang) => {
          const config = localeConfig[lang]
          const isActive = lang === locale
          
          return (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              disabled={isPending}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="mr-1">{config.flag}</span>
              {config.name}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isOpen
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={t('languageSwitch')}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              {t('languageSwitch')}
            </div>
            
            {locales.map((lang) => {
              const config = localeConfig[lang]
              const isActive = lang === locale
              
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={isPending}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{config.flag}</span>
                    <span className="font-medium">{config.name}</span>
                  </div>
                  
                  {isActive && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              )
            })}
            
            {isPending && (
              <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>切换中...</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher
