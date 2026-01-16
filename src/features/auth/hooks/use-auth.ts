'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase'
import { useAuthStore } from '../store'
import type { User } from '@/shared/types'

export function useAuth() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)
  const storeLogout = useAuthStore((state) => state.logout)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const fetchUserProfile = async (userId: string): Promise<User | null> => {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      return profile as User | null
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!isMounted) return

        if (authUser) {
          const profile = await fetchUserProfile(authUser.id)
          if (isMounted) {
            setUser(profile)
            setIsLoading(false)
          }
        } else {
          if (isMounted) {
            setUser(null)
            setIsLoading(false)
          }
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          return
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile && isMounted) {
            setUser(profile)
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
