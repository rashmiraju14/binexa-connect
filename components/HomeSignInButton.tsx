"use client";

import { useMemberAuth } from "@/components/auth/AuthProvider";

export default function HomeSignInButton() {
  const { authenticated, openAuth } = useMemberAuth();
  if (authenticated) return null;
  return <button type="button" className="btn home-signin" data-auth-trigger onClick={() => openAuth("signin", "/member")}>Sign In</button>;
}
