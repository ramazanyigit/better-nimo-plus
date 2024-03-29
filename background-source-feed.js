chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    const infoUrl = new URL(info.url);
    if (infoUrl.searchParams.get("ratio") === "6000") {
      infoUrl.searchParams.delete("ratio");
      infoUrl.searchParams.delete("needwm");
      infoUrl.searchParams.delete("appid");
      infoUrl.searchParams.delete("tp");
      infoUrl.searchParams.delete("sphd");
      infoUrl.searchParams.delete("u");
      infoUrl.searchParams.delete("t");
      infoUrl.searchParams.delete("sv");

      return { redirectUrl: infoUrl.toString() };
    }
  },
  {
    urls: ["https://*.flv.nimo.tv/backsrc/*"],
    types: ["xmlhttprequest"],
  },
  ["blocking"]
);
