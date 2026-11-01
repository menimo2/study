import { redirect } from "next/navigation";
import { getSessionUsername } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getSessionUsername()) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">כניסה</h1>
        <LoginForm />
      </section>
    </main>
  );
}
