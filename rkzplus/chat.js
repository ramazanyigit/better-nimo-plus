RkzPlus.Chat = {
  MOD_ICON_URL: chrome.runtime.getURL("images/mod_icon.png"),
  ADMIN_ICON_URL: chrome.runtime.getURL("images/admin_icon.png"),
  LINK_REGEX: new RegExp(
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.,~#?&//=]*)$/gi
  ),
  isUserMessage: function (message) {
    return message.classList.contains("nimo-room__chatroom__message-item");
  },
  isBotMessage: function (message) {
    return (
      message.classList.contains("c2") && message.getElementsByClassName("room-chatbot-message-item-nick").length > 0
    );
  },
  enrichMessage: function (currentUsername, message, bot = false) {
    if (bot) {
      this.replaceBotModIcon(message);
    } else {
      this.colorizeUsername(message);
      this.replaceModIcon(message);
      this.replaceStreamerIcon(message);
    }

    let contentEl = bot ? message.querySelector("span:last-child") : message.getElementsByClassName("n-as-vtm")[0];
    if (!contentEl) {
      return;
    }

    const username = !bot ? message.querySelector(".nm-message-nickname").innerHTML : "";
    const isCurrentUser = !bot && currentUsername === username;

    const content = contentEl.innerHTML.split(" ");
    const emotes = RkzPlus.Emote.getAll();

    for (let i = 0; i < content.length; i++) {
      let word = content[i];
      let hasReplaced = false;

      // Check if the word is an emote
      if (RkzPlus.Settings.get("enableEmotes") && emotes) {
        if (content[i].slice(0, 1) === ":" && content[i].slice(-1) === ":") {
          word = content[i].slice(1, -1);
        }

        if (emotes[word]) {
          const emote = emotes[word];

          if (isCurrentUser) {
            RkzPlus.Emote.addEmoteUsage(word);
          }
          
          hasReplaced = true;
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
      }

      // Check if the word is a link
      if (RkzPlus.Settings.get("enableHyperlinks") && !hasReplaced && word.match(this.LINK_REGEX)) {
        hasReplaced = true;
        content[i] = `<a href="${word}" class="rkz-chat-link" target="blank">${word}</a>`;
      }

      // Check if the word is a user mention
      if (RkzPlus.Settings.get("enableMentions") && !hasReplaced) {
        if (word === `@${currentUsername}` || word === `${currentUsername}`) {
          content[i] = `<span class="mark-username">${word}</span>`;
        }
      }
    }

    if (!bot) {
      const username = message.querySelector(".nm-message-nickname").innerHTML;
      const [chatbox] = document.getElementsByClassName("nimo-chat-box__input");
      if (currentUsername === username) {
        this.markIfFiltered(chatbox, message);
      } else {
        this.addReplyButton(chatbox, message, username);
      }
    }

    contentEl.innerHTML = content.join(" ");
  },
  markIfFiltered: function (chatbox, message) {
    if (chatbox.value.length > 2) {
      message.classList.add("message-filtered");
    }
  },
  addReplyButton: function (chatbox, message, username) {
    const btn = document.createElement("div");
    btn.classList.add("reply-btn-chat");
    btn.innerHTML =
      '<svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><path d="M8.5 5.5L7 4L2 9L7 14L8.5 12.5L6 10H10C12.2091 10 14 11.7909 14 14V16H16V14C16 10.6863 13.3137 8 10 8H6L8.5 5.5Z"></path></svg>';
    btn.addEventListener("click", () => {
      if (chatbox.value.trim().length === 0) {
        chatbox.value = `@${username} `;
      } else {
        chatbox.value += ` @${username} `;
      }
      chatbox.focus();
    });

    message.append(btn);
  },
  replaceModIcon: function (message) {
    let modIcon = message.getElementsByClassName("nimo-cr_decoration-manager");

    if (modIcon.length === 0) {
      return;
    }

    modIcon = modIcon[0];
    modIconEl = document.createElement("img");
    modIconEl.src = this.MOD_ICON_URL;
    modIconEl.classList.add("nimo-cr_decoration_icon", "rkz-custom-badge");
    modIconEl.style.width = "16px";
    modIconEl.style.height = "16px";
    modIcon.parentNode.replaceChild(modIconEl, modIcon);
  },
  replaceBotModIcon: function (message) {
    let modIcon = message.getElementsByClassName("room-chatbot-manager-icon");

    if (modIcon.length === 0) {
      return;
    }

    modIcon = modIcon[0];
    modIconEl = document.createElement("img");
    modIconEl.src = this.MOD_ICON_URL;
    modIconEl.classList.add("room-chatbot-manager-icon", "n-as-fs16", "n-as-inline-block", "rkz-custom-badge");
    modIconEl.style.width = "16px";
    modIconEl.style.height = "16px";
    modIcon.parentNode.replaceChild(modIconEl, modIcon);
  },
  replaceStreamerIcon: function (message) {
    let adminIcon = message.getElementsByClassName("nimo-room__chatroom__message-item__icon-streamer");

    if (adminIcon.length === 0) {
      return;
    }

    adminIcon = adminIcon[0];
    adminIconEl = document.createElement("img");
    adminIconEl.src = this.ADMIN_ICON_URL;
    adminIconEl.classList.add("nimo-room__chatroom__message-item__icon-streamer", "rkz-custom-badge");
    adminIconEl.style.width = "16px";
    adminIconEl.style.height = "16px";
    adminIcon.parentNode.replaceChild(adminIconEl, adminIcon);
  },
  colorizeUsername: function (message) {
    let nicknameEl = message.getElementsByClassName("nm-message-nickname");

    if (nicknameEl.length === 0) {
      return;
    }

    nicknameEl = nicknameEl[0];
    const username = nicknameEl.innerHTML;
    const color = RkzPlus.User.getColor(username);

    const colon = message.getElementsByClassName("nimo-room__chatroom__message-item__info-colon");

    if (colon.length > 0) {
      colon[0].style.color = color;
    }

    nicknameEl.style.color = color;
  },
};
