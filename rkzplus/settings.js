RkzPlus.Settings = {
  _settings: undefined,
  save: function () {
    localStorage.setItem("settings", JSON.stringify(this._settings));
  },
  load: function () {
    const defaultSettings = {
      hideVideoAnimations: false,
      hideGiftBanner: true,
      hideFollowerMessages: true,
      hideGiftMessages: true,
      hideSidebar: false,
      hideLeaderboard: false,
      hideLiveTime: false,
      hideEyeCatching: false,
      hideRecommendedStreamers: false,
      enableMentions: true,
      enableEmotes: true,
      enableHyperlinks: true,
      hideFanNotifications: true,
      hideSystemMessages: false,
      hidePickMeMessages: false,
      hideSharingMessages: true,
      hideBadges: false,
      hideGiftShop: false,
    };

    this._settings = Object.assign(defaultSettings, JSON.parse(localStorage.getItem("settings") || "{}"));
  },
  get: function (key) {
    if (!RkzPlus.Settings._settings) {
      this.load();
    }

    return this._settings[key];
  },
  set: function (key, value) {
    if (!RkzPlus.Settings._settings) {
      this.load();
    }

    this._settings[key] = value;
    this.save();
  },
};
