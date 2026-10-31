# Binexa Connect custom-domain migration

Status: **local preparation only**. No DNS, registrar, Vercel domain assignment,
production environment variable, Supabase dashboard, Discord dashboard, GitHub push,
or deployment has been performed for this migration.

## What stays the same

- Existing Vercel project: `binexa-connect-2`.
- Existing production address: `https://binexa-connect-2.vercel.app`.
- Existing Supabase project, users, database, policies, and membership records.
- Existing Discord application, bot, guild, and credentials.
- Homepage design, branding, images, content, and navigation.
- Access behavior: the homepage is a public preview; community tabs and full
  resources require a Supabase session. Discord joining remains optional for
  website access; its joining/verification flow and records are preserved.
- Local `.env.local`: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

## Local code changes

| File | Purpose |
| --- | --- |
| `lib/site-origin.ts` | Validates canonical/auth origins and implements the disabled legacy-host redirect policy. |
| `middleware.ts` | Runs the gated redirect before the existing Supabase session refresh. |
| `components/AuthPopup.tsx` | Builds the email confirmation URL from a trusted originating host. |
| `app/auth/confirm/route.ts` | Validates the confirmation host and finishes confirmation on that same host. |
| `app/api/discord/connect/route.ts` | Validates the originating host before generating OAuth state and the callback URI. |
| `app/api/discord/callback/route.ts` | Uses the same approved host when exchanging the code and completing OAuth. |
| `lib/discord/server.ts` | Reuses the shared origin validator rather than a separate parser. |
| `app/layout.tsx` | Sets `metadataBase` from the validated canonical environment URL. |
| Community route pages and `resources/[slug]/page.tsx` | Adds page-specific canonical paths, including separate article canonicals. |
| `tests/site-origin.test.mjs` | Exercises origins, callback preservation, QR paths/queries, session exceptions, and redirect-loop prevention. |

Canonical origin follows `NEXT_PUBLIC_SITE_URL`. It does **not** silently switch
production to the new domain. If that setting is missing, the existing Vercel
production address remains the production fallback. A local development fallback
uses port 3000. No sitemap or robots file existed; none is introduced.

Authentication remains on the originating host for the apex custom domain, its
`www` host, and the old Vercel hostname. Development accepts loopback hosts. Server
routes can additionally recognize the exact Vercel deployment host supplied by
`VERCEL_URL`; this does not allow arbitrary `*.vercel.app` authentication origins.
Other preview hosts require separate planning and matching dashboard allowlists.

## 1. Confirm the printed QR destination — required before enabling redirects

The provided screenshot is a migration diagram, not the original flyer. No flyer
or QR-code image was found in the repository. **Its exact QR destination is not
verified.** Provide the original flyer image, a clear QR crop, or the exact decoded
URL. Do not assume the homepage is encoded.

- If it uses the old Vercel hostname, keep that domain attached to this project.
- Preserve any path and tracking/query parameters.
- If it points to Discord or another external service, leave that QR destination
  unchanged; migrating this website does not change the encoded URL.
- If a URL shortener is involved, inspect its existing destination before changing
  any redirect. Do not replace or delete it.

The legacy redirect is disabled unless the server-side flag is explicitly set to
`ENABLE_LEGACY_DOMAIN_REDIRECT=true`. Do not enable it until the QR destination is
known and the new domain, HTTPS, and authentication have been tested.

## 2. Vercel domain setup — dashboard action, not performed

1. Open the existing project:
   https://vercel.com/rashmithimmaraju14-7760s-projects/binexa-connect-2
2. Go to **Settings → Domains**.
3. Add `binexaconnect.com` and `www.binexaconnect.com` to this same project.
4. Use `binexaconnect.com` as the intended primary production domain. Do not accept
   a redirect in the opposite direction merely because it is suggested.
5. Keep `binexa-connect-2.vercel.app` attached and serving this deployment.
6. Copy the **exact records and verification instructions Vercel displays** for
   each hostname. Do not infer DNS values from examples in documentation.
