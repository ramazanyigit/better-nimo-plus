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
  injectMenu: function (e, injectTitle = true) {
    const emotes = RkzPlus.Emote.getAll();

    if (!e || !e.classList || !emotes || Object.keys(emotes).length === 0) {
      return;
    }

    if (injectTitle && e.getElementsByClassName("bnplg-bettertv-emotes-title").length > 0) {
      return;
    }

    const emoticonEls = e.getElementsByClassName("nimo-vip-emoticon__list-container");

    if (emoticonEls.length === 0) {
      return;
    }

    const emoticonEl = emoticonEls[0];
    if (injectTitle) {
      const title = document.createElement("div");
      title.classList.add(
        "nimo-vip-emoticon__list-title",
        "n-as-fs12",
        "n-as-mrgb-xxs",
        "c2",
        "bnplg-bettertv-emotes-title"
      );
      title.innerHTML = "BetterTTV";
      title.id = "RkzPlus-EmoteListTitle";
      emoticonEl.append(title);
    }

    const emoteContainer = document.createElement("div");
    emoteContainer.id = "RkzPlus-EmoteList";
    emoteContainer.classList.add("n-fx-bs", "n-fx-wrap", "nimo-vip-emoticon__list", "n-as-mrgh-xxs-back");

    Object.values(emotes)
      .sort((a, b) => b.popularity - a.popularity)
      .forEach((emote) => {
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
        emoteEl.append(emoteSpanEl);

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

        emoteContainer.append(emoteEl);
      });

    emoticonEl.append(emoteContainer);

    if (injectTitle) {
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
  },
  savePopularity: function () {
    localStorage.setItem("rkzplus_emote_pop", JSON.stringify(this._emotePopularity));
  },
  addEmoteUsage: function (emote) {
    this._emotePopularity[emote] = this._emotePopularity[emote] ? this._emotePopularity[emote] + 1 : 1;
    this._emotes[emote].popularity += 1;
    this.savePopularity();

    const emotelist = document.getElementById("RkzPlus-EmoteList");

    if (emotelist) {
      emotelist.remove();
    }

    this.injectMenu(document.body, false);
  },
};
