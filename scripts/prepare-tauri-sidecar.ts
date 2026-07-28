import { mkdir } from "node:fs/promises";
import path from "node:path";

const targets: Record<string, Record<string, { bunTarget: string; tauriTarget: string }>> = {
  darwin: {
    arm64: { bunTarget: "bun-darwin-arm64", tauriTarget: "aarch64-apple-darwin" },
    x64: { bunTarget: "bun-darwin-x64", tauriTarget: "x86_64-apple-darwin" },
  },
  linux: {
    arm64: { bunTarget: "bun-linux-arm64", tauriTarget: "aarch64-unknown-linux-gnu" },
    x64: { bunTarget: "bun-linux-x64", tauriTarget: "x86_64-unknown-linux-gnu" },
  },
  win32: {
    arm64: { bunTarget: "bun-windows-arm64", tauriTarget: "aarch64-pc-windows-msvc" },
    x64: { bunTarget: "bun-windows-x64", tauriTarget: "x86_64-pc-windows-msvc" },
  },
};

const targetsByTauriTarget = Object.values(targets).flatMap((platformTargets) => Object.values(platformTargets))
  .reduce<Record<string, { bunTarget: string; tauriTarget: string }>>((acc, currentTarget) => {
    acc[currentTarget.tauriTarget] = currentTarget;
    return acc;
  }, {});

const requestedTauriTarget = process.env.RUNECHAT_SIDECAR_TAURI_TARGET || process.env.TAURI_ENV_TARGET_TRIPLE;
const target = requestedTauriTarget
  ? targetsByTauriTarget[requestedTauriTarget]
  : targets[process.platform]?.[process.arch];

if (!target) {
  if (requestedTauriTarget) {
    throw new Error(`Tauri sidecar builds are not configured for target ${requestedTauriTarget}`);
  }
  throw new Error(`Tauri sidecar builds are not configured for ${process.platform}/${process.arch}`);
}

// Keep generated executables outside src-tauri: `tauri dev` watches that
// directory and would otherwise relaunch the app every time this is compiled.
const binariesDir = path.join(import.meta.dir, "..", ".tauri", "binaries");
const extension = process.platform === "win32" ? ".exe" : "";
const output = path.join(binariesDir, `runechat-server-${target.tauriTarget}${extension}`);

await mkdir(binariesDir, { recursive: true });
const result = Bun.spawn([
  "bun", "build", "--compile", `--target=${target.bunTarget}`, "server.ts", `--outfile=${output}`,
], { stdout: "inherit", stderr: "inherit" });
if (await result.exited) throw new Error("Could not compile the RuneChat API sidecar");

console.log(`Prepared Tauri API sidecar: ${path.relative(process.cwd(), output)}`);
