import { spawnSync } from "node:child_process";

const required = ["SUPABASE_TEST_URL", "SUPABASE_TEST_KEY", "TEST_USER_A_EMAIL", "TEST_USER_A_PASSWORD", "TEST_USER_B_EMAIL", "TEST_USER_B_PASSWORD"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing integration test configuration: ${missing.join(", ")}`);
  process.exit(1);
}
const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run"], {
  stdio: "inherit",
  env: { ...process.env, YUMITRACK_INTEGRATION: "1" },
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
