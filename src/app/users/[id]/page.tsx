'use client'

import { useParams } from 'next/navigation'
import UserProfileModal from '@/components/UserProfileModal'

export default function UserProfilePage() {
  const params = useParams()
  const rawId = params?.id
  const userId = Array.isArray(rawId) ? rawId[0] : rawId?.toString()
  return <UserProfileModal mode="user" userId={userId} />
}
