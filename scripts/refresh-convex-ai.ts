import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const startMarker = "<!-- convex-ai-start -->";
const endMarker = "<!-- convex-ai-end -->";
const agentsPath = path.join(process.cwd(), "AGENTS.md");

function splitManagedSection(content: string) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    throw new Error("AGENTS.md is missing the managed Convex section");
  }

  const sectionEnd = end + endMarker.length;
  return {
    before: content.slice(0, start),
    managed: content.slice(start, sectionEnd),
    after: content.slice(sectionEnd),
  };
}

const original = splitManagedSection(await readFile(agentsPath, "utf8"));
const update = spawnSync("bunx", ["convex", "ai-files", "update"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (update.status !== 0) process.exit(update.status ?? 1);

const updated = splitManagedSection(await readFile(agentsPath, "utf8"));
await writeFile(
  agentsPath,
  `${original.before}${updated.managed}${original.after}`,
);

console.log(
  "Updated Convex AI files without changing unmanaged repository policy.",
);
