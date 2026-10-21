# Binexa Connect — Official Brand Starter

This is a **branded Next.js UI starter**, not yet a production community. It includes public-facing previews of Home, Explore, Discussions, Resources, Events, and Join. Signups, posts, comments, RSVPs, and administration require backend work; none are deceptively simulated as saved.

## Brand assets
- `/public/brand/binexa-favicon.png` from uploaded Binexa Health storefront favicon
- `/public/brand/binexa-logo.png` from uploaded official Binexa Health storefront logo (preserved as supplied)
- CSS follows uploaded Binexa Health Brand Color and Typography Template.
- Deep Navy `#082B50`, Gold `#D39A22`, Dark Navy `#071E38`, Soft Ivory `#FAF8F3`, White `#FFFFFF`, Champagne Gold `#E8C76A`, Slate `#667786`, Cool Gray `#E5E9EC`.
- Font: Manrope with documented fallbacks.
- 60% white/ivory, 30% navy, 10% gold design principle.

## Run locally
Requires supported Node.js LTS and npm.

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Next implementation milestones
1. Supabase project, authenticated sessions, and tested Row Level Security policies.
2. Database migrations for profiles, categories, posts, comments, events, reports and preferences.
3. Member onboarding and privacy notices/consent; enforce default `member` role on server.
4. Moderated posting/replies and audit trails.
5. Events and resource publishing workflows.
6. Email subscriptions with explicit consent and unsubscribe controls.
7. CI testing, accessibility, abuse prevention, privacy and security review.
8. Deploy to Vercel and configure `community.binexahealth.com` when authorized.

## Healthcare considerations
Educational community only. No medical advice, diagnosis, prescriptions, protected health information, or patient portal integrations. Perform privacy/legal/security reviews before collecting member data or launching health-oriented community discussions.
