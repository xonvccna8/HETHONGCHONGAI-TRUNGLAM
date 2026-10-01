import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createSession } = vi.hoisted(() => ({ createSession: vi.fn() }));
vi.mock("@/src/auth/session", () => ({ createSession }));

import { POST } from "@/app/api/auth/firebase-session/route";

describe("Firebase session exchange", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    createSession.mockReset();
    process.env.FIREBASE_WEB_API_KEY = "public-firebase-test-key";
  });

  afterEach(() => vi.unstubAllGlobals());

  it("rejects malformed ID tokens before contacting Firebase", async () => {
    const response = await POST(new Request("http://localhost/api/auth/firebase-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "too-short" }),
    }));
    expect(response.status).toBe(400);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("creates an HTTP-only application session only after Firebase lookup succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ users: [{
      localId: "firebase-user-1",
      email: "researcher@example.com",
      emailVerified: true,
      displayName: "Nhà nghiên cứu",
      providerUserInfo: [{ providerId: "google.com" }],
    }] }), { status: 200, headers: { "Content-Type": "application/json" } })));
    const response = await POST(new Request("http://localhost/api/auth/firebase-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "x".repeat(200) }),
    }));
    expect(response.status).toBe(200);
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ uid: "firebase-user-1", provider: "google.com", emailVerified: true }));
  });
});
