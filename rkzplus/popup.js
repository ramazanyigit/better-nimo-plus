let links = [];
moment.locale(window.navigator.userLanguage || window.navigator.language);

function localizeHtmlPage() {
  var objects = document.getElementsByTagName("html");
  for (var j = 0; j < objects.length; j++) {
    var obj = objects[j];

    var valStrH = obj.innerHTML.toString();
    var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
      return v1 ? chrome.i18n.getMessage(v1) : "";
    });

    if (valNewH != valStrH) {
      obj.innerHTML = valNewH;
    }
  }
}

localizeHtmlPage();

chrome.permissions.contains(
  {
    permissions: WATCHER_PERMISSIONS,
  },
  (result) => {
    if (result) {
      chrome.storage.local.set({ "rkzplus-watcher-active": true });
      initProgram();
    } else {
      initEnable();
    }
  }
);

function initEnable() {
  document.querySelector("#enable-button").addEventListener("click", function () {
    chrome.permissions.request(
      {
        permissions: WATCHER_PERMISSIONS,
      },
      (granted) => {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
          initProgram();
          chrome.runtime.sendMessage({
            type: "trigger-watcher"
          });
        }
      }
    );
  });
}

function initProgram() {
  document.querySelector("#enable-button").remove();
  document.querySelector("#active-content").style.display = "block";
  document.querySelector("#add-show").parentNode.style.display = "flex";
  chrome.storage.local.get({ "rkzplus-follow-links": [] }, function (value) {
    links = value["rkzplus-follow-links"].sort(function (a, b) {
      if (a.isLive) {
        return -1;
      }

      if (b.isLive) {
        return 1;
      }

      return a.nickname.localeCompare(b.nickname);
    });

    setBadgeText(links.filter((ch) => ch.isLive).length || 0);
    renderLinks();
  });

  document.getElementById("submit").addEventListener("click", function () {
    const input = document.getElementById("url").value.trim();

    if (input.length === 0) {
      return;
    }

    chrome.runtime.sendMessage(
      {
        type: "fetch-url",
        url: input,
      },
      (response) => {
        if (!response) {
          return;
        }

        links.push({
          id: response.roomId,
          url: input,
          nickname: response.nickname,
          avatarUrl: response.avatarUrl,
          isLive: response.isLive,
          startLiveTime: response.startLiveTime * 1000,
          endLiveTime: response.endLiveTime * 1000,
          game: response.game,
        });

        chrome.storage.local.set({ "rkzplus-follow-links": links });
        setBadgeText(links.filter((ch) => ch.isLive).length || 0);
        renderLinks();
      }
    );
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeUrl;

    try {
      activeUrl = new URL(tabs[0].url);
    } catch (_) {
      return;
    }

    if (activeUrl.hostname !== "nimo.tv" && activeUrl.hostname !== "www.nimo.tv") {
      return;
    }

    const paths = activeUrl.pathname.slice(1).split("/");

    if (paths.length === 1 || paths[0] === "live") {
      chrome.runtime.sendMessage(
        {
          type: "fetch-url",
          url: activeUrl.toString(),
        },
        (response) => {
          if (!response) {
            return;
          }

          const link = {
            id: response.roomId,
            url: activeUrl.toString(),
            nickname: response.nickname,
            avatarUrl: response.avatarUrl,
            isLive: response.liveStreamStatus,
            startLiveTime: response.startLiveTime * 1000,
            endLiveTime: response.endLiveTime * 1000,
            game: response.game,
          };

          document.getElementById("status").innerHTML = "";
          const header = document.createElement("h3");
          header.innerHTML = `${chrome.i18n.getMessage("watcherCurrentlyWatching")}:`;
          header.style.marginBottom = "0.5rem";
          document.getElementById("status").append(header);
          document.getElementById("status").append(renderLink(link, -1));
        }
      );
    }

    // document.getElementById("status").innerHTML = activeUrl.toString();
  });

  document.getElementById("add-show").addEventListener("click", function () {
    if (document.getElementById("add-content").style.display === "flex") {
      document.getElementById("add-content").style.display = "none";
    } else {
      document.getElementById("add-content").style.display = "flex";
    }
  });
}

