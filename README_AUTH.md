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
