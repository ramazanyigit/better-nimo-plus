RkzPlus.Appearance = {
  replaceAudienceIcon: function (e) {
    if (!e.classList.contains("nimo-rm")) {
      return;
    }
    let audience = e.getElementsByClassName("nimo-rm_audience");

    if (audience.length === 0) {
      return;
    }

    audience = audience[0];

    if (audience) {
      const title = document.createElement("div");
      title.classList.add("pop-title");
      title.innerHTML = chrome.i18n.getMessage("popularityDesc");
      audience.removeAttribute("title");
      audience.append(title);
    }
  },
  injectClipControls: function (e) {
    if (!e.classList.contains("controls") || e.getAttribute("mode") !== "clip") {
      return;
    }

    const rateWrapper = document.createElement("div");
    rateWrapper.classList.add("rate-control", "speed-rate-control", "control-item");
    rateWrapper.innerHTML = `
      <ul class="rate-control_list">
        <li class="rate-control_item src-item" data-value="2">2x</li>
        <li class="rate-control_item src-item" data-value="1.5">1.5x</li>
        <li class="rate-control_item src-item" data-value="1.25">1.25x</li>
        <li class="rate-control_item src-item" data-value="1">1x</li>
        <li class="rate-control_item src-item" data-value="0.5">0.5x</li>
        <li class="rate-control_item src-item" data-value="0.25">0.25x</li>
      </ul>
      <div class="rate-current">1x</div>
    `;

    const rateControl = e.querySelector(".sub-block .rate-control");

    if (!rateControl) {
      return;
    }

    document.getElementsByTagName("video")[0].addEventListener("ratechange", function () {
      document.querySelector(".speed-rate-control .rate-current").innerHTML = `${this.playbackRate}x`;
    });

    rateControl.parentNode.insertBefore(rateWrapper, rateControl.nextSibling);
    Array.from(document.querySelectorAll(".src-item")).forEach(function (el) {
      el.addEventListener("click", function () {
        const rate = parseFloat(this.getAttribute("data-value"));
        const video = document.getElementsByTagName("video")[0];
        video.playbackRate = rate;
      });
    });

    const downloadButton = document.createElement("div");
    downloadButton.classList.add("pip-control", "control-item");
    downloadButton.setAttribute("download", "clip.mp4");
    downloadButton.setAttribute("target", "_blank");
    downloadButton.innerHTML = `<i class="nimo-icon nimo-icon-download-logo"></i>`;
    downloadButton.addEventListener("click", function () {
      const link = document.createElement("a");
      link.setAttribute("href", document.getElementsByTagName("video")[0].src);
      link.setAttribute("download", "clip.mp4");
      link.setAttribute("target", "_blank");
      link.click();
    });
    const lastEl = e.querySelector(".sub-block:last-child > *:last-child");
    lastEl.parentNode.insertBefore(downloadButton, lastEl);
  },

  addEmptyTagToGiftbox: function (e) {
    let el = e;

    if (!e.classList.contains("nimo-room__chatroom__box-gift")) {
      el = e.getElementsByClassName("nimo-room__chatroom__box-gift")[0];
    }

    if (!el) {
      return;
    }

    el.classList.add("rkzplus-giftbox-empty");
  },
  addEmptyTagToGiftboxIfEggRemoved: function (e) {
    let el = e;

    if (!e.classList.contains("nimo-box-gift__box")) {
      el = e.getElementsByClassName("nimo-box-gift__box")[0];
    }

    if (!el) {
      return;
    }

    const giftBoxContainerEl = document.getElementsByClassName("nimo-room__chatroom__box-gift")[0];

    if (!giftBoxContainerEl) {
      return;
    }

    giftBoxContainerEl.classList.add("rkzplus-giftbox-empty");
  },
  removeEmptyTagFromGiftboxIfGiftboxNotEmpty: function (e) {
    let el = e;

    if (!e.classList.contains("nimo-box-gift__box")) {
      el = e.getElementsByClassName("nimo-box-gift__box")[0];
    }

    if (!el) {
      return;
    }

    document.getElementsByClassName("nimo-room__chatroom__box-gift")[0].classList.remove("rkzplus-giftbox-empty");
  },
  removeUnnecessarySpaces: function (e) {
    // Remove stupid margin-top from chat.
    document.getElementsByClassName("nimo-room__main__sider")[0].style = "margin-top: 0px !important;";
  },
};
