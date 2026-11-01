import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth/session";
import { readReportHtml, withChrome } from "@/lib/reports/files";

export async function serveReport(request: Request, filename: string) {
  const username = await getSessionUsername();
  if (!username) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const html = withChrome(readReportHtml(filename));
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache",
    },
  });
}
