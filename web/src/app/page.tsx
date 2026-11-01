import { redirect } from "next/navigation";
import { getSessionUsername } from "@/lib/auth/session";

const reports = [
  { href: "/literacy", title: "מחולל ניתוח קריאה וכתיבה", text: "קריאת מילים, קריאת טקסט והכתבה" },
  { href: "/incident", title: "תיעוד אירוע", text: "סוג האירוע, כלפי מי הופנה, וההחלטות" },
  { href: "/functional", title: "דוח חינוכי-תפקודי", text: "הדוח החינוכי התפקודי" },
  { href: "/tla", title: "מחולל תל\"א", text: "תצפיות, יעדים, וטבלה של יעד מול אופן ביצוע" },
  { href: "/tla-bank", title: "מאגר תל\"א", text: "עריכת המטרות, היעדים והתצפיות. השינוי משותף לכולם" },
];

export default async function Home() {
  const username = await getSessionUsername();
  if (!username) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">דוחות</h1>
          <p className="mt-1 text-sm text-[#667]">{username}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium"
          >
            יציאה
          </button>
        </form>
      </header>
      <div className="grid gap-4">
        {reports.map((report) => (
          <a
            key={report.href}
            href={report.href}
            className="rounded-2xl border border-line bg-card px-5 py-5 shadow-sm transition-colors hover:border-accent"
          >
            <h2 className="text-xl font-semibold">{report.title}</h2>
            <p className="mt-1 text-sm text-[#667]">{report.text}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
