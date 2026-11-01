import { jsonForScript, readReportHtml, replaceConst, withChrome } from "@/lib/reports/files";
import type { TlaPack } from "@/lib/tla/catalog";

function bankBoot(pack: TlaPack): string {
  const json = jsonForScript(pack);
  return `<script>
window.TLA_CATALOG = ${json};
(function () {
  var timer = 0;
  var pending = null;
  function send(pack) {
    var state = document.getElementById("saveState");
    var body = JSON.stringify(pack);
    fetch("/api/tla/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body
    }).then(function (response) {
      if (!state) return;
      state.textContent = response.ok
        ? "נשמר בשרת · " + new Date().toLocaleTimeString("he-IL")
        : "השמירה בשרת נכשלה";
    }).catch(function () {
      if (state) state.textContent = "השמירה בשרת נכשלה";
    });
  }
  window.tlaSaveCatalog = function (pack) {
    pending = pack;
    var state = document.getElementById("saveState");
    if (state) state.textContent = "שומר בשרת…";
    clearTimeout(timer);
    timer = setTimeout(function () { send(pack); }, 400);
  };
  window.addEventListener("pagehide", function () {
    if (!pending) return;
    clearTimeout(timer);
    send(pending);
  });
})();
</script>`;
}

const PLAN_BOOT = `<script>
window.tlaSavePlan = function (plan) {
  fetch("/api/tla/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plan)
  }).then(function (response) {
    if (!response.ok) alert("התוכנית הופקה, אבל השמירה בשרת נכשלה");
  }).catch(function () {
    alert("התוכנית הופקה, אבל השמירה בשרת נכשלה");
  });
};
</script>`;

export function renderBankPage(pack: TlaPack): string {
  const html = withChrome(readReportHtml("TLA-bank.html"));
  const marker = "const SNAPSHOT = ";
  const at = html.indexOf(marker);
  const scriptAt = html.lastIndexOf("<script>", at);
  return html.slice(0, scriptAt) + bankBoot(pack) + html.slice(scriptAt);
}

export function renderGeneratorPage(pack: TlaPack): string {
  let html = withChrome(readReportHtml("TLA.html"));
  html = replaceConst(html, "DOMAINS", pack.domains);
  html = replaceConst(html, "CATALOG", pack.catalog);
  html = replaceConst(html, "SEE", pack.see);
  const end = html.lastIndexOf("</body>");
  return html.slice(0, end) + `${PLAN_BOOT}\n` + html.slice(end);
}

export function htmlResponse(html: string) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache",
    },
  });
}
