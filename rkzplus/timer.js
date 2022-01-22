RkzPlus.Timer = {
  _timerRef: undefined,
  inject: async function (e) {
    if (e.getElementsByClassName("nimo-rm_toolbar").length === 0) {
      return;
    }

    if (RkzPlus.Settings.get("hideLiveTime")) {
      return;
    }

    const toolbarEl = document.getElementsByClassName("nimo-rm_toolbar")[0];
    const streamerData = await RkzPlus.Streamer.getData();

    if (!streamerData) {
      return;
    }

    const isLive =
      (streamerData.liveStreamStatus && document.getElementsByClassName("off-live").length === 0) ||
      (!streamerData.liveStreamStatus && document.querySelector("div.video-player"));

    const startTime = streamerData.liveStreamStatus ? streamerData.startLiveTime * 1000 : new Date().getTime();

    if (!isLive) {
      return;
    }

    const diff = (new Date() - new Date(startTime)) / 1000;
    const timer = RkzPlus.Timer.create(toolbarEl, diff);

    if (!streamerData.liveStreamStatus) {
      const check = async function () {
        if (document.getElementsByClassName("off-live").length !== 0 || !document.getElementById("nimo-player")) {
          return;
        }

        await RkzPlus.Streamer.reload();
        const streamerData = await RkzPlus.Streamer.getData();

        if (streamerData.liveStreamStatus) {
          RkzPlus.Timer.create(toolbarEl, (new Date() - new Date(streamerData.startLiveTime * 1000)) / 1000);
        } else {
          setTimeout(check, 30000);
        }
      };

      timer.classList.add("not-accurate");
      setTimeout(check, 30000);
    }
  },
  injectIfStreamerOnline: function (e) {
    if (!e.classList.contains("off-live") && e.getElementsByClassName("off-live").length === 0) {
      return;
    }

    const els = document.getElementsByClassName("nimo-rm_toolbar");

    if (els.length === 0) {
      return;
    }

    this.inject(els[0].parentNode);
  },
  offLiveRemoveTimer: function (e) {
    if (!e.classList.contains("off-live") && e.getElementsByClassName("off-live").length === 0) {
      return;
    }

    this.clear();
  },
  clear: function () {
    const els = document.getElementsByClassName("nimo-rm_toolbar_live_time");

    Array.from(els).forEach((el) => {
      el.parentNode.removeChild(el);
    });

    clearTimeout(this._timerRef);
    this._timerRef = undefined;
  },
  create: function (el, diff) {
    this.clear();

    let _diff = diff;
    const timeWrapper = document.createElement("div");
    timeWrapper.classList.add("nimo-rm_toolbar_live_time");

    const time = document.createElement("div");
    time.classList.add("live-time-content");

    const timeIcon = document.createElement("span");
    timeIcon.classList.add("live-time-icon");

    const timeText = document.createElement("span");
    timeText.classList.add("live-time-text");

    time.append(timeIcon, timeText);
    timeWrapper.append(time);
    el.prepend(timeWrapper);

    const refresh = () => {
      const timeText = document.getElementsByClassName("live-time-text")[0];

      if (!timeText) {
        return;
      }

      const seconds = Math.floor(_diff % 60);
      const minutes = Math.floor((_diff / 60) % 60);
      const hours = Math.floor(_diff / 3600);

      timeText.innerHTML =
        "" +
        (hours > 9 ? hours : `0${hours}`) +
        ":" +
        (minutes > 9 ? minutes : `0${minutes}`) +
        ":" +
        (seconds > 9 ? seconds : `0${seconds}`);

      _diff += 1;
      this._timerRef = setTimeout(refresh, 1000);
    };

    refresh();
    return timeWrapper;
  },
};