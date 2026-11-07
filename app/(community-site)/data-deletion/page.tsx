import Link from "next/link";
import styles from "@/components/policy-pages.module.css";

export const metadata = {
  title: "Account & Data Deletion",
  description: "How to contact Binexa Connect to request account and associated data deletion, and what is not automatic.",
};

export default function DataDeletionPage() {
  return (
    <main className={`shell policy-page ${styles.page}`}>
      <p className="eyebrow">BINEXA CONNECT</p>
      <h1>Account &amp; Data Deletion</h1>
      <p className="muted">Last updated November 7, 2026</p>
      <p>Binexa Health operates Binexa Connect. You do not need to sign in to read these instructions or email a deletion request. These instructions apply to email accounts and accounts created through Google or Facebook sign-in.</p>
      <aside className={styles.notice} aria-labelledby="deletion-status-title">
        <h2 id="deletion-status-title">Account deletion is a manual request process</h2>
        <p>You can email rashmi@binexahealth.com, our primary privacy and account deletion contact, to request deletion of your Binexa Connect account and associated personal information. Rashmi actively monitors this address and manually verifies and processes requests. The website has no self-service account deletion button or automatic deletion form. Reasonable account ownership verification may be required before processing your request.</p>
      </aside>
      <section aria-labelledby="request-title">
        <h2 id="request-title">How to request deletion</h2>
        <ol>
          <li>Email <a href="mailto:rashmi@binexahealth.com?subject=Binexa%20Connect%20data%20deletion%20request">rashmi@binexahealth.com</a> with the subject “Binexa Connect data deletion request.” You can copy the address into your email service if the link does not open an email app.</li>
          <li>Where possible, send from the email address associated with your Binexa Connect account. State that you want the account and associated data deleted. Mention whether you used Google or Facebook sign-in and whether you linked Discord. If you cannot access the account email, explain that without sending credentials or identity documents.</li>
          <li>Rashmi may ask you to confirm control of the account before processing the request. You can reply to the same email thread to ask about receipt, progress, which records have been removed, or information that remains and why. There is no automatic status tracker or fixed completion deadline.</li>
        </ol>
        <p>Sending an email only starts a request for review. It does not immediately delete your account or any associated records. Do not include passwords, login links, authorization codes, access tokens, or sensitive medical details.</p>
      </section>
      <section aria-labelledby="associated-data-title">
        <h2 id="associated-data-title">What to include in your request</h2>
        <ul>
          <li><strong>Supabase account information:</strong> your authentication account, provided email/phone/username, and profile information received through social sign-in.</li>
          <li><strong>Discord linkage:</strong> your Binexa-to-Discord connection record and verification status, if connected. Removing a Binexa connection is separate from deleting a Discord account or messages.</li>
          <li><strong>Sign-in reports:</strong> account ID, available name, email address, sign-in times, and provided phone number in the Google sign-in sheet, if reporting was enabled. The website has no automated process that removes those spreadsheet rows when an account is deleted.</li>
          <li><strong>Other retained information:</strong> correspondence, service logs, and backups. Some information may remain in service logs, backup snapshots, or historical copies subject to provider controls. Removing current account data does not by itself erase these copies. This page does not promise a fixed retention period, backup expiry date, or immediate removal from every system.</li>
        </ul>
        <p>Deletion requests are reviewed manually across the relevant Binexa-controlled records. Third-party accounts, service logs, and historical copies have separate controls. You can ask Rashmi for a description of the action taken and any remaining information; account removal alone is not confirmation that all copies have been deleted.</p>
      </section>
      <section aria-labelledby="separate-services-title">
        <h2 id="separate-services-title">Google, Facebook, and Discord</h2>
        <p>Deleting a Binexa Connect account does not delete your Google, Facebook, or Discord account. You can separately review Binexa Connect in each provider&apos;s connected-app settings and remove its access where available. Revoking provider access alone does not request deletion of Binexa Connect&apos;s existing records.</p>
        <p>Content and membership on Discord are managed separately. For messages or membership in the Binexa Discord community, describe the request to the team or a community moderator and use Discord&apos;s own account and content controls as needed. There is no automatic Discord-content deletion process in this website.</p>
      </section>
      <section aria-labelledby="device-data-title">
        <h2 id="device-data-title">Data in your open page and on your device</h2>
        <p>Habit entries, game progress, and discussion preview messages currently reset when you refresh the page. Habit entries can also be cleared using “Delete all entries” under My progress. These controls do not delete a Supabase account or spreadsheet records.</p>
        <p>Delete any downloaded habit export files yourself if you no longer want them on your device. Signing out and clearing browser cookies affect browser access; neither action requests account deletion.</p>
      </section>
      <div className={styles.related}><Link href="/privacy">Privacy Policy &amp; Cookie Notice</Link><Link href="/">Back to Binexa Connect</Link></div>
    </main>
  );
}
