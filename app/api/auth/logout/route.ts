import { NextResponse } from "next/server";
import { originFrom } from "@/lib/config";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const res = NextResponse.redirect(`${originFrom(req)}/`, 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
