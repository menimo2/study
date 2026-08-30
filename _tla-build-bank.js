const fs = require("fs");
const vm = require("vm");
const html = fs.readFileSync("TLA.html", "utf8");
const start = html.indexOf("const DOMAINS =");
const end = html.indexOf("function female()");
if (start < 0 || end < 0) throw new Error("markers missing");
const code = html.slice(start, end)
  .replace(/\bconst /g, "var ")
  .replace(/\bfunction domainStyle[\s\S]*?\n\}/, "");
const ctx = {};
vm.runInNewContext(code, ctx);
const snapshot = {
  domains: ctx.DOMAINS,
  catalog: ctx.CATALOG,
  see: ctx.SEE
};
if (!snapshot.catalog || !snapshot.see) throw new Error("extract failed");
const app = fs.readFileSync("_tla-bank-app.html", "utf8");
if (app.indexOf("__SNAPSHOT__") < 0) throw new Error("placeholder missing");
fs.writeFileSync(
  "TLA-bank.html",
  app.replace("__SNAPSHOT__", JSON.stringify(snapshot)),
  "utf8"
);
console.log("TLA-bank.html", snapshot.catalog.length, "goals", snapshot.see.length, "see-groups");
