function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
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
}

function hideDivF(cb, classn) {
  var checkBox = document.getElementById(cb);
  var x = document.getElementsByClassName(classn)[0];
  if (checkBox.checked == true) {
    x.style.display = "none";
  } else {
    if (classn == "nimo-room__gift-shop") {
      x.style.display = "flex";
    } else {
      x.style.display = "block";
    }
  }
}

let emotes;

const getGlobalEmotes = async () => {
  const data = await fetch(
    "https://gist.githubusercontent.com/ramazanyigit/8c51dc5abd8f8737d53926588b325904/raw/50e39f5d0811b3cb6fdbb4e314c9d1e53de0c130/betternimo-emotes.json"
  );
  const json = await data.json();
  return json;
};

(async () => {
  "use strict";
  emotes = await getGlobalEmotes();
  emotes = emotes.reduce((acc, curr) => {
    acc[curr.word] = curr;
    return acc;
  }, {});
})();

const modIconURL = chrome.runtime.getURL("images/mod_icon.png");
const adminIconURL = chrome.runtime.getURL("images/admin_icon.png");

let usersColors = JSON.parse(localStorage.getItem("usersColors") || "{}");
let settings = getSettings();

function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

function getSettings() {
  return JSON.parse(
    localStorage.getItem("settings") ||
      `{
      "hideVideoAnimations": false,
      "hideGiftBanner": true,
      "hideFollowerMessages": true,
      "hideGiftMessages": true,
      "hideSidebar": false,
      "hideLeaderboard": false
    }`
  );
}

function replaceAudienceIconIfChanged(e) {
  if (e && e.classList && e.classList.contains("nimo-rm")) {
    let audience = e.getElementsByClassName("nimo-rm_audience");

    if (audience.length === 0) {
      return;
    }

    audience = audience[0];
    audience.removeAttribute("title");

    if (audience) {
      const icon = audience.querySelector("i.nimo-icon");
      icon.classList.remove("nimo-icon-audience");
      icon.classList.add("nimo-icon-star");
      const title = document.createElement("div");
      title.classList.add("pop-title");
      title.innerHTML =
        "Popülerlik seviyesi bir puan sistemidir. Popülerlik puanı yalnızca izleyici sayısından oluşmaz, yayın esnasında gönderilen hediyeler, aldığın bağışlar da hesaplamalara dahil edilir. Kanalı ziyaret eden izleyici sayısının, yoncaların ve sohbet akışının da popülerlik puanına etkisi vardır.";
      audience.append(title);
    }
  }
}

function replaceMessageModIcon(e) {
  let modIcon = e.getElementsByClassName("nimo-cr_decoration-manager");

  if (modIcon.length === 0) {
    return;
  }

  modIcon = modIcon[0];
  modIconEl = document.createElement("img");
  modIconEl.src = modIconURL;
  modIconEl.classList.add("nimo-cr_decoration_icon");
  modIconEl.style.width = "16px";
  modIconEl.style.height = "16px";
  modIcon.parentNode.replaceChild(modIconEl, modIcon);
}

function replaceMessageStreamerIcon(e) {
  let adminIcon = e.getElementsByClassName(
    "nimo-room__chatroom__message-item__icon-streamer"
  );

  if (adminIcon.length === 0) {
    return;
  }

  adminIcon = adminIcon[0];
  adminIconEl = document.createElement("img");
  adminIconEl.src = adminIconURL;
  adminIconEl.classList.add("nimo-room__chatroom__message-item__icon-streamer");
  adminIconEl.style.width = "16px";
  adminIconEl.style.height = "16px";
  adminIcon.parentNode.replaceChild(adminIconEl, adminIcon);
}

function isChatMessage(e) {
  return (
    e &&
    e.classList &&
    e.classList.contains("nimo-room__chatroom__message-item")
  );
}

