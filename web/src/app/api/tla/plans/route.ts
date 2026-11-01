import { NextResponse } from "next/server";
import { getSessionUsername } from "@/lib/auth/session";
import { getDb } from "@/lib/db/mongodb";
import { REPORTS_COLLECTION } from "@/lib/tla/catalog";

type PlanGoal = {
  goalId?: string;
  timeframe?: string;
  objectives?: { id?: string; methodIds?: string[] }[];
};

type PlanBody = {
  schoolYear?: string;
  period?: string;
  gender?: string;
  studentClass?: string;
  goals?: PlanGoal[];
};

export async function POST(request: Request) {
  const username = await getSessionUsername();
  if (!username) return NextResponse.json({ error: "צריך להתחבר" }, { status: 401 });
  const body = (await request.json()) as PlanBody;
  if (!Array.isArray(body.goals) || body.goals.length === 0) {
    return NextResponse.json({ error: "אין יעדים בתוכנית" }, { status: 400 });
  }
  const db = await getDb();
  await db.collection(REPORTS_COLLECTION).insertOne({
    kind: "tla-plan",
    createdAt: new Date(),
    createdBy: username,
    schoolYear: body.schoolYear ?? "",
    period: body.period ?? "",
    gender: body.gender ?? "",
    studentClass: body.studentClass ?? "",
    goals: body.goals,
  });
  return NextResponse.json({ ok: true });
}
