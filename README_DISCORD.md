# Discord membership setup

Discord is optional for website access. Signed-in visitors can use every community
page without a linked Discord account. This guide covers the optional Discord
joining and verification flow and its access-granted confirmation page.

## Required external configuration

1. Open https://discord.com/developers/applications and create/select the app.
2. Add these exact OAuth2 redirect URLs:
   - `http://localhost:3000/api/discord/callback`
   - `https://binexa-connect-2.vercel.app/api/discord/callback`
3. Create a bot for the same application and install it in the intended guild.
   Discord's Add Guild Member endpoint requires the bot to be a member of that
   guild and have the `CREATE_INSTANT_INVITE` permission.
4. Fill in the blank variables already added to the Git-ignored `.env.local`:
   - `DISCORD_CLIENT_ID`: application ID
   - `DISCORD_CLIENT_SECRET`: OAuth2 client secret
   - `DISCORD_BOT_TOKEN`: bot token
   - `DISCORD_GUILD_ID`: server ID, copied with Discord Developer Mode enabled
   - `SUPABASE_SECRET_KEY`: Supabase server-only secret key
   - `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` locally
5. Run `supabase/migrations/202610210001_community_members.sql` in the Supabase SQL
   Editor (or apply it through your migration workflow). Authenticated users can
   read only their own membership; they cannot write verification fields.
6. Restart `npm run dev` after updating environment variables.

Do not put client secrets, bot tokens, or the Supabase secret in browser code,
Git, or a `NEXT_PUBLIC_` variable. OAuth access tokens are used during the
callback only and are not persisted. The callback validates state and ties it to
the Supabase user who started authorization.

## Test before deployment

- Sign up, verify email, and sign in. Confirm the Discord invitation is offered and an unlinked user
  can continue browsing the website without a redirect loop.
- Click Connect Discord, explicitly authorize `identify guilds.join`, and confirm
  successful membership reaches `/community` and displays live counts.
- Cancel authorization and check that a useful error is displayed.
- If screening is enabled, complete it in Discord, then connect again.
- Try a callback with missing/invalid state. It must never create membership.
- Try linking the same Discord identity from another Binexa account. It must be
  rejected by the unique database constraint.
- Leave the Discord guild and request `/access-granted` again. Discord confirmation
  must fail; normal authenticated website access remains available.
- Sign out and confirm community and member pages redirect to sign-in.
- Temporarily break Discord configuration: Discord joining must show a retry
  message while authenticated website tabs remain available.

Counts refresh every minute. Binexa counts are saved Discord-verified accounts;
Discord counts are approximate and include Discord members without Binexa accounts.
Departures are removed from the saved count when that user next requests a
protected page. A full periodic membership reconciliation is not implemented.
Live access checks run when the protected server layout renders; they do not
remove content already delivered to an open browser tab. Future private APIs,
server actions, and data queries must call the membership guard themselves.

## Production

Add the same server-side variables to Vercel and set `NEXT_PUBLIC_SITE_URL` to
`https://binexa-connect-2.vercel.app`, then redeploy. The existing domain and QR code
can stay unchanged. Do not deploy until the real authorization and screening flow
has been tested with the configured bot and Supabase table.

References:
- https://discord.com/developers/docs/topics/oauth2
- https://discord.com/developers/docs/resources/guild#add-guild-member
