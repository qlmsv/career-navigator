'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-browser'
import { logger } from '@/lib/logger'
import type { User } from '@supabase/supabase-js'
import { signIn as svcSignIn, signUp as svcSignUp } from '@/services/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => ReturnType<typeof svcSignIn>
  signUp: (email: string, password: string, metadata?: any) => ReturnType<typeof svcSignUp>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    
    // Initialize session immediately
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          logger.error('Error getting initial session', { error })
        }
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
        setIsInitialized(true)
      } catch (error) {
        logger.error('Error initializing session', { error })
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      setIsInitialized(true)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const isAuthPage = pathname?.startsWith('/auth')
    const isAdminPage = pathname?.startsWith('/admin')

    // Только для админских страниц требуется авторизация
    if (isAdminPage && !session) {
      router.replace('/auth')
      return
    }

    // Если авторизован и на странице авторизации - редирект на главную
    if (session && isAuthPage) {
      router.replace('/')
    }
  }, [session, isInitialized, pathname, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  const signIn = (email: string, password: string) => svcSignIn(email, password)
  const signUp = (email: string, password: string, metadata?: any) =>
    svcSignUp(email, password, metadata)

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      signOut,
      signIn,
      signUp,
    }),
    [user, session, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
