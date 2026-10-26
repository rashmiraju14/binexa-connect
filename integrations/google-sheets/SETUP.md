# Connect the sign-in sheet

Destination: https://docs.google.com/spreadsheets/d/12AeiRvTk2iSu7YOEH_ioEmL-CX5iywzbsxsIH553KPA/edit

The receiver detects the header row within the first 25 rows, including the dashboard layout with headers on row 9. Keep the existing Sheet1 columns in this order: User-ID, Name, Email-ID, Sign-in Time, Phone- number.

1. Open the sheet as rashmi@binexahealth.com. Choose **Extensions > Apps Script**.
2. Replace the contents of Code.gs with this folder's Code.gs. Save.
3. In **Project Settings > Script properties**, add WEBHOOK_SECRET. Copy its value from GOOGLE_SIGNIN_WEBHOOK_SECRET in the project's .env.local. Never share or commit that secret.
4. Choose **Deploy > New deployment > Web app**. Execute as **Me** (the sheet owner). Access: **Anyone**. Only server requests with a valid signature can write; the script exposes no read endpoint. Approve the Google permissions. Workspace administrators may restrict web-app deployment.
5. Copy the deployment URL ending in /exec and add GOOGLE_SIGNIN_WEBHOOK_URL to .env.local. The URL is not a secret and can be sent to the developer configuring Vercel.
6. Set both GOOGLE_SIGNIN_WEBHOOK_URL and GOOGLE_SIGNIN_WEBHOOK_SECRET as server-only Production variables in the existing Vercel project. Redeploy. Use the same secret as the script property.
7. Sign in with a real account. Verify one new row; reloading should not create another row for the same sign-in. A later sign-out/sign-in should create a new row. Times are stored as native spreadsheet dates and displayed in the spreadsheet timezone.

The website derives fields from Supabase getUser, not browser-submitted rows. Passwords, tokens, and health data are not exported. Duplicate callbacks use the same user ID + last_sign_in_at event key. Optional reporting never blocks account access. Failed delivery is retried three times and on the next authenticated page load; this is best-effort reporting, not a complete immutable audit log. If Google returns 401, ensure the deployment allows **Anyone**, not only users in binexahealth.com, and select a **New version** when updating an existing deployment. If your Workspace policy blocks anonymous web apps, use a Google service-account integration instead; do not make the sheet public.

Do not rename the tab or overwrite the notes in column A: those notes deduplicate events. No historical rows are backfilled automatically. Keep sheet sharing restricted.

Connector access from this chat is separate from the production website's access. A deployment URL and matching secret are needed before automatic logging can work.
