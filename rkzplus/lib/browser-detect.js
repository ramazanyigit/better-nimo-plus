function detectBrowser() {
  if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0) {
    return "opera";
  }

  if (typeof InstallTrigger !== "undefined") {
    return "firefox";
  }

  return "chrome";
}

function setBadgeText(text) {
  if (text <= 0) {
    chrome.browserAction.setBadgeText({text: ""});
    return;
  }

  if (detectBrowser() === "firefox") {
    chrome.browserAction.setBadgeTextColor({ color: "#FFF" });
  }
  
  chrome.browserAction.setBadgeBackgroundColor({ color: "#F00" }, () => {
    chrome.browserAction.setBadgeText({ text: `${text}` });
  });
}