7. Initially ensure the new apex domain can serve the site. After its testing,
   configure `www.binexaconnect.com` to redirect to `binexaconnect.com`.
8. Do not configure an unconditional dashboard redirect for the old Vercel host:
   it would also redirect auth callbacks before the app can preserve their host.
   The gated application middleware handles old-host browser traffic selectively.

## 3. DNS setup — requires separate approval; not performed

Identify the domain's actual DNS provider. It may differ from the registrar.
Record or export existing DNS entries first. At that provider, enter only the
records shown by Vercel, including exact host/name, record type, target/value,
and any verification TXT record. Address conflicting website records only after
review. Preserve email/MX and unrelated DNS records. Do not change nameservers
or transfer the domain as a shortcut.

No DNS IP, CNAME target, or TXT value is supplied here because the project's
required values have not been retrieved from its domain configuration.

Wait for Vercel to confirm successful configuration and HTTPS for both new hosts.
Do not enable old-host redirects while domain verification or TLS is pending.

## 4. Supabase URL configuration — dashboard action, not performed

Reuse the existing project. In **Authentication → URL Configuration**, at cutover:

- Site URL: `https://binexaconnect.com`.
- Preserve and add these redirect allowlist entries as appropriate:
  - `https://binexaconnect.com/**`
  - `https://www.binexaconnect.com/**` while supporting that host
  - `https://binexa-connect-2.vercel.app/**`
  - `http://localhost:3000/**`
  - `http://localhost:3001/**` if still used for development

Keep legacy entries until previously sent emails and old-host flows have been
accounted for. Do not change auth providers, users, or RLS policies.

The current confirmation endpoint expects `token_hash` and `type=email`. Confirm
that **Email Templates → Confirm signup** uses the application's redirect URL:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

The app supplies a confirmation URL without a query string. Using `.RedirectTo`
keeps new and legacy confirmation links on the host where sign-up began. Do not
replace it with an unconditional production host while testing localhost. Password
reset is not implemented; this migration does not introduce or claim to test it.

Cookies are host-scoped. An old-host login is not automatically transferred to
`binexaconnect.com`; users may need to sign in on the new domain. Their accounts
and data remain intact. Do not put session tokens in cross-domain redirect URLs.

## 5. Discord OAuth configuration — dashboard action, not performed

Open the existing Discord application's **OAuth2 → Redirects** and add:

```text
https://binexaconnect.com/api/discord/callback
```

Keep the existing callbacks:

```text
https://binexa-connect-2.vercel.app/api/discord/callback
http://localhost:3000/api/discord/callback
http://localhost:3001/api/discord/callback
```

Add `https://www.binexaconnect.com/api/discord/callback` if authentication is tested
on `www` before its redirect is enabled. Finish any such in-flight transactions
before enabling the unconditional `www` redirect in Vercel.

Save changes in Discord. Keep the existing client ID, client secret, bot token,
guild ID, application, and bot installation unchanged. New flows on the custom
domain use its callback; old-host flows continue using the old callback, with
matching token-exchange URIs and host-scoped state/user cookies.

## 6. Production environment variables — changes require deployment approval

After the new domain and dashboard allowlists are ready, update only the production
site origin in the existing Vercel project:

```dotenv
NEXT_PUBLIC_SITE_URL=https://binexaconnect.com
```

Keep the redirect flag absent or false during this initial migration test:

```dotenv
ENABLE_LEGACY_DOMAIN_REDIRECT=false
```

Leave these credentials unchanged and never print their values:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_BOT_TOKEN
DISCORD_GUILD_ID
```

Do not overwrite local `.env.local`. Keep its port-3000 URL. Do not commit secrets.
Vercel environment changes affect a **new deployment**, not an existing build.
Do not push these changes to a production-connected branch or deploy until approved.

## 7. Enable the old-host redirect — separate final approval

Only after DNS/HTTPS, the exact QR destination, and the test checklist are confirmed:

```dotenv
ENABLE_LEGACY_DOMAIN_REDIRECT=true
```

Redeploy only after approval. The middleware then returns a permanent **308** from
ordinary GET/HEAD requests on exactly `https://binexa-connect-2.vercel.app` to
`https://binexaconnect.com`, preserving the path and query string.

