import Link from "next/link";
import styles from "@/components/policy-pages.module.css";

export const metadata = {
  title: "Privacy Policy & Cookie Notice",
  description: "How Binexa Connect uses account information, connected services, cookies, and privacy requests.",
};

export default function PrivacyPage() {
  return (
    <main className={`shell policy-page ${styles.page}`}>
      <p className="eyebrow">BINEXA CONNECT</p>
      <h1>Privacy Policy &amp; Cookie Notice</h1>
      <p className="muted">Last updated November 7, 2026</p>
      <aside className={styles.notice} aria-labelledby="policy-review-title">
        <h2 id="policy-review-title">Privacy and account requests</h2>
        <p>Binexa Health operates Binexa Connect. For privacy questions or manual account deletion requests, contact rashmi@binexahealth.com. Rashmi monitors this address and handles requests.</p>
      </aside>
      <p>Binexa Connect is a wellness education and community website operated by Binexa Health. This notice covers information used by this website and its connected services. It does not describe a patient portal or a medical treatment service.</p>
      <nav className={styles.contents} aria-label="Privacy policy sections">
        <a href="#information">Information we use</a><a href="#services">Connected services</a><a href="#cookies">Cookies</a><a href="#retention">Retention</a><a href="#choices">Your choices</a><a href="#contact">Contact</a>
      </nav>
      <section id="information" aria-labelledby="information-title">
        <h2 id="information-title">Information we use and why</h2>
        <ul>
          <li><strong>Email accounts:</strong> the signup form asks for a username, email address, phone number, and password. Supabase processes authentication information to create accounts, verify email addresses, and provide signed-in access. Phone numbers submitted in this form are not verified.</li>
          <li><strong>Google and Facebook sign-in:</strong> if you choose either provider, Supabase uses the identity and profile information returned by that provider. This can include a provider identifier, name, email address, and profile metadata, depending on the provider and permissions. Social sign-in does not require the phone and username fields in the email signup form. Available names and email addresses are used for account display and the welcome experience.</li>
          <li><strong>Optional Discord connection:</strong> the connection flow requests permission to identify your Discord account and join the community server. It checks server membership and stores your Binexa account ID, Discord user ID, verification status, and the connection record&apos;s creation time in Supabase. Opening an invitation alone is separate from connecting your accounts.</li>
          <li><strong>Sign-in reporting, when enabled:</strong> the website sends your account ID, available name, email address, sign-in time, and provided phone number to a configured Google Sheets integration for community administration. The reporting payload does not include passwords, OAuth tokens, habit entries, or discussion preview messages.</li>
          <li><strong>Requests and technical information:</strong> hosting, authentication, and connected services receive information needed to serve requests, such as IP addresses and browser/request details. Supabase also maintains authentication/session records that can include sign-in timestamps, IP addresses, and browser details. These support account access and service operation.</li>
          <li><strong>Messages to the team:</strong> if you email the primary contact, your email address and the information you include are received by the team handling your request. The correspondence is used to review and respond to your request.</li>
        </ul>
        <p>The public community statistics show aggregate verified-account and approximate Discord member counts, rather than a list of member identities.</p>
      </section>
      <section aria-labelledby="preview-title">
        <h2 id="preview-title">Habit entries and discussion previews</h2>
        <p>The current habit tracker, game progress, and discussion preview messages stay in the open page and reset on refresh. These features do not save those entries to your account or send them to the sign-in sheet. A habit export is a file downloaded to your device; refreshing the website does not remove a downloaded file.</p>
        <p>Actual community conversations on Discord are held by that separate service. Avoid sharing private medical details, passwords, or other sensitive information in previews, community conversations, or emails.</p>
      </section>
      <section id="services" aria-labelledby="services-title">
        <h2 id="services-title">Connected services and sharing</h2>
        <p>Supabase provides account authentication and database storage. Vercel hosts the website. Google and Meta/Facebook process sign-in when you choose their authentication services. Google processes sign-in reports if the Sheets integration is enabled. Discord processes invitations, optional account connections, server membership, and conversations held there.</p>
        <p id="videos">YouTube thumbnails load from YouTube&apos;s image service, which receives technical information such as your IP address when an image loads. Selecting a video loads YouTube&apos;s privacy-enhanced player. The player can process technical information and use storage under YouTube&apos;s policies. Other external links take you to the respective service.</p>
        <p>The website does not add its own advertising or analytics tracking scripts. Hosting and connected services can process request information and operational logs separately under their own service controls and policies.</p>
        <ul>
          <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy (opens in a new tab)</a></li>
          <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy (opens in a new tab)</a></li>
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy (opens in a new tab)</a></li>
          <li><a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">Meta Privacy Policy (opens in a new tab)</a></li>
          <li><a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">Discord Privacy Policy (opens in a new tab)</a></li>
        </ul>
      </section>
      <section id="cookies" aria-labelledby="cookies-title">
        <h2 id="cookies-title">Cookies and browser storage</h2>
        <p>Supabase authentication uses cookies to maintain and refresh signed-in access, including temporary state for social sign-in. Optional Discord authorization uses short-lived state cookies with a ten-minute lifetime; its callback clears them. The <code>binexa_cookie_notice</code> cookie remembers dismissal of the cookie notice for up to 180 days.</p>
        <p>You can manage website cookies through your browser settings. Blocking authentication cookies can prevent sign-in or session restoration. Clearing cookies or signing out does not delete your account, Google sign-in reports, or Discord content. The Cookie Notice link in the footer reopens the notice.</p>
      </section>
      <section id="retention" aria-labelledby="retention-title">
        <h2 id="retention-title">Retention and deletion</h2>
        <p>Account and Discord connection records are stored in Supabase. Sign-in reports are stored in Google Sheets when that integration is enabled. Account deletion requests are processed manually; the website does not provide automatic account deletion.</p>
        <p>This notice does not set a fixed retention period or a fixed time for completing a deletion request. You can email rashmi@binexahealth.com to request deletion of your Binexa Connect account and associated personal information, or ask about information held about you. Some information may remain in service logs, backup snapshots, or historical copies subject to the relevant service controls. Removing current account records does not by itself erase every historical copy. We do not promise immediate or complete removal across all third-party systems.</p>
        <p><Link href="/data-deletion">Read the account and data deletion request instructions →</Link></p>
      </section>
      <section id="choices" aria-labelledby="choices-title">
        <h2 id="choices-title">Your choices and requests</h2>
        <p>You can browse public pages without signing in, choose whether to use social sign-in or Discord, sign out, and manage cookies. You can also contact the team to request access to, correction of, or deletion of account information. The website does not currently provide a self-service account deletion tool.</p>
        <p>Removing Binexa Connect from a provider&apos;s connected-app settings is separate from requesting deletion of information already stored by Binexa Connect. Leaving Discord or deleting a Discord account is also a separate action.</p>
      </section>
      <section id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title">Privacy contact</h2>
        <p>The primary contact for privacy and account deletion requests is <a href="mailto:rashmi@binexahealth.com">rashmi@binexahealth.com</a>. Email this contact with “Binexa Connect privacy request” in the subject and a brief description of your request. Do not send passwords, authorization codes, tokens, identity documents, or medical information.</p>
        <p>This address is actively monitored by Rashmi, who manually verifies and processes account deletion requests for Binexa Health. Reasonable account ownership verification may be required before a request is processed. Sending an email does not automatically change or delete any records. See the deletion instructions for what to include and how to ask about the status of a request.</p>
      </section>
      <div className={styles.related}><Link href="/data-deletion">Account &amp; data deletion</Link><Link href="/">Back to Binexa Connect</Link></div>
    </main>
  );
}
