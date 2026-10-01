import { NextResponse } from "next/server";
import { destroySession } from "@/src/auth/session";

export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
