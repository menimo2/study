# דוחות

Next.js app for the Hebrew report generators. Specs stay in `Docs/`. This folder is the app, same layout as the David project (`web/` is the Vercel root).

```bash
npm install
npm run dev
```

Open http://localhost:3000

Environment (`web/.env.local`, not committed):

- `MONGODB_URI` — same Atlas cluster as David
- `MONGODB_DB=Report-Dorin`
- `AUTH_SECRET` — signs the login cookie

Users live in the `Users` collection. The password field is the SHA-256 hex digest of the password. To add or replace a user:

```bash
SEED_USERNAME=admin SEED_PASSWORD="the password" node scripts/seed-admin.mjs
```
