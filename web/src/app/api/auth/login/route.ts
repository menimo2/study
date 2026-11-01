import { NextResponse } from "next/server";
import { verifyPasswordSha256 } from "@/lib/auth/password";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/mongodb";
import { USERS_COLLECTION, type UserDocument } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    if (!username || !password) {
      return NextResponse.json({ error: "צריך שם משתמש וסיסמה" }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection<UserDocument>(USERS_COLLECTION).findOne({ username });
    if (!user || !verifyPasswordSha256(password, user.password)) {
      return NextResponse.json({ error: "שם משתמש או סיסמה לא נכונים" }, { status: 401 });
    }

    const response = NextResponse.json({ username: user.username });
    response.cookies.set(SESSION_COOKIE, signSession(user.username), sessionCookieOptions());
    return response;
  } catch (err) {
    console.error("login failed", err);
    return NextResponse.json({ error: "לא הצלחנו להתחבר למסד" }, { status: 500 });
  }
}
