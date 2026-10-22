# Community homepage and member access

The community homepage renders at `/`. `/community` redirects to `/` for existing
links. The previous landing component is preserved in
`components/ArchivedLandingPage.tsx` but is no longer routed.

## Access rules

Only the homepage preview is public. All community tabs and full resources require
a valid Supabase session: Explore, Health Topics, Resources, Events, Discussions,
Small Habits, Community Lounge, Start Here, Join, and My Account. These routes check
authentication on the server, including requests made directly to an article URL.
The signed-out homepage does not render member videos or external resource links.

Signed-out homepage clicks open the shared sign-up popup. Explicit Sign In controls
open sign-in mode instead. The popup is implemented in `components/AuthPopup.tsx`,
styled in `components/auth-popup.css`, and uses the Supabase SSR browser client so
server-rendered pages recognize the same session cookies. After sign-in, all tabs
work normally. Legacy `/sign-in` and `/sign-up` URLs open the homepage popup.

## Discord

After authentication, visitors see one **Join Our Discord Community** action and
can continue browsing. The action authorizes Discord, joins the configured server,
and verifies membership. Discord joining is optional for website access.
The existing invite remains `https://discord.gg/uGWdz6Bem`; it is also available
when users need to finish Discord rules screening. OAuth state is tied to the
Supabase user who began authorization, and return paths are restricted to this site.

## Verification

- Open `/` in an incognito browser: the preview is visible without a login wall.
- Click a heading, card, or tab: sign-up opens. Sign In opens the sign-in form.
- Switch forms, close with the button/Escape, and repeat on mobile.
- Open a private tab or article URL directly while signed out: it returns to the
  homepage account popup without sending the protected article body.
- Register and confirm email, or sign in. Check the Discord invitation and continue
  into the community. Every tab should now open normally.
- Optionally authorize Discord and confirm the access-granted message returns to
  the requested content.
- Sign out and confirm protected URLs require authentication again.

The production build and isolated desktop/mobile popup tests passed locally.
Live sign-up, email confirmation, and Discord authorization also depend on the
external configuration documented in `README_AUTH.md` and `README_DISCORD.md`.

## Deployment

Set the application environment variables in Vercel; `.env.local` is intentionally
excluded from Git. Use `https://binexa-connect-2.vercel.app` as the production
`NEXT_PUBLIC_SITE_URL` and configure the matching Supabase and Discord redirects.
`npm run dev` uses port 3000 locally. Avoid running multiple development servers
against the same `.next-dev` directory.
