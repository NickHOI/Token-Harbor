import path from "node:path";

export function shouldLaunchFloatingEntry(event, options = {}) {
  const platform = options.platform || process.platform;
  const enabled = options.enabled ?? process.env.TOKEN_HARBOR_FLOATING_ENTRY;
  return platform === "win32" && enabled !== "0" && event?.hook_event_name === "SessionStart";
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
      "-STA",
      "-File",
      path.join(scriptDir, "harbor-floating-entry.ps1")
    ]
  };
}