function renderLink(link, idx = -1) {
  let div = document.createElement("div");
  div.className = "stream-link";
  if (idx === -1) {
    div.id = `stream-link-main`;
  } else {
    div.id = `stream-link-${link.id}`;
  }

  let img = document.createElement("img");
  img.src = link.avatarUrl;
  img.className = "avatar";
  img.style.cursor = "pointer";
  img.onclick = function () {
    window.open(link.url, "_blank").focus();
  };

  let content = document.createElement("div");
  content.className = "content";
  content.innerHTML = `
    <div style="display: block; font-size: .95rem; font-weight:bold;" class="stream-title">
    ${link.isLive ? chrome.i18n.getMessage("watcherIsPlaying", [link.nickname, link.game]) : link.nickname}
    </div>
    <div${link.isLive ? ' style="color: #ff6868; font-weight: bold;"' : ' style="color: #ccc"'}>${
    link.isLive ? "<span class='live-icon'></span>" : chrome.i18n.getMessage("watcherOffline")
  }${
    link.isLive
      ? ` ${moment.utc(moment().diff(moment(link.startLiveTime))).format("HH:mm:ss")}`
      : ` ${moment(link.endLiveTime).fromNow()}`
  }</div>
  `;

  content.style.cursor = "pointer";
  content.onclick = function () {
    window.open(link.url, "_blank").focus();
  };

  div.append(img, content);

  if (idx > -1) {
    let button = document.createElement("button");
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 32 32" width="32px" height="32px"><path d="M 15 4 C 14.476563 4 13.941406 4.183594 13.5625 4.5625 C 13.183594 4.941406 13 5.476563 13 6 L 13 7 L 7 7 L 7 9 L 8 9 L 8 25 C 8 26.644531 9.355469 28 11 28 L 23 28 C 24.644531 28 26 26.644531 26 25 L 26 9 L 27 9 L 27 7 L 21 7 L 21 6 C 21 5.476563 20.816406 4.941406 20.4375 4.5625 C 20.058594 4.183594 19.523438 4 19 4 Z M 15 6 L 19 6 L 19 7 L 15 7 Z M 10 9 L 24 9 L 24 25 C 24 25.554688 23.554688 26 23 26 L 11 26 C 10.445313 26 10 25.554688 10 25 Z M 12 12 L 12 23 L 14 23 L 14 12 Z M 16 12 L 16 23 L 18 23 L 18 12 Z M 20 12 L 20 23 L 22 23 L 22 12 Z"/></svg>';
    button.className = "remove-button";
    button.addEventListener("click", function () {
      links.splice(idx, 1);
      setBadgeText(links.filter((ch) => ch.isLive).length || 0);
      chrome.storage.local.set({ "rkzplus-follow-links": links });
      renderLinks();
    });
    div.append(button);
  } else if (links.findIndex((l) => l.id === link.id) === -1) {
    let button = document.createElement("button");
    button.style.marginRight = "3px";
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24px" height="24px">    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M37,26H26v11h-2V26H13v-2h11V13h2v11h11V26z"/></svg>';
    button.className = "add-button";
    button.addEventListener("click", function () {
      links.push(link);
      setBadgeText(links.filter((ch) => ch.isLive).length || 0);
      chrome.storage.local.set({ "rkzplus-follow-links": links });
      this.remove();
      renderLinks();
    });
    div.append(button);
  }

  return div;
}

function renderLinks() {
  const linkContainer = document.getElementById("links");
  linkContainer.innerHTML = "";
  links.forEach(function (link, idx) {
    linkContainer.appendChild(renderLink(link, idx));
  });

  if (links.length === 0) {
    linkContainer.innerHTML = `<div class="text-center no-follow-links">
      <span>${chrome.i18n.getMessage("watcherNoFollowLinks")}</span>
    </div>`;
  }
}
