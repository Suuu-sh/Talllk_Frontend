'use client'

import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { clearAuthToken, setAuthToken } from '@/lib/authStorage'
import { clerkTokenOptions } from '@/lib/clerkToken'

export default function AuthTokenSync() {
  const { getToken, isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    let cancelled = false

    const syncToken = async () => {
      if (!isLoaded) return
      if (!isSignedIn) {
        clearAuthToken()
        return
      }

      const token = await getToken(clerkTokenOptions())
      if (!cancelled && token) {
        setAuthToken(token)
      }
    }

    syncToken().catch(() => {
      if (!cancelled) clearAuthToken()
    })

    return () => {
      cancelled = true
    }
  }, [getToken, isLoaded, isSignedIn, user?.id])

  return null
}
