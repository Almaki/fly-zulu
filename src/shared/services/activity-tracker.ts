'use server'

import { createServerSupabaseClient } from '@/shared/lib/supabase/server'

interface ActivityParams {
  location?: string
  latitude?: number
  longitude?: number
}

export async function updateUserActivity(params?: ActivityParams): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: null } // Silently ignore if not authenticated
    }

    // Call the database function to update activity with geolocation
    const { error } = await supabase.rpc('update_user_activity', {
      p_user_id: user.id,
      p_location: params?.location || null,
      p_latitude: params?.latitude || null,
      p_longitude: params?.longitude || null,
    })

    if (error) {
      console.error('Error updating user activity:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Error in updateUserActivity:', err)
    return { error: 'Error tracking activity' }
  }
}
