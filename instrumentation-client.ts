import * as Sentry from '@sentry/nextjs'

const DEFAULT_TRACES_SAMPLE_RATE = 0.1

function parseSampleRate(value: string | undefined): number {
  if (!value) {
    return DEFAULT_TRACES_SAMPLE_RATE
  }

  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_TRACES_SAMPLE_RATE
  }

  return parsed
}

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NODE_ENV,
  tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  sendDefaultPii: false,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
