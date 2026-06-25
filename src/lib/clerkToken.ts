const productionDefaultTemplate = 'talllk_backend'

export type ClerkTokenOptions = {
  template?: string
  skipCache?: boolean
}

export const clerkJwtTemplate =
  process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE?.trim() ||
  (process.env.NODE_ENV === 'production' ? productionDefaultTemplate : '')

export const clerkTokenOptions = (
  overrides: ClerkTokenOptions = {}
): ClerkTokenOptions | undefined => {
  const options: ClerkTokenOptions = { ...overrides }
  if (clerkJwtTemplate) {
    options.template = clerkJwtTemplate
  }
  return Object.keys(options).length > 0 ? options : undefined
}