It deliberately does not redirect:

- Localhost, the custom apex, `www`, or unrelated preview hosts.
- API routes, auth/confirmation routes, sign-in/sign-up, Discord onboarding,
  access confirmation, or account routes.
- URLs carrying auth, OAuth, recovery, confirmation, or related error parameters.
- Existing Supabase session cookies or Discord OAuth transaction cookies.
- POST, PUT, PATCH, DELETE, or OPTIONS requests.

Existing signed-in legacy visitors can therefore finish their old-host sessions.
They can explicitly visit the new domain and sign in there. Auth exceptions may
remain on the old host; a site-wide redirect is intentionally not applied to them.
The redirect also refuses to activate if the configured canonical origin is still
the old domain, localhost, `www`, or an unrelated hostname. Redirect responses use
`Cache-Control: no-store` to reduce persistent browser caching during rollout.

## 8. Tests and production acceptance checklist

Local checks:

```sh
node --experimental-strip-types --test tests/site-origin.test.mjs
npx tsc --noEmit
npm run build
```

The project has a lint script, but no ESLint configuration was found. Do not claim
ESLint passed without configuring it separately. No lint configuration is changed
as part of this migration.

Before live cutover, confirm each item on the actual domain; local tests do not
count as live DNS, email, or Discord authorization tests:

- [ ] Original flyer QR decoded and its exact destination recorded.
- [ ] New apex domain resolves to the existing Vercel project with valid HTTPS.
- [ ] Homepage layout, branding, images, categories, and visible copy are unchanged.
- [ ] Guest homepage preview and account popup work on desktop and mobile.
- [ ] Direct article/tab URLs still require authentication; no private body is sent.
- [ ] Existing account signs in on the new host and can access every website tab.
- [ ] New account can sign up and confirm email on the new host.
- [ ] Legacy confirmation URLs remain usable.
- [ ] Discord authorization starts with the exact new callback URI and finishes.
- [ ] State validation, screening, joining, and membership persistence work.
- [ ] A previously started old-host Discord transaction can finish on its old host.
- [ ] `www` redirects to the apex after its testing is finished.
- [ ] Old QR URL still works, including encoded path and tracking parameters.
- [ ] With the redirect flag enabled, ordinary old-host links redirect once only.
- [ ] Authentication URLs and signed-in legacy sessions stay on the old host.
- [ ] Localhost sign-up, sign-in, and Discord flow still work on port 3000.
- [ ] No credentials or tokens appear in commits, logs, screenshots, or redirect URLs.

## 9. Rollback

1. Disable `ENABLE_LEGACY_DOMAIN_REDIRECT` and redeploy an approved healthy build,
   or restore the previous healthy Vercel deployment in this same project.
2. Keep the old Vercel hostname attached. Do not delete the project or deployments.
3. If necessary restore production `NEXT_PUBLIC_SITE_URL` to the old Vercel origin
   and restore Supabase Site URL, keeping both domains in auth allowlists.
4. Keep old and new Discord callbacks registered while transactions are in flight.
5. Restore DNS from the pre-change export only with explicit approval and only if
   DNS changes caused the issue. Preserve unrelated records.
6. Retest the exact printed QR URL, sign-in, and confirmation on the old host.

DNS propagation and any permanent redirects cached outside the application may
outlast a rollback. That is why permanent redirects are the final step. No user,
member, or database data needs to be removed or migrated for rollback.

## Official references

- Vercel domain setup: https://vercel.com/docs/domains/set-up-custom-domain
- Vercel DNS troubleshooting: https://vercel.com/docs/domains/troubleshooting
- Supabase redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase email templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Next.js redirects: https://nextjs.org/docs/app/guides/redirecting
