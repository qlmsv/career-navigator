'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
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
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    
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
      } catch (error) {
        logger.error('Error initializing session', { error })
        setIsLoading(false)
      }
    }

    initializeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname?.startsWith('/auth')
    const isHomePage = pathname === '/'
    const isOnboardingPage = pathname === '/onboarding'

    if (!session) {
      if (!isAuthPage && !isHomePage) {
        router.replace('/auth')
      }
      return
    }

    if (session && (isAuthPage || isHomePage)) {
      // Check if user needs onboarding - only on client side
      if (typeof window !== 'undefined') {
        const onboardingCompleted = localStorage.getItem('onboarding_completed')
        if (!onboardingCompleted && !isOnboardingPage) {
          router.replace('/onboarding')
        } else if (onboardingCompleted || isOnboardingPage) {
          router.replace('/dashboard')
        }
      }
    }
  }, [session, isLoading, pathname, router])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  const signIn = (email: string, password: string) => svcSignIn(email, password)
  const signUp = (email: string, password: string, metadata?: any) =>
    svcSignUp(email, password, metadata)

  const value = {
    user,
    session,
    isLoading,
    signOut,
    signIn,
    signUp,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
