RkzPlus.Emote.load();

function fixChromeVideoBug(e) {
  if (e && e.nodeName && e.nodeName.toLowerCase() === "video") {
    const videoContainer = e.parentElement;
    if (videoContainer && videoContainer.classList && videoContainer.classList.contains("video-player")) {
      const videos = videoContainer.getElementsByTagName("video");
      if (videos && videos.length > 1) {
        videos[0].remove();
      }

      const current = document.querySelector(".speed-rate-control .rate-current");

      if (!current) {
        return;
      }

      document.querySelector(".speed-rate-control .rate-current").innerHTML = `${
        document.getElementsByTagName("video")[0].playbackRate
      }x`;
      document.getElementsByTagName("video")[0].addEventListener("ratechange", function () {
        document.querySelector(".speed-rate-control .rate-current").innerHTML = `${this.playbackRate}x`;
      });
    }
  }
}

const username = RkzPlus.Core.getCookie("userName");
new MutationObserver((e) => {
  for (const o of e) {
    if ("childList" === o.type) {
      for (const e of o.removedNodes) {
        if (!e || !e.classList) {
          continue;
        }

        RkzPlus.Timer.injectIfStreamerOnline(e);
      }

      for (const e of o.addedNodes) {
        if (!e || !e.classList) {
          continue;
        }

        if (RkzPlus.Chat.isUserMessage(e)) {
          RkzPlus.Chat.enrichMessage(username, e);
        } else if (RkzPlus.Chat.isBotMessage(e)) {
          RkzPlus.Chat.enrichMessage(username, e, true);
        } else {
          RkzPlus.SettingsMenu.injectMenuIcon(e);

          RkzPlus.Appearance.replaceAudienceIcon(e);
          RkzPlus.Appearance.injectClipControls(e);

          RkzPlus.Emote.injectMenu(e);

          RkzPlus.Mention.inject(e);
          RkzPlus.Mention.injectFullscreen(e);

          RkzPlus.Timer.inject(e);
          RkzPlus.Timer.offLiveRemoveTimer(e);

          fixChromeVideoBug(e);
        }
      }
    }
  }
}).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: false,
});
