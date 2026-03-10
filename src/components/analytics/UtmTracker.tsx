'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { captureUtmFromSearch } from '@/lib/analytics'

export function UtmTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    captureUtmFromSearch(searchParams)
  }, [searchParams])

  return null
}
