import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// dryRun: true — log-only rollout; flip to false after validating logs on dev
crons.cron("gc orphaned uploads", "0 3 * * *", internal.gc.sweepOrphanedFiles, {
  cursor: null,
  dryRun: true,
});

export default crons;
