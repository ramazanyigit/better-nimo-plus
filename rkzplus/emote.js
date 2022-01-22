RkzPlus.Emote = {
  _emotePopularity: {},
  _emotes: undefined,
  load: async function () {
    this._emotePopularity = JSON.parse(localStorage.getItem("rkzplus_emote_pop") || "{}");

    const data = await fetch("https://rkz-plus.kurabiye.dev/emotes/global");
    const json = await data.json();

    this._emotes = json.reduce((acc, curr) => {
      acc[curr.word] = { ...curr, popularity: this._emotePopularity[curr.word] || 0 };
      return acc;
    }, {});
  },
  getAll: function () {
    if (!this._emotes) {
      this.load();
    }

    return this._emotes;
  },
  createEmoticon: function (emote) {
    const emoteEl = document.createElement("div");
    emoteEl.classList.add("emoticon-item", "n-as-mrgr", "n-as-pointer", "bc4");
    emoteEl.setAttribute("data-name", emote.word);

    const emoteSpanEl = document.createElement("span");
    emoteSpanEl.classList.add("nimo-image", "nimo-image", "nimo-vip-emoticon__img");

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

    const textEl = document.createElement("div");
    textEl.className = "BNTV_Emotetooltiptext";
    textEl.innerHTML = emote.word;

    emoteEl.append(emoteSpanEl, textEl);
    emoteEl.onclick = function () {
      const [chatbox] = document.getElementsByClassName("nimo-chat-box__input");

      if (chatbox.value.length === 0) {
        chatbox.value = emote.word;
      } else {
        chatbox.value += chatbox.value.slice(-1) === " " ? emote.word + " " : " " + emote.word;
      }

      chatbox.focus();
      chatbox.value = chatbox.value.substr(0, 100);
    };

    return emoteEl;
  },
  injectMenu: function (e, injectSearch = true) {
    const emotesMap = RkzPlus.Emote.getAll();

    if (!e || !e.classList || !emotesMap || Object.keys(emotesMap).length === 0) {
      return;
    }

    if (injectSearch && document.getElementById("rkzplus-emote-search")) {
      return;
    }

    const emoticonEls = e.getElementsByClassName("nimo-vip-emoticon__list-container");

    if (emoticonEls.length === 0) {
      return;
    }

    const emoticonEl = emoticonEls[0];
    const additionEmoteEl = document.createElement("div");
    additionEmoteEl.id = "rkzplus-emote-addition";

    const emotes = Object.values(emotesMap);

    const popularEmotes = Object.values(emotes)
      .filter((emote) => emote.popularity > 0)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8);

    if (popularEmotes.length > 0) {
      const frTitle = document.createElement("div");
      frTitle.classList.add("nimo-vip-emoticon__list-title", "n-as-fs12", "n-as-mrgb-xxs", "c2");
      frTitle.innerHTML = chrome.i18n.getMessage("emoteFrequentlyUsed");
      additionEmoteEl.append(frTitle);

      const frEmoteContainer = document.createElement("div");
      frEmoteContainer.id = "RkzPlus-FrEmoteList";
      frEmoteContainer.classList.add("n-fx-bs", "n-fx-wrap", "nimo-vip-emoticon__list", "n-as-mrgh-xxs-back");
      frEmoteContainer.style.justifyContent = "flex-start";

      popularEmotes.forEach((emote) => {
        frEmoteContainer.append(RkzPlus.Emote.createEmoticon(emote));
      });

      additionEmoteEl.append(frEmoteContainer);
    }

    const title = document.createElement("div");
    title.classList.add(
      "nimo-vip-emoticon__list-title",
      "n-as-fs12",
      "n-as-mrgb-xxs",
      "c2",
      "bnplg-bettertv-emotes-title"
    );
    title.innerHTML = chrome.i18n.getMessage("emoteGlobal");
    title.id = "RkzPlus-EmoteListTitle";
    additionEmoteEl.append(title);

    const emoteContainer = document.createElement("div");
    emoteContainer.id = "RkzPlus-EmoteList";
    emoteContainer.classList.add("n-fx-bs", "n-fx-wrap", "nimo-vip-emoticon__list", "n-as-mrgh-xxs-back");
    emoteContainer.style.justifyContent = "flex-start";

    emotes.forEach((emote) => {
      emoteContainer.append(RkzPlus.Emote.createEmoticon(emote));
    });

    additionEmoteEl.append(emoteContainer);

    emoticonEl.append(additionEmoteEl);

    if (injectSearch && !document.getElementById("rkzplus-emote-search")) {
      const searchInputWrapper = document.createElement("div");
      searchInputWrapper.id = "rkzplus-emote-search";
      searchInputWrapper.style.textAlign = "right";
      searchInputWrapper.style.marginBottom = "0px";

      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = chrome.i18n.getMessage("emoteSearchPlaceholder");
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
  },
  savePopularity: function () {
    localStorage.setItem("rkzplus_emote_pop", JSON.stringify(this._emotePopularity));
  },
  addEmoteUsage: function (emote) {
    this._emotePopularity[emote] = this._emotePopularity[emote] ? this._emotePopularity[emote] + 1 : 1;
    this._emotes[emote].popularity += 1;
    this.savePopularity();

    const emotelist = document.getElementById("rkzplus-emote-addition");

    if (emotelist) {
      emotelist.remove();
    }

    this.injectMenu(document.body, false);
  },
};