function colorizeUsername(message) {
  let nicknameEl = message.getElementsByClassName("nm-message-nickname");

  if (nicknameEl.length === 0) {
    return;
  }

  nicknameEl = nicknameEl[0];
  const username = nicknameEl.innerHTML;

  if (!usersColors[username]) {
    usersColors[username] = `hsl(${Math.ceil(365 * Math.random())}, ${Math.ceil(
      Math.random() * 50 + 50
    )}%, 65%)`;

    // TODO: SAVE OPERATION MUST BE ASYNC!
    // IT BLOCKS OPERATIONS
    localStorage.setItem("usersColors", JSON.stringify(usersColors));
  }

  if (!isINColl(username)) {
    users.push({ username: username });
  }

  const colon = message.getElementsByClassName(
    "nimo-room__chatroom__message-item__info-colon"
  );

  if (colon.length > 0) {
    colon[0].style.color = usersColors[username];
  }

  nicknameEl.style.color = usersColors[username];
}

function addReplyButton(currentUserName, chatMessage) {
  const username = chatMessage.querySelector(".nm-message-nickname").innerHTML;

  if (username === currentUserName) {
    return;
  }

  const btn = document.createElement("div");
  btn.classList.add("reply-btn-chat");
  btn.innerHTML =
    '<svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><path d="M8.5 5.5L7 4L2 9L7 14L8.5 12.5L6 10H10C12.2091 10 14 11.7909 14 14V16H16V14C16 10.6863 13.3137 8 10 8H6L8.5 5.5Z"></path></svg>';
  btn.addEventListener("click", () => {
    const [chatbox] = document.getElementsByClassName("nimo-chat-box__input");
    chatbox.value = `@${username} `;
    chatbox.focus();
  });

  chatMessage.append(btn);
}

function markUsernameTags(username, message) {
  const content = message.querySelector(".n-as-vtm");

  if (!content) {
    return;
  }

  if (content.innerHTML.includes(`@${username}`)) {
    content.innerHTML = content.innerHTML.replace(
      `@${username}`,
      `<span class="mark-username">@${username}</span>`
    );
  } else {
    content.innerHTML = content.innerHTML.replace(
      username,
      `<span class="mark-username">${username}</span>`
    );
  }
}

function markIfMessageFiltered(currentUserName, message) {
  const username = message.querySelector(".nm-message-nickname").innerHTML;
  if (currentUserName === username) {
    const [chatbox] = document.getElementsByClassName("nimo-chat-box__input");
    if (chatbox.value.length > 2) {
      message.classList.add("message-filtered");
    }
  }
}

function replaceEmotes(message) {
  let contentEl = message.getElementsByClassName("n-as-vtm");
  if (contentEl.length === 0) {
    return;
  }

  contentEl = contentEl[0];
  const content = contentEl.innerHTML.split(" ");

  for (let i = 0; i < content.length; i++) {
    let word = content[i];

    if (content[i].slice(0, 1) === ":" && content[i].slice(-1) === ":") {
      word = content[i].slice(1, -1);
    }

    const emote = emotes[word];

    if (!emote) {
      continue;
    }

    content[
      i
    ] = `<div class="nimo-room__chatroom__message-item__custom-emoticon-container BNTV_Emote" style="background: none;">
        <div class="nimo-image nimo-room__chatroom__message-item__custom-emoticon">
          <img alt="${emote.word}" src="${emote.url}"/>
          <div class="BNTV_Emotetooltiptext">
            ${emote.word}
          </div>
        </div>
      </div>`;
  }

  contentEl.innerHTML = content.join(" ");
}

