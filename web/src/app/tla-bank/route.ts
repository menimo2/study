import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth/session";
import { getOrSeedCatalog } from "@/lib/tla/catalog";
import { htmlResponse, renderBankPage } from "@/lib/tla/page";

export async function GET(request: Request) {
  const username = await getSessionUsername();
  if (!username) return NextResponse.redirect(new URL("/login", request.url));
  const pack = await getOrSeedCatalog(username);
  return htmlResponse(renderBankPage(pack));
}
