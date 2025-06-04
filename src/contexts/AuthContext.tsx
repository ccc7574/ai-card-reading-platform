'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查supabase是否可用
    if (!supabase) {
      console.warn('Supabase未配置，认证功能不可用')
      setLoading(false)
      return
    }

    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('获取会话失败:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // 当用户首次注册时，创建用户记录
        if (event === 'SIGNED_UP' && session?.user) {
          await createUserProfile(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 创建用户档案
  const createUserProfile = async (user: User) => {
    if (!supabase) {
      console.warn('Supabase未配置，无法创建用户档案')
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            preferences: {
              theme: 'light',
              language: 'zh-CN',
              notifications: true
            }
          }
        ])

      if (error) {
        console.error('Error creating user profile:', error)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  // 邮箱密码登录
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase未配置，认证功能不可用' } }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  // 邮箱密码注册
  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase未配置，认证功能不可用' } }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { error }
  }

  // 登出
  const signOut = async () => {
    if (!supabase) {
      console.warn('Supabase未配置，无法登出')
      return
    }
    await supabase.auth.signOut()
  }

  // Google登录
  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: { message: 'Supabase未配置，认证功能不可用' } }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 认证守卫组件
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">请先登录</h2>
            <p className="mt-2 text-gray-600">您需要登录才能访问此页面</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
