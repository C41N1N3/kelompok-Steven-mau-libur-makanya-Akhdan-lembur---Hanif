import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_AUTH_REDIRECT = "/dashboard";
const UNSAFE_REDIRECT_PATTERN = /[\u0000-\u001F\u007F\\]|%5c|%0[0-9a-f]|%1[0-9a-f]|%7f/i;

export function getSafeAuthRedirectPath(next: string | null, origin: string) {
  if (!next || UNSAFE_REDIRECT_PATTERN.test(next)) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const target = new URL(next, origin);

    if (target.origin !== origin) return DEFAULT_AUTH_REDIRECT;

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = getSafeAuthRedirectPath(url.searchParams.get("next"), url.origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=callback", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
