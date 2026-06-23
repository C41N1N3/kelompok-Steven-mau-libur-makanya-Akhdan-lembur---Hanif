import { createSign } from "crypto";

export const GOOGLE_AUTH_NOT_CONFIGURED_MESSAGE =
  "Google Cloud auth is not configured. Add GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, or GOOGLE_TTS_ACCESS_TOKEN.";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

type GoogleAccessTokenOptions = {
  accessToken?: string;
  clientEmail?: string;
  privateKey?: string;
  fetchImpl?: typeof fetch;
  nowSeconds?: number;
  signJwt?: (jwtHeader: string, jwtPayload: string, privateKey: string) => string;
};

let cachedToken: { token: string; expiresAtSeconds: number } | null = null;

export async function getGoogleAccessToken(
  options: GoogleAccessTokenOptions = {},
): Promise<string> {
  const explicitToken = options.accessToken ?? process.env.GOOGLE_TTS_ACCESS_TOKEN;
  if (explicitToken?.trim()) return explicitToken.trim();

  const clientEmail =
    options.clientEmail ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(
    options.privateKey ?? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  );

  if (!clientEmail || !privateKey) {
    throw new Error(GOOGLE_AUTH_NOT_CONFIGURED_MESSAGE);
  }

  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAtSeconds - 60 > nowSeconds) {
    return cachedToken.token;
  }

  const assertion = buildServiceAccountJwt({
    clientEmail,
    privateKey,
    nowSeconds,
    signJwt: options.signJwt,
  });
  const fetchImpl = options.fetchImpl ?? fetch;
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  }).toString();

  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Google OAuth failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("Google OAuth returned an empty access token.");
  }

  cachedToken = {
    token: payload.access_token,
    expiresAtSeconds: nowSeconds + (payload.expires_in ?? 3600),
  };

  return payload.access_token;
}

function buildServiceAccountJwt(input: {
  clientEmail: string;
  privateKey: string;
  nowSeconds: number;
  signJwt?: (jwtHeader: string, jwtPayload: string, privateKey: string) => string;
}): string {
  const header = base64UrlJson({ alg: "RS256", typ: "JWT" });
  const payload = base64UrlJson({
    iss: input.clientEmail,
    scope: CLOUD_PLATFORM_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: input.nowSeconds + 3600,
    iat: input.nowSeconds,
  });

  return input.signJwt
    ? input.signJwt(header, payload, input.privateKey)
    : signJwt(header, payload, input.privateKey);
}

function signJwt(header: string, payload: string, privateKey: string): string {
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(privateKey);
  return `${unsignedToken}.${base64Url(signature)}`;
}

function base64UrlJson(value: unknown): string {
  return base64Url(Buffer.from(JSON.stringify(value), "utf8"));
}

function base64Url(value: Buffer): string {
  return value
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function normalizePrivateKey(value?: string): string | undefined {
  return value?.replaceAll("\\n", "\n").trim();
}
