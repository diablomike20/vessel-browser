import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { app } from "electron";

test("Community Edition discards legacy Vessel identity without requiring secure storage", async () => {
  const userDataPath = fs.mkdtempSync(path.join(os.tmpdir(), "vessel-premium-failed-migration-"));
  const mutableApp = app as unknown as { getPath: (name: string) => string };
  const originalGetPath = mutableApp.getPath;
  mutableApp.getPath = () => userDataPath;
  const settingsPath = path.join(userDataPath, "vessel-settings.json");
  const tokenPath = path.join(userDataPath, "vessel-premium-token");

  try {
    fs.writeFileSync(
      settingsPath,
      JSON.stringify({
        theme: "dark",
        premium: {
          status: "active",
          customerId: "cus_legacy",
          verificationToken: "only-legacy-token",
          email: "premium@example.com",
          validatedAt: new Date().toISOString(),
          expiresAt: "",
        },
      }),
      "utf-8",
    );
    fs.writeFileSync(tokenPath, "old-token");

    const settingsModule = await import("../src/main/config/settings");
    const settings = settingsModule.loadSettings() as unknown as Record<string, unknown>;
    assert.equal(settings.theme, "dark");
    assert.equal("premium" in settings, false);
    assert.equal(fs.existsSync(tokenPath), false);
    assert.equal(settingsModule.getSettingsLoadIssues().some(
      (issue) => issue.code === "settings-premium-token-migration-failed",
    ), false);

    settingsModule.setSetting("theme", "light");
    await settingsModule.flushPersist();
    const persisted = JSON.parse(fs.readFileSync(settingsPath, "utf-8")) as Record<string, unknown>;
    assert.equal("premium" in persisted, false);
    assert.equal(persisted.theme, "light");
  } finally {
    mutableApp.getPath = originalGetPath;
    fs.rmSync(userDataPath, { recursive: true, force: true });
  }
});
