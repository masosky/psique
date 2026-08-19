import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A variable added to .env.template but never copied into a real .env fails
// silently and late: the app falls back to a development default and only
// misbehaves in production (a canonical URL pointing at localhost, say).
// This catches the drift locally. CI has no .env, so the check skips there.

function keysOf(path: string): string[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim())
    .filter(Boolean);
}

describe("environment", () => {
  const hasEnv = existsSync(".env");

  it.skipIf(!hasEnv)("the local .env defines every key in .env.template", () => {
    const missing = keysOf(".env.template").filter((k) => !keysOf(".env").includes(k));
    expect(missing, `missing from .env: ${missing.join(", ")}`).toEqual([]);
  });

  it("every key in .env.template has a documented purpose", () => {
    // Each variable should be preceded by at least one comment line, so the
    // template stays self-explanatory as it grows.
    const lines = readFileSync(".env.template", "utf8").split("\n");
    const undocumented: string[] = [];
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const previous = lines
        .slice(0, i)
        .reverse()
        .find((l) => l.trim() !== "" && !l.trim().includes("="));
      if (!previous?.trim().startsWith("#")) undocumented.push(trimmed.split("=")[0]);
    });
    expect(undocumented).toEqual([]);
  });
});
