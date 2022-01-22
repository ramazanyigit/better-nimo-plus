// Browser detection code taken from: https://stackoverflow.com/a/9851769
// The code is edited according to requirements.
function detectBrowser() {
  if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0) {
    return "opera";
  }

  if (typeof InstallTrigger !== "undefined") {
    return "firefox";
  }

  // const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  // if (isChrome && navigator.userAgent.indexOf("Edg") != -1) {
  //   return "edge";
  // }

  return "chrome";
}
