async function fetchStreamerData(url) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("pragma", "no-cache");
    myHeaders.append("cache-control", "no-store");
    const data = await fetch(url, { headers: myHeaders, cache: "no-store" });
    const text = await data.text();
    const bodyPos = text.indexOf("<body");
    const scriptStartPos = text.indexOf("<script", bodyPos);
    const scriptEndPos = text.indexOf("</script>", scriptStartPos);
    const script = text.substring(scriptStartPos, scriptEndPos);
    const dataStart = script.indexOf("{");
    const dataEnd = script.lastIndexOf("}");
    const dataBody = script.substring(dataStart, dataEnd + 1);
    try {
      return JSON.parse(dataBody);
    } catch (_) {
      return undefined;
    }
  } catch (_) {
    return undefined;
  }
}

const triggerWatcher = function () {
  chrome.permissions.contains(
    {
      permissions: WATCHER_PERMISSIONS,
    },
    (result) => {
      if (!result) {
        console.log("RKZPLUS: Permissions not granted! Watcher is disabled.");
        return;
      }

      console.log("RKZPLUS: Permissions granted! Watcher is activated.");

      const refreshLinks = () => {
        chrome.storage.local.get({ "rkzplus-follow-links": [] }, async function (value) {
          let channels = value["rkzplus-follow-links"];

          if (channels.length === 0) {
            setTimeout(refreshLinks, 30000);
            return;
          }

          channels = channels.map(async (ch) => {
            const data = await fetchStreamerData(ch.url);

            if (!data) {
              return {
                ...ch,
                fetchProblem: true,
              };
            } else {
              const newCh = {
                id: data.roomId,
                url: ch.url,
                nickname: data.nickname,
                avatarUrl: data.avatarUrl,
                isLive: data.liveStreamStatus,
                startLiveTime: data.startLiveTime * 1000,
                endLiveTime: data.endLiveTime * 1000,
                game: data.game,
              };

              if (!ch.isLive && newCh.isLive) {
                chrome.notifications.create(
                  ch.url,
                  {
                    type: "basic",
                    iconUrl: "images/128.png",
                    title: chrome.i18n.getMessage("watcherIsLive", [newCh.nickname]),
                    message: chrome.i18n.getMessage("watcherIsPlayingNotification", [newCh.nickname, newCh.game]),
                  },
                  function () {}
                );

                chrome.notifications.onClicked.addListener(function (notificationId) {
                  chrome.tabs.create({ url: notificationId });
                });
              }

              return {
                ...ch,
                ...newCh,
                fetchProblem: false,
              };
            }
          });

          chrome.storage.local.set({ "rkzplus-follow-links": await Promise.all(channels) });
          setTimeout(refreshLinks, 30000);
        });
      };

      refreshLinks();
    }
  );
};

triggerWatcher();

chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.type === "trigger-watcher") {
    triggerWatcher();
    sendResponse();
  }

  if (request.type === "fetch-url") {
    fetchStreamerData(request.url).then(sendResponse);
  }

  return true;
});