function addEmotes(emoticonEl) {
  if (!emoticonEl) {
    return;
  }

  const title = document.createElement("div");
  title.classList.add(
    "nimo-vip-emoticon__list-title",
    "n-as-fs12",
    "n-as-mrgb-xxs",
    "c2",
    "bnplg-bettertv-emotes-title"
  );
  title.innerHTML = "BetterTTV";
  emoticonEl.append(title);

  const emoteContainer = document.createElement("div");
  emoteContainer.classList.add(
    "n-fx-bs",
    "n-fx-wrap",
    "nimo-vip-emoticon__list",
    "n-as-mrgh-xxs-back"
  );

  Object.values(emotes).forEach((emote) => {
    const emoteEl = document.createElement("div");
    emoteEl.classList.add("emoticon-item", "n-as-mrgr", "n-as-pointer", "bc4");
    emoteEl.setAttribute("data-name", emote.word);

    const emoteSpanEl = document.createElement("span");
    emoteSpanEl.classList.add(
      "nimo-image",
      "nimo-image",
      "nimo-vip-emoticon__img"
    );

    const pictureEl = document.createElement("picture");
    const img = document.createElement("img");
    img.src = emote.url;
    img.alt = emote.word;
    img.classList.add("loading");
    img.onerror = function () {
      emoteEl.parentNode.removeChild(emoteEl);
    };
    pictureEl.append(img);

    emoteSpanEl.append(pictureEl);
    emoteEl.append(emoteSpanEl);

    emoteEl.onclick = function (e) {
      const [chatbox] = document.getElementsByClassName("nimo-chat-box__input");

      if (chatbox.value.length === 0) {
        chatbox.value = emote.word;
      } else {
        chatbox.value +=
          chatbox.value.slice(-1) === " " ? emote.word + " " : " " + emote.word;
      }

      chatbox.focus();
      chatbox.value = chatbox.value.substr(0, 100);
    };

    emoteContainer.append(emoteEl);
  });

  emoticonEl.append(emoteContainer);

  const searchInputWrapper = document.createElement("div");
  searchInputWrapper.style.textAlign = "right";
  searchInputWrapper.style.marginBottom = "10px";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search for emotes";
  searchInput.style.background = "#333";
  searchInput.style.border = "1px solid #555";
  searchInput.style.borderRadius = "5px";
  searchInput.style.color = "#fff";
  searchInput.oninput = function (e) {
    const val = e.target.value;
    const items = emoticonEl.getElementsByClassName("emoticon-item");

    for (let emote of items) {
      if (emote.dataset.name.toLowerCase().includes(val.toLowerCase())) {
        emote.classList.remove("emote-hidden");
      } else {
        emote.classList.add("emote-hidden");
      }
    }
  };

  searchInputWrapper.append(searchInput);
  emoticonEl.prepend(searchInputWrapper);
}

function injectEmotesIfNotIncluded(e) {
  if (!e || !e.classList || !emotes || Object.keys(emotes).length === 0) {
    return;
  }

  if (e.getElementsByClassName("bnplg-bettertv-emotes-title").length > 0) {
    return;
  }

  const emoticonEl = e.getElementsByClassName(
    "nimo-vip-emoticon__list-container"
  );

  if (emoticonEl.length > 0) {
    addEmotes(emoticonEl[0]);
  }
}

function fixChromeVideoBug(e) {
  if (e && e.nodeName && e.nodeName.toLowerCase() === "video") {
    const videoContainer = e.parentElement;
    if (
      videoContainer &&
      videoContainer.classList &&
      videoContainer.classList.contains("video-player")
    ) {
      const videos = videoContainer.getElementsByTagName("video");
      if (videos && videos.length > 1) {
        videos[0].remove();
      }
    }
  }
}

function injectMentions(e) {
  if (!e || !e.classList) {
    return;
  }

  let input = e.getElementsByClassName("nimo-room__chatroom__chat-box__input");

  if (input.length === 0) {
    return;
  }

  mentionChat("nimo-room__chatroom__chat-box__input", 20);
  mentionEmote(
    Object.values(emotes),
    "nimo-room__chatroom__chat-box__input",
    20
  );

  pushStreamerName(e);
}

function pushStreamerName(e) {
  if (
    !e ||
    !e.classList ||
    e.getElementsByClassName("n-as-fs12").length === 0
  ) {
    return;
  }

  var sn = document.getElementsByClassName("n-as-fs12")[0].textContent;
  if (!isINColl("everyone")) {
    users.push({ username: "everyone" });
  }

  if (!isINColl(sn)) {
    users.push({ username: sn });
  }
}

function getUsersFromLS() {
  users = [];
  if (localStorage.getItem("On_chat_BNTV") != null) {
    var ls = localStorage.getItem("On_chat_BNTV");
    users = JSON.parse(ls);
    users = users.reduce((acc, cur) => {
      if (cur.username.trim() === "") {
        return acc;
      }

      if (acc[cur.username] === undefined) {
        acc[cur.username] = cur;
      }

      return acc;
    }, {});
    users = Object.values(users);
  }
}

