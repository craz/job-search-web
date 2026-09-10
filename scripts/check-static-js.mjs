#!/usr/bin/env node
/**
 * Mandatory syntax gate for shipped Web static JS.
 * Fail closed: missing Node or any SyntaxError → non-zero exit.
 */
import { readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const staticDir = join(root, "src", "job_search_web", "static");

function listJsFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) out.push(...listJsFiles(path));
    else if (name.endsWith(".js")) out.push(path);
  }
  return out;
}

const files = listJsFiles(staticDir);
if (!files.length) {
  console.error("check-static-js: no shipped .js under static/");
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  const rel = relative(root, file);
  if (result.status !== 0) {
    failed += 1;
    console.error(`FAIL ${rel}`);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.stdout) process.stderr.write(result.stdout);
  } else {
    console.log(`OK   ${rel}`);
  }
}

if (failed) {
  console.error(`check-static-js: ${failed} file(s) failed syntax check`);
  process.exit(1);
}
console.log(`check-static-js: ${files.length} file(s) parsed`);
