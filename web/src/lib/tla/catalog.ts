import { getDb } from "@/lib/db/mongodb";
import { readReportHtml } from "@/lib/reports/files";

export const REPORTS_COLLECTION = "Report";

export type TlaPack = {
  domains: unknown[];
  catalog: unknown[];
  see: unknown[];
};

type CatalogDocument = TlaPack & {
  kind: "tla-catalog";
  version: 1;
  updatedAt: Date;
  updatedBy: string;
};

function sliceJson(source: string, from: number): number {
  let index = from;
  while (index < source.length && /\s/.test(source[index])) index += 1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") depth += 1;
    else if (char === "}" || char === "]") {
      depth -= 1;
      if (depth === 0) return cursor + 1;
    }
  }
  throw new Error("Could not read the TLA bank snapshot");
}

export function readBundledPack(): TlaPack {
  const html = readReportHtml("TLA-bank.html");
  const marker = "const SNAPSHOT = ";
  const at = html.indexOf(marker);
  if (at < 0) throw new Error("TLA bank snapshot was not found");
  const end = sliceJson(html, at + marker.length);
  const pack = JSON.parse(html.slice(at + marker.length, end)) as TlaPack;
  if (!Array.isArray(pack.catalog) || !Array.isArray(pack.see) || !Array.isArray(pack.domains)) {
    throw new Error("TLA bank snapshot is incomplete");
  }
  return { domains: pack.domains, catalog: pack.catalog, see: pack.see };
}

export function isTlaPack(value: unknown): value is TlaPack {
  if (!value || typeof value !== "object") return false;
  const pack = value as TlaPack;
  return Array.isArray(pack.domains) && Array.isArray(pack.catalog) && Array.isArray(pack.see);
}

async function reports() {
  const db = await getDb();
  const collection = db.collection<CatalogDocument>(REPORTS_COLLECTION);
  await collection.createIndex(
    { kind: 1 },
    { unique: true, partialFilterExpression: { kind: "tla-catalog" }, name: "one_tla_catalog" },
  );
  return collection;
}

export async function getOrSeedCatalog(username: string): Promise<TlaPack> {
  const collection = await reports();
  const existing = await collection.findOne({ kind: "tla-catalog" });
  if (existing) {
    return { domains: existing.domains, catalog: existing.catalog, see: existing.see };
  }
  const seed = readBundledPack();
  try {
    await collection.insertOne({
      kind: "tla-catalog",
      version: 1,
      updatedAt: new Date(),
      updatedBy: username,
      ...seed,
    });
  } catch (err) {
    const again = await collection.findOne({ kind: "tla-catalog" });
    if (again) return { domains: again.domains, catalog: again.catalog, see: again.see };
    throw err;
  }
  return seed;
}

export async function saveCatalog(username: string, pack: TlaPack): Promise<void> {
  const collection = await reports();
  await collection.updateOne(
    { kind: "tla-catalog" },
    {
      $set: {
        kind: "tla-catalog",
        version: 1,
        updatedAt: new Date(),
        updatedBy: username,
        domains: pack.domains,
        catalog: pack.catalog,
        see: pack.see,
      },
    },
    { upsert: true },
  );
}
