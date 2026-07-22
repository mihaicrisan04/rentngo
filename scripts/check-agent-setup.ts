import { lstat, readFile, readdir, readlink } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const errors: string[] = [];

async function requireSymlink(relativePath: string, expectedTarget: string) {
  const absolutePath = path.join(root, relativePath);
  try {
    const stat = await lstat(absolutePath);
    const target = stat.isSymbolicLink()
      ? await readlink(absolutePath)
      : (await readFile(absolutePath, "utf8")).trim();
    if (target !== expectedTarget) {
      errors.push(`${relativePath} must link to ${expectedTarget}`);
    }
  } catch {
    errors.push(`${relativePath} is missing or has an invalid adapter target`);
  }
}

await requireSymlink("CLAUDE.md", "AGENTS.md");
await requireSymlink(".claude/plans", "../.agents/plans");

const lock = JSON.parse(
  await readFile(path.join(root, "skills-lock.json"), "utf8"),
) as {
  skills: Record<string, unknown>;
};

const requiredSkills = [
  "agent-browser",
  "dia-browser",
  "working-with-convex",
  "working-with-plans",
  "convex",
  "convex-create-component",
  "convex-migration-helper",
  "convex-performance-audit",
  "convex-quickstart",
  "convex-setup-auth",
];

for (const skill of requiredSkills) {
  const skillFile = path.join(root, ".agents/skills", skill, "SKILL.md");
  try {
    await lstat(skillFile);
  } catch {
    errors.push(`missing .agents/skills/${skill}/SKILL.md`);
  }

  await requireSymlink(
    `.claude/skills/${skill}`,
    `../../.agents/skills/${skill}`,
  );
}

for (const skill of requiredSkills.filter((name) =>
  name.startsWith("convex"),
)) {
  if (!(skill in lock.skills)) {
    errors.push(`${skill} is missing from skills-lock.json`);
  }
}

const activePlansPath = path.join(root, ".agents/plans/active");
for (const plan of await readdir(activePlansPath)) {
  if (!plan.endsWith(".md")) continue;
  const content = await readFile(path.join(activePlansPath, plan), "utf8");
  if (
    !content.startsWith("---\n") ||
    !content.includes("\nlinear:") ||
    !content.includes("\nlast-verified:")
  ) {
    errors.push(`active plan ${plan} is missing Linear freshness metadata`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Agent setup is valid (${requiredSkills.length} required skills).`);
