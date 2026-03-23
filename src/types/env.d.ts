declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string
    NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string
    NEXT_PUBLIC_SUPABASE_URL?: string
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
    NEXT_PUBLIC_SENTRY_DSN?: string
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE?: string
    SENTRY_DSN?: string
    SENTRY_TRACES_SAMPLE_RATE?: string
    SENTRY_AUTH_TOKEN?: string
  }
}
