'use client'

import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/analytics'
import { PageViewTracker } from '@/components/analytics/PageViewTracker'
import { UtmTracker } from '@/components/analytics/UtmTracker'

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <UtmTracker />
      <PageViewTracker />
    </>
  )
}
