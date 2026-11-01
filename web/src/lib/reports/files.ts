import { existsSync, readFileSync } from "fs";
import path from "path";

const CHROME = `<div class="app-chrome"><a href="/">חזרה לדוחות</a></div>
<style>
  .app-chrome { position: fixed; z-index: 10000; top: 12px; left: 12px; }
  .app-chrome a {
    display: inline-block;
    background: #2c3e50;
    color: #fff;
    text-decoration: none;
    font-family: "Segoe UI", "Arial Hebrew", Tahoma, sans-serif;
    font-size: 14px;
    line-height: 1;
    padding: 8px 14px;
    border-radius: 8px;
  }
  @media print { .app-chrome { display: none !important; } }
</style>`;

export function withChrome(html: string): string {
  return html.replace("<body>", `<body>\n${CHROME}`);
}

export function readReportHtml(filename: string): string {
  const source = path.join(process.cwd(), "..", filename);
  const bundled = path.join(process.cwd(), "reports", filename);
  return readFileSync(existsSync(source) ? source : bundled, "utf8");
}

export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function replaceConst(html: string, name: string, value: unknown): string {
  const marker = `const ${name} = `;
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`Missing ${name}`);
  let index = at + marker.length;
  while (index < html.length && /\s/.test(html[index])) index += 1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;
  for (let cursor = index; cursor < html.length; cursor += 1) {
    const char = html[cursor];
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
      if (depth === 0) {
        end = cursor + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error(`Could not replace ${name}`);
  if (html[end] === ";") end += 1;
  return html.slice(0, at) + marker + jsonForScript(value) + ";" + html.slice(end);
}
