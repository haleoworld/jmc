#!/usr/bin/env node
// Pre-deploy validation for app.html (the only file deployed to haleoworld/jmc).
// Mirrors the README checklist:
//   1. Extract the inline <script> and node --check it (syntax).
//   2. Confirm <div>/<section> open/close balance.
//   3. Cross-check getElementById("literal") against id="..." in the markup.
// Exit non-zero on any failure so deploy.sh aborts before pushing.

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const FILE = path.join(__dirname, "..", "app.html");
const KNOWN_BENIGN_IDS = new Set([
  "__print_frame",  // built dynamically at print time
  "__err_banner",   // built dynamically by the on-screen error reporter
]);

const html = fs.readFileSync(FILE, "utf8");
let failures = 0;
const fail = (msg) => { console.error("  ✗ " + msg); failures++; };
const ok = (msg) => console.log("  ✓ " + msg);

// ---- 1. Inline script syntax ----------------------------------------------
// The inline block is the <script> with no attributes (the external Chart.js
// tag has a src=). Grab the last <script>...</script> with a bare opening tag.
const inlineMatch = html.match(/<script>\s*([\s\S]*?)<\/script>/);
if (!inlineMatch) {
  fail("could not locate an inline <script> block");
} else {
  const tmp = path.join(os.tmpdir(), "app_inline_check.js");
  fs.writeFileSync(tmp, inlineMatch[1]);
  try {
    execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
    ok("inline <script> passes node --check");
  } catch (e) {
    fail("inline <script> failed node --check:\n" + (e.stderr || e.stdout || e).toString());
  } finally {
    fs.unlinkSync(tmp);
  }
}

// ---- 2. Tag balance --------------------------------------------------------
for (const tag of ["div", "section"]) {
  const open = (html.match(new RegExp("<" + tag + "(?=[\\s>])", "g")) || []).length;
  const close = (html.match(new RegExp("</" + tag + ">", "g")) || []).length;
  if (open === close) ok(`<${tag}> balanced (${open} open / ${close} close)`);
  else fail(`<${tag}> imbalance: ${open} open vs ${close} close`);
}

// ---- 3. getElementById literals resolve to a defined id -------------------
const defined = new Set();
for (const m of html.matchAll(/\bid=["']([^"']+)["']/g)) defined.add(m[1]);

const missing = new Set();
for (const m of html.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)) {
  const id = m[1];
  if (!defined.has(id) && !KNOWN_BENIGN_IDS.has(id)) missing.add(id);
}
if (missing.size === 0) ok("all getElementById() literals resolve to an id=\"...\"");
else fail("getElementById refers to undefined id(s): " + [...missing].join(", "));

// ---- result ---------------------------------------------------------------
if (failures) {
  console.error(`\nVALIDATION FAILED (${failures} issue${failures > 1 ? "s" : ""}).`);
  process.exit(1);
}
console.log("\nValidation passed.");
