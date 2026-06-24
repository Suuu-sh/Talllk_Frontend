const productionDefaultTemplate = 'talllk_backend'

export const clerkJwtTemplate =
  process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim() ||
  (process.env.NODE_ENV === 'production' ? productionDefaultTemplate : '')

export const clerkTokenOptions = (): { template: string } | undefined => {
  return clerkJwtTemplate ? { template: clerkJwtTemplate } : undefined
}
