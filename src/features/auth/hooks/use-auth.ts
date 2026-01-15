'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase'
import { useAuthStore } from '../store'
import type { User } from '@/shared/types'

export function useAuth() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: storeLogout } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profile) {
            setUser(profile as User)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          return
        }

        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser(profile as User)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    storeLogout()
    router.push('/login')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  }
}
