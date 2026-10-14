// Syncs .claude-plugin/plugin.json version with package.json version.
// Run: node scripts/sync-plugin-version.mjs          → write
//      node scripts/sync-plugin-version.mjs --check  → verify only (CI)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const pluginPath = join(root, ".claude-plugin", "plugin.json");
const plugin = JSON.parse(readFileSync(pluginPath, "utf8"));

if (process.argv.includes("--check")) {
  if (plugin.version !== pkg.version) {
    console.error(
      `plugin.json version (${plugin.version}) != package.json version (${pkg.version}). Run: npm run version`
    );
    process.exit(1);
  }
  console.log(`plugin.json version matches package.json (${pkg.version})`);
  process.exit(0);
}

plugin.version = pkg.version;
writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + "\n");
console.log(`plugin.json version synced to ${pkg.version}`);
