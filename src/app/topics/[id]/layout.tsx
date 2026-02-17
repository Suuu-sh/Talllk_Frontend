import type { ReactNode } from 'react'

export const runtime = 'edge'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return children
}
