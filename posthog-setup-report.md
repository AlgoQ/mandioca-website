# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Mandioca Hostel website. This integration includes:

- **Client-side tracking** via `instrumentation-client.ts` for automatic pageviews, session replay, and exception capture
- **Server-side tracking** via `posthog-node` for critical business events (payments, checkout, admin login)
- **Reverse proxy configuration** in `next.config.ts` to improve tracking reliability and bypass ad blockers
- **13 custom events** tracking the complete booking funnel from room selection to payment completion
- **User identification** for admin users on login
- **Error tracking** with `captureException` for checkout and booking errors

## Events Implemented

| Event Name | Description | File |
|------------|-------------|------|
| `room_selected` | User selected a room type in the booking form | `src/components/booking/BookingForm.tsx` |
| `checkout_started` | User initiated checkout flow to pay with Stripe | `src/components/booking/BookingForm.tsx` |
| `booking_form_submitted` | User submitted a booking form (pay later option) | `src/components/booking/BookingForm.tsx` |
| `contact_form_submitted` | User submitted the contact form | `src/components/sections/Contact.tsx` |
| `whatsapp_clicked` | User clicked the floating WhatsApp button | `src/components/ui/WhatsAppButton.tsx` |
| `cta_clicked` | User clicked a CTA button in the hero section | `src/components/sections/Hero.tsx` |
| `room_card_clicked` | User clicked to book a specific room from the rooms section | `src/components/sections/Rooms.tsx` |
| `checkout_created` | Server-side: Stripe checkout session was created | `src/app/api/checkout/route.ts` |
| `payment_completed` | Server-side: Stripe webhook confirmed payment was successful | `src/app/api/webhooks/stripe/route.ts` |
| `payment_failed` | Server-side: Payment failed or checkout expired | `src/app/api/webhooks/stripe/route.ts` |
| `admin_login_success` | Admin user logged in successfully | `src/app/api/admin/login/route.ts` |
| `admin_login_failed` | Admin login attempt failed | `src/app/api/admin/login/route.ts` |
| `booking_success_viewed` | User viewed the booking success/confirmation page | `src/app/booking/success/page.tsx` |

## Files Created/Modified

### New Files
- `instrumentation-client.ts` - Client-side PostHog initialization
- `src/lib/posthog-server.ts` - Server-side PostHog client

### Modified Files
- `.env` - Added PostHog environment variables
- `next.config.ts` - Added reverse proxy rewrites for PostHog
- `src/components/booking/BookingForm.tsx` - Added booking events
- `src/components/sections/Contact.tsx` - Added contact form event
- `src/components/ui/WhatsAppButton.tsx` - Added WhatsApp click event
- `src/components/sections/Hero.tsx` - Added CTA click events
- `src/components/sections/Rooms.tsx` - Added room card click event
- `src/app/api/checkout/route.ts` - Added server-side checkout event
- `src/app/api/webhooks/stripe/route.ts` - Added payment events
- `src/app/api/admin/login/route.ts` - Added admin login events
- `src/app/booking/success/page.tsx` - Added success page view event

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/302967/dashboard/1186407) - Core analytics dashboard with booking funnel, engagement metrics, and revenue tracking

### Insights
- [Booking Funnel](https://us.posthog.com/project/302967/insights/DboxMTFw) - Conversion funnel from room selection to payment completion
- [CTA & Engagement Events](https://us.posthog.com/project/302967/insights/zlJKAK0u) - Track user engagement with CTAs, WhatsApp, and contact forms
- [Payment Success vs Failure](https://us.posthog.com/project/302967/insights/XPvOy9Su) - Compare successful payments against failed/expired checkouts
- [Booking Revenue](https://us.posthog.com/project/302967/insights/1XiAKr4G) - Total booking revenue from completed payments
- [Room Type Popularity](https://us.posthog.com/project/302967/insights/zVkk0z90) - Which room types are most frequently selected

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

## Environment Variables

Make sure these environment variables are set in your production environment:

```
NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-project-api-key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```
