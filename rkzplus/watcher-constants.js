const CHROME_PERMISSIONS = ["background", "storage", "notifications", "activeTab"];
const OPERA_PERMISSIONS = ["storage", "notifications", "activeTab"];
const FIREFOX_PERMISSIONS = ["notifications", "activeTab"];

function detectPermissions() {
  const browser = detectBrowser();

  if (browser === "opera") {
    return OPERA_PERMISSIONS;
  } else if(browser === "firefox") {
    return FIREFOX_PERMISSIONS;
  }

  return CHROME_PERMISSIONS;
}

const WATCHER_PERMISSIONS = detectPermissions();
