# Talllk_Frontend

## GA4 setup

1. Create a Web data stream in GA4 and copy the Measurement ID (`G-XXXXXXX`).
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`.
3. Restart the frontend process.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
```

## Events sent by default

- `page_view` (on route changes)
- `lp_cta_click` (landing primary CTA)
- `lp_login_click` (landing login CTA)
- `sign_up` (successful registration)
- `login` (successful login)
- `sign_up_failed` / `login_failed` (failed auth attempts)

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) are captured from the URL and attached to subsequent events.
