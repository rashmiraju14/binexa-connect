import Link from "next/link";
import { requireAccount } from "@/lib/auth/require-account";
import SignOutButton from "./sign-out-button";

export default async function MemberPage() {
  const user = await requireAccount("/member");

  const username =
    typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username
      : "Member";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#071d35",
        color: "white",
        padding: "80px 20px",
        textAlign: "center",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <img
        src="/branding/binexa-icon.png"
        alt="BinexaHealth"
        width="90"
        height="90"
      />

      <p style={{ color: "#e8b84c", letterSpacing: 3 }}>
        BINEXA CONNECT
      </p>

      <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>
        Welcome, {username}!
      </h1>

      <p style={{ color: "#d3deea", marginBottom: 35 }}>
        Your community journey starts here.
      </p>

      <div
        style={{
          display: "flex",
          gap: 18,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/community"
          style={{
            padding: "17px 26px",
            background: "#e8b84c",
            color: "#071d35",
            borderRadius: 12,
            fontWeight: 800,
          }}
        >
          Explore Binexa Connect →
        </Link>

        <a
          href="/api/discord/connect"
          style={{
            padding: "17px 26px",
            border: "1px solid #e8b84c",
            borderRadius: 12,
            color: "#ffe29a",
            fontWeight: 800,
          }}
        >
          Join Our Discord Community →
        </a>
      </div>

      <div style={{ marginTop: 40 }}>
        <SignOutButton />
      </div>
    </main>
  );
}
