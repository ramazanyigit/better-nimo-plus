const RkzPlus = {};

RkzPlus.Core = {
  generateToggleBodyClassNameAction: function (className) {
    return function (value) {
      if (value) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    };
  },
  getCookie: function (cname) {
    const name = cname + "=";
    let ca = decodeURIComponent(document.cookie).split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },
  fixChromeVideoBug: function (e) {
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
  },
  maximizeResolution: function (e) {
    if (RkzPlus.Settings.get("enableMaxResolution"))
      document.getElementsByClassName("rate-control_list")[0].children[0].click();
  },
};
