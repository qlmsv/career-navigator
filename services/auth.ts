import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export const signUp = async (email: string, password: string, metadata?: any) => {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    })

    if (error) {
      logger.error('SignUp error:', error)
      return { data: null, error }
    }

    logger.info('User signed up successfully:', data.user?.email)
    return { data, error: null }
  } catch (error) {
    logger.error('SignUp failed:', error)
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logger.error('SignIn error:', error)
      return { data: null, error }
    }

    logger.info('User signed in successfully:', data.user?.email)
    return { data, error: null }
  } catch (error) {
    logger.error('SignIn failed:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  const supabase = createClient()
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      logger.error('SignOut error:', error)
      return { error }
    }

    logger.info('User signed out successfully')
    return { error: null }
  } catch (error) {
    logger.error('SignOut failed:', error)
    return { error }
  }
}