const isINColl = (name) => {
  if (!name) {
    return;
  }

  name = name.trim();

  if (name.length <= 0) {
    return true;
  }

  for (let i = 0; i < users.length; i++) {
    if (users[i].username === name) {
      return true;
    }
  }

  return false;
};

function injectSettingsMenuIcon(e) {
  if (!e || !e.classList) {
    return;
  }

  let iconWrapper = e.getElementsByClassName("chat-input-toolbar-icon-wrap");
  if (iconWrapper.length === 0) {
    return;
  }

  iconWrapper = iconWrapper[0];
  iconWrapper.innerHTML +=
    '<svg class="n-as-fs24 n-as-pointer c2 c-hover1 n-as-mrgh" id="rkzplus-settings-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';

  injectSettingsMenu(document.getElementsByClassName("nimo-room__chatroom")[0]);
}

function injectSettingsMenu(e) {
  if (!e || !e.classList || !e.classList.contains("nimo-room__chatroom")) {
    return;
  }

  var block_to_insert;
  var container_block;
  block_to_insert = document.createElement("div");
  block_to_insert.id = "BNTV_Settings_MENU";
  block_to_insert.className = "BNTV_Settings_MENU";
  block_to_insert.style.display = "none";
  block_to_insert.innerHTML =
    '<div class="BNTV_ITEM_H"><div class="BNTV_T">REKKITZ+ Settings</div><div id="BNTV_MENU_hide">Close</div></div>' +
    '<div class="BNTV_Settings_MENU_ITEM">' +
    '<span class="BNTV_T">Hide chat</span>' +
    '<label class="switch">' +
    '<input id="BNTV_CB" type="checkbox">' +
    '<span class="slider round"></span>' +
    "</label>" +
    "</div>" +
    '<div class="BNTV_Settings_MENU_ITEM">' +
    '<span class="BNTV_T">Hide sidebar</span>' +
    '<label class="switch">' +
    '<input id="BNTV_CB1" type="checkbox">' +
    '<span class="slider round"></span>' +
    "</label>" +
    "</div>" +
    '<div class="BNTV_Settings_MENU_ITEM">' +
    '<span class="BNTV_T">Hide leaderboard</span>' +
    '<label class="switch">' +
    '<input id="BNTV_CB6" type="checkbox">' +
    '<span class="slider round"></span>' +
    "</label>" +
    "</div>" +
    '<div class="BNTV_Settings_MENU_ITEM">' +
    '<span class="BNTV_T">Hide top left gift banners</span>' +
    '<label class="switch" >' +
    '<input id="BNTV_CB2" type="checkbox">' +
    '<span class="slider round"></span>' +
    "</label>" +
    "</div>" +
    '<div class="BNTV_Settings_MENU_ITEM">' +
    '<span class="BNTV_T">Hide animated gifts</span>' +
    '<label class="switch" >' +
    '<input id="BNTV_CB3" type="checkbox">' +
    '<span class="slider round"></span>' +
    "</label>" +
    "</div>" +
    '<div class="BNTV_Settings_MENU_ITEM">' +
    '<span class="BNTV_T">Hide follower messages</span>' +
    '<label class="switch" >' +
    '<input id="BNTV_CB4" type="checkbox">' +
    '<span class="slider round"></span>' +
    "</label>" +
    "</div>" +
    '<div class="BNTV_Settings_MENU_ITEM">' +
    '<span class="BNTV_T">Hide chat gift messages</span>' +
    '<label class="switch" >' +
    '<input id="BNTV_CB5" type="checkbox">' +
    '<span class="slider round"></span>' +
    "</label>" +
    "</div>";
  container_block = document.getElementsByClassName("nimo-room__chatroom")[0];
  container_block.parentNode.parentNode.prepend(block_to_insert);

  if (settings.hideSidebar) {
    document.body.classList.add("nimo-hide-sidebar");
    document.getElementById("BNTV_CB1").checked = true;
  }

  if (settings.hideGiftBanner) {
    document.body.classList.add("nimo-hide-gift-banner");
    document.getElementById("BNTV_CB2").checked = true;
  }

  if (settings.hideVideoAnimations) {
    document.body.classList.add("nimo-hide-video-animations");
    document.getElementById("BNTV_CB3").checked = true;
  }

  if (settings.hideFollowerMessages) {
    document.body.classList.add("nimo-hide-follower-messages");
    document.getElementById("BNTV_CB4").checked = true;
  }

  if (settings.hideGiftMessages) {
    document.body.classList.add("nimo-hide-gift-messages");
    document.getElementById("BNTV_CB5").checked = true;
  }

  if (settings.hideLeaderboard) {
    document.body.classList.add("nimo-hide-leaderboard");
    document.getElementById("BNTV_CB6").checked = true;
  }

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

  document.getElementById("BNTV_CB").addEventListener("click", function () {
    hideDivF("BNTV_CB", "MessageList");
  });

  document.getElementById("BNTV_CB1").addEventListener("click", function () {
    if (document.getElementById("BNTV_CB1").checked) {
      document.body.classList.add("nimo-hide-sidebar");
      settings.hideSidebar = true;
    } else {
      document.body.classList.remove("nimo-hide-sidebar");
      settings.hideSidebar = false;
    }

    saveSettings();
  });

  document.getElementById("BNTV_CB2").addEventListener("click", function () {
    if (document.getElementById("BNTV_CB2").checked) {
      document.body.classList.add("nimo-hide-gift-banner");
      settings.hideGiftBanner = true;
    } else {
      document.body.classList.remove("nimo-hide-gift-banner");
      settings.hideGiftBanner = false;
    }

    saveSettings();
  });

  document.getElementById("BNTV_CB3").addEventListener("click", function () {
    if (document.getElementById("BNTV_CB3").checked) {
      document.body.classList.add("nimo-hide-video-animations");
      settings.hideVideoAnimations = true;
    } else {
      document.body.classList.remove("nimo-hide-video-animations");
      settings.hideVideoAnimations = false;
    }

    saveSettings();
  });

  document.getElementById("BNTV_CB4").addEventListener("click", function () {
    if (document.getElementById("BNTV_CB4").checked) {
      document.body.classList.add("nimo-hide-follower-messages");
      settings.hideFollowerMessages = true;
    } else {
      document.body.classList.remove("nimo-hide-follower-messages");
      settings.hideFollowerMessages = false;
    }

    saveSettings();
  });

  document.getElementById("BNTV_CB5").addEventListener("click", function () {
    if (document.getElementById("BNTV_CB5").checked) {
      document.body.classList.add("nimo-hide-gift-messages");
      settings.hideGiftMessages = true;
    } else {
      document.body.classList.remove("nimo-hide-gift-messages");
      settings.hideGiftMessages = false;
    }

    saveSettings();
  });

  document.getElementById("BNTV_CB6").addEventListener("click", function () {
    if (document.getElementById("BNTV_CB6").checked) {
      document.body.classList.add("nimo-hide-leaderboard");
      settings.hideLeaderboard = true;
    } else {
      document.body.classList.remove("nimo-hide-leaderboard");
      settings.hideLeaderboard = false;
    }

    saveSettings();
  });
}

new MutationObserver((e) => {
  for (const o of e) {
    if ("childList" === o.type) {
      for (const e of o.addedNodes) {
        if (isChatMessage(e)) {
          getUsersFromLS();
          const currentUserName = getCookie("userName");
          const chatMessage = e;
          replaceMessageModIcon(chatMessage);
          replaceMessageStreamerIcon(chatMessage);
          colorizeUsername(chatMessage);
          replaceEmotes(chatMessage);
          localStorage.setItem("On_chat_BNTV", JSON.stringify(users));

          if (currentUserName) {
            addReplyButton(currentUserName, chatMessage);
            markIfMessageFiltered(currentUserName, chatMessage);
            markUsernameTags(currentUserName, chatMessage);
          }
        } else {
          replaceAudienceIconIfChanged(e);
          injectEmotesIfNotIncluded(e);
          fixChromeVideoBug(e);
          injectMentions(e);
          injectSettingsMenuIcon(e);
          pushStreamerName(e);
        }
      }
    }
  }
}).observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: false,
});
