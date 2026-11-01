import { serveReport } from "@/lib/reports/serve";

export async function GET(request: Request) {
  return serveReport(request, "Literacy.html");
}
