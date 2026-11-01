import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth/session";
import { getOrSeedCatalog, isTlaPack, saveCatalog } from "@/lib/tla/catalog";

export async function GET() {
  const username = await getSessionUsername();
  if (!username) return NextResponse.json({ error: "צריך להתחבר" }, { status: 401 });
  const pack = await getOrSeedCatalog(username);
  return NextResponse.json(pack);
}

export async function PUT(request: Request) {
  const username = await getSessionUsername();
  if (!username) return NextResponse.json({ error: "צריך להתחבר" }, { status: 401 });
  const body = (await request.json()) as unknown;
  if (!isTlaPack(body)) {
    return NextResponse.json({ error: "המאגר חסר תחומים, מטרות או תצפיות" }, { status: 400 });
  }
  await saveCatalog(username, body);
  return NextResponse.json({ ok: true });
}
