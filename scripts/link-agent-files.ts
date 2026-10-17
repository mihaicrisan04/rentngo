import { lstat, readdir, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skillsPath = path.join(root, ".agents/skills");
const skills = (await readdir(skillsPath, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

async function createAdapter(
  relativePath: string,
  target: string,
  type?: "dir",
) {
  const adapter = path.join(root, relativePath);
  await rm(adapter, { force: true, recursive: true });

  try {
    await symlink(target, adapter, type);
  } catch (error) {
    if (process.platform !== "win32") throw error;
    await writeFile(adapter, target);
  }
}

await lstat(path.join(root, "AGENTS.md"));
await lstat(path.join(root, ".agents/plans"));
await createAdapter("CLAUDE.md", "AGENTS.md");
await createAdapter(".claude/plans", "../.agents/plans", "dir");

for (const skill of skills) {
  await lstat(path.join(root, ".agents/skills", skill, "SKILL.md"));
  await createAdapter(
    `.claude/skills/${skill}`,
    `../../.agents/skills/${skill}`,
    "dir",
  );
}

console.log(
  `Linked root instructions, plans, and ${skills.length} skills for Claude.`,
);
