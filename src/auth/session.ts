import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "origin_session";

export interface SessionUser {
  uid?: string;
  email: string;
  name: string;
  provider?: string;
  emailVerified?: boolean;
}

function secret() {
  const value = process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "origin-ai-development-only-secret");
  if (!value) throw new Error("AUTH_SECRET is required in production");
  return new TextEncoder().encode(value);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ uid: user.uid, email: user.email, name: user.name, provider: user.provider, emailVerified: user.emailVerified })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", expires: new Date(0) });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, secret());
    const { uid, email, name, provider, emailVerified } = verified.payload as unknown as SessionUser;
    return email && name ? { uid, email, name, provider, emailVerified } : null;
  } catch {
    return null;
  }
}
