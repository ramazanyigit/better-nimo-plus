RkzPlus.SettingsMenu = {
  injectMenuIcon: function (e) {
    if (!e || !e.classList) {
      return;
    }

    let iconWrapper = e.getElementsByClassName("chat-input-toolbar-icon-wrap");
    if (iconWrapper.length === 0) {
      return;
    }

    iconWrapper = iconWrapper[0];
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.classList.add("n-as-fs24", "n-as-pointer", "c2", "c-hover1", "n-as-mrgh", "feather", "feather-settings");
    icon.id = "rkzplus-settings-icon";
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.setAttribute("xmlns", "https://www.w3.org/2000/svg");
    icon.innerHTML =
      '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>';

    iconWrapper.append(icon);
    this.injectMenu(
      document.getElementsByClassName("nimo-room__chatroom")[0] ||
        document.getElementsByClassName("streamer-chatbox-chat")[0]
    );
  },
  createMenuItem: function (label, key, action = function () {}, trigger = true) {
    const optionValue = RkzPlus.Settings.get(key) === true;
    const item = document.createElement("div");
    item.classList.add("BNTV_Settings_MENU_ITEM");

    const itemLabel = document.createElement("span");
    itemLabel.classList.add("BNTV_T");
    itemLabel.innerHTML = label;

    const itemSwitch = document.createElement("label");
    itemSwitch.classList.add("switch");

    const itemInput = document.createElement("input");
    itemInput.type = "checkbox";
    itemInput.checked = optionValue;
    itemInput.addEventListener("change", function (e) {
      RkzPlus.Settings.set(key, e.target.checked);
      action(e.target.checked);
    });

    if (trigger) {
      action(optionValue);
    }

    const itemSlider = document.createElement("span");
    itemSlider.classList.add("slider", "round");

    itemSwitch.append(itemInput, itemSlider);
    item.append(itemLabel, itemSwitch);
    return item;
  },
  createMenuHeader: function (label) {
    const header = document.createElement("div");
    header.classList.add("RkzPlus_Settings_MENU_HEADER");
    header.innerHTML = label;
    return header;
  },
  injectMenu: function (e) {
    if (!e) {
      return;
    }

    const settingsMenuWrapper = document.createElement("div");
    settingsMenuWrapper.id = "BNTV_Settings_MENU";
    settingsMenuWrapper.className = "BNTV_Settings_MENU";
    settingsMenuWrapper.style.display = "none";

    settingsMenuWrapper.innerHTML =
      '<div class="BNTV_ITEM_H"><div class="BNTV_T">' +
      chrome.i18n.getMessage("settingsTitle") +
      '</div><div id="BNTV_MENU_hide">' +
      chrome.i18n.getMessage("settingsCloseButton") +
      "</div></div>";

    const settingsMenu = document.createElement("div");
    settingsMenu.className = "BNTV_Settings_MENU_CONTENT";
    settingsMenuWrapper.append(settingsMenu);

    settingsMenu.append(this.createMenuHeader(chrome.i18n.getMessage("settingAppearance")));

    /// OPTION 1: HIDE SIDEBAR
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideSidebar"),
        "hideSidebar",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-sidebar")
      )
    );

    /// OPTION 2: HIDE LEADERBOARD
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideLeaderboard"),
        "hideLeaderboard",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-leaderboard")
      )
    );

    /// OPTION 10: HIDE RECOMMENDED STREAMERS
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideStreamRecommendations"),
        "hideRecommendedStreamers",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-recommended-streamers")
      )
    );

    /// OPTION 10: HIDE RECOMMENDED STREAMERS
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideGiftShop"),
        "hideGiftShop",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-gift-shop")
      )
    );

    /// OPTION 9: HIDE LIVE TIME
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideLiveTime"),
        "hideLiveTime",
        function (value) {
          RkzPlus.Timer.clear();

          if (!value) {
            RkzPlus.Timer.inject(document.body);
          }
        },
        false
      )
    );

    /// OPTION 3: HIDE CHAT
    settingsMenu.append(
      this.createMenuItem(chrome.i18n.getMessage("settingHideChat"), "hideChat", (value) => {
        const messageList = document.querySelector(".MessageList");

        if (!messageList) {
          return;
        }

        if (value) {
          messageList.style.display = "none";
        } else {
          messageList.style.display = "block";
        }
      })
    );
    

    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideChatroomGiftBox"),
        "hideChatroomGiftBox",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-chatroom-gift-box")
      )
    );

    settingsMenu.append(this.createMenuHeader(chrome.i18n.getMessage("settingNotifications")));
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideTopLeftGiftBanners"),
        "hideGiftBanner",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-gift-banner")
      )
    );

    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideAnimatedGifts"),
        "hideVideoAnimations",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-video-animations")
      )
    );

    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideFollowerMessages"),
        "hideFollowerMessages",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-follower-messages")
      )
    );

    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideChatGiftMessages"),
        "hideGiftMessages",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-gift-messages")
      )
    );

    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideFanNotifications"),
        "hideFanNotifications",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-fan-messages")
      )
    );

    /// OPTION 17: HIDE STREAM SHARING MESSAGES
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideSharingMessages"),
        "hideSharingMessages",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-share-messages")
      )
    );

    settingsMenu.append(this.createMenuHeader(chrome.i18n.getMessage("settingMessages")));

    /// OPTION 11: ENABLE MENTIONS
    settingsMenu.append(this.createMenuItem(chrome.i18n.getMessage("settingEnableMentions"), "enableMentions"));

    /// OPTION 12: ENABLE EMOTES
    settingsMenu.append(this.createMenuItem(chrome.i18n.getMessage("settingEnableEmotes"), "enableEmotes"));

    /// OPTION 13: ENABLE HYPERLINKS
    settingsMenu.append(this.createMenuItem(chrome.i18n.getMessage("settingEnableHyperlinks"), "enableHyperlinks"));

    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideEyeCatchingMessages"),
        "hideEyeCatching",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-eye-catching-messages")
      )
    );

    /// OPTION 15: HIDE SYSTEM MESSAGES
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideSystemMessages"),
        "hideSystemMessages",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-system-messages")
      )
    );

    /// OPTION 16: HIDE PICKME MESSAGES
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHidePickMeMessages"),
        "hidePickMeMessages",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-pickme-messages")
      )
    );

    /// OPTION 18: HIDE BADGES
    settingsMenu.append(
      this.createMenuItem(
        chrome.i18n.getMessage("settingHideBadges"),
        "hideBadges",
        RkzPlus.Core.generateToggleBodyClassNameAction("nimo-hide-badges")
      )
    );

    e.parentNode.parentNode.prepend(settingsMenuWrapper);

    document.getElementById("rkzplus-settings-icon").onclick = function () {
      const menu = document.getElementById("BNTV_Settings_MENU");
      if (menu.style.display === "none") {
        menu.style.display = "block";
      } else {
        menu.style.display = "none";
      }
    };

    document.getElementById("BNTV_MENU_hide").onclick = function () {
      const menu = document.getElementById("BNTV_Settings_MENU");
      menu.style.display = "none";
    };
  },
};
