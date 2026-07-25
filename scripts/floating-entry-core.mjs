import path from "node:path";

export function shouldLaunchFloatingEntry(event, options = {}) {
  const platform = options.platform || process.platform;
  const enabled = options.enabled ?? process.env.TOKEN_HARBOR_FLOATING_ENTRY;
  const launchEvents = new Set(["SessionStart", "UserPromptSubmit"]);
  return platform === "win32" && enabled !== "0" && launchEvents.has(event?.hook_event_name);
}

export function floatingEntryLaunch(scriptDir) {
  return {
    command: "powershell.exe",
    args: [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-WindowStyle",
      "Hidden",
      "-File",
      path.join(scriptDir, "start-floating-entry.ps1")
    ]
  };
}
