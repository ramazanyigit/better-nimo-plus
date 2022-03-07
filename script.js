RkzPlus.Emote.load();

const username = RkzPlus.Core.getCookie("userName");
new MutationObserver((e) => {
  for (const o of e) {
    if ("childList" === o.type) {
      for (const e of o.removedNodes) {
        if (!e || !e.classList) {
          continue;
        }

        RkzPlus.Timer.injectIfStreamerOnline(e);
        RkzPlus.Appearance.addEmptyTagToGiftboxIfEggRemoved(e);
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
          RkzPlus.SettingsMenu.injectMenuIcon(e, RkzPlus.Settings.get('hideChat'));

          RkzPlus.Appearance.replaceAudienceIcon(e);
          RkzPlus.Appearance.injectClipControls(e);

          RkzPlus.Emote.injectMenu(e);

          RkzPlus.Mention.inject(e);
          RkzPlus.Mention.injectFullscreen(e);

          RkzPlus.Timer.inject(e);
          RkzPlus.Timer.offLiveRemoveTimer(e);

          RkzPlus.Core.fixChromeVideoBug(e);
          RkzPlus.Appearance.addEmptyTagToGiftbox(e);
          RkzPlus.Appearance.removeEmptyTagFromGiftboxIfGiftboxNotEmpty(e);

          RkzPlus.Chat.injectChatHistory(e);
        }
      }
    }
  }
}).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: false,
});
