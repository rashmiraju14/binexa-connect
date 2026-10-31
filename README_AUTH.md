# Supabase authentication setup

For the staged custom-domain migration, see [CUSTOM_DOMAIN_MIGRATION.md](CUSTOM_DOMAIN_MIGRATION.md). Keep existing hostnames and callback URLs until that checklist is approved and completed.

The app has sign-up, email/password sign-in, email confirmation, a member dashboard,
sign-out, and authentication checks for every route in `app/(community-site)`.
Session cookies are refreshed by `middleware.ts` for Next.js 15.

## Configure the project

1. Create a Supabase project named `binexa-connect` in https://supabase.com/dashboard.
2. Copy the Project URL and **publishable** key into the existing `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```

   `.env.local` is ignored by Git. Never use a secret or service-role key here.
3. Enable email/password authentication and email confirmation in Supabase.
4. In Authentication → Email Templates → Confirm signup, use this confirmation URL:

   ```text
   {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email
   ```

   Sign-up sets RedirectTo to the current app origin followed by `/auth/confirm`,
   so local sign-ups return locally and production sign-ups return to production.
5. In Authentication → URL Configuration, set Site URL to `http://localhost:3000`
   during development. Allow both `http://localhost:3000/auth/confirm` and
   `https://binexa-connect-2.vercel.app/auth/confirm` as redirect URLs.
6. Restart `npm run dev` after changing `.env.local`.

Before deployment, add both environment variables to the existing Vercel project,
set Supabase Site URL to `https://binexa-connect-2.vercel.app`, and redeploy.

## Verify with a real project

- Open `/sign-up` and `/sign-in`.
- Register a test account with username, email, phone, and an eight-character or longer password.
- Follow the verification email and confirm `/member` displays the username.
- Enter `/community`, then sign out from `/member`.
- Confirm `/member`, `/community`, and the other community routes redirect to `/sign-in` after sign-out.
- Sign back in with email and password.
- Check that an invalid `/auth/confirm?token_hash=invalid&type=email` link returns to sign-in with an error message.

Until credentials are configured, forms render and report that account access is
unavailable on submission; protected routes redirect to sign-in.

Username and phone are stored in private user metadata. Usernames are not unique,
and phone numbers are not verified or usable for sign-in. Profile privacy controls,
password reset, and any username uniqueness requirements need a separate implementation
before inviting real members.

Reference: https://supabase.com/docs/guides/auth/server-side/creating-a-client

## Google and Facebook sign-in

Both account popup modes include Google and Facebook OAuth. The browser starts
Supabase's PKCE flow; `/auth/callback` exchanges the code for a cookie session,
preserves a safe local destination, and shows the existing Discord welcome prompt.
Cancelled or failed sign-ins return to the sign-in popup with a retry message.

To activate these providers:

1. In Supabase Authentication → Sign In / Providers, enable Google and Facebook.
   Add each provider's client/app ID and secret there, never in browser code or Git.
2. In Google Cloud's OAuth web client, add the callback URL displayed by Supabase
   as an authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
   Configure the consent screen and publish it when ready for public users.
3. In Meta's Facebook Login settings, add the same Supabase callback under Valid
   OAuth Redirect URIs. Complete the app's requirements for public availability.
4. In Supabase Authentication → URL Configuration, retain the existing email
   redirects and allow:
   - `http://localhost:3000/auth/callback`
   - `https://binexaconnect.com/auth/callback`
   - `https://www.binexaconnect.com/auth/callback` if that hostname serves login
   - `https://binexa-connect-2.vercel.app/auth/callback`
5. Configure the existing public Supabase URL and publishable key locally and in
   Vercel. Production `NEXT_PUBLIC_SITE_URL` should be `https://binexaconnect.com`.

OAuth creates accounts using provider metadata; the email signup form's phone
and username fields are not collected by these providers. No phone or username
requirement is enforced for social sign-in.

Manual verification with configured providers: test each provider from both
popup modes, cancellation, sign-out, and a protected-page destination on localhost
and production. A real provider round trip cannot be verified without credentials.

Provider references:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://supabase.com/docs/guides/auth/social-sign-in/auth-facebook
