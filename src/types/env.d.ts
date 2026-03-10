declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
    NEXT_PUBLIC_SENTRY_DSN?: string
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE?: string
    SENTRY_DSN?: string
    SENTRY_TRACES_SAMPLE_RATE?: string
    SENTRY_AUTH_TOKEN?: string
  }
}
