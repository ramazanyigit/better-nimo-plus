RkzPlus.Mention = {
  inject: function (e) {
    const input = e.getElementsByClassName("nimo-chat-box__input")[0];

    if (!input) {
      return;
    }

    this.mentionChat("nimo-chat-box__input");
    this.mentionEmote("nimo-chat-box__input");
  },
  mentionChat: function (textarea_Class, max = 5) {
    const block_to_insert = document.createElement("div");
    const container_block = document.getElementsByClassName(textarea_Class)[0];
    block_to_insert.id = "RkzPlus-ChatMentionMenu";
    block_to_insert.className = "mention_Menu";
    block_to_insert.setAttribute("role", "listbox");
    container_block.parentNode.insertBefore(block_to_insert, container_block);

    const resolveFn = (prefix) =>
      prefix === ""
        ? RkzPlus.User.getAllUsers()
        : RkzPlus.User.getAllUsers()
            .filter(
              (user) =>
                user.toLowerCase().startsWith(prefix.toLowerCase()) ||
                user.toUpperCase().startsWith(prefix.toUpperCase())
            )
            .sort((a, b) => a.localeCompare(b) + a.length - b.length);

    const replaceFn = (user, trigger) => `${trigger}${user} `;

    const menuItemFn = (user, setItem, selected) => {
      const div = document.createElement("div");
      div.setAttribute("role", "option");
      div.className = "mention_Menu-item";

      if (selected) {
        div.classList.add("selected");
        div.setAttribute("aria-selected", "");
      }
      div.textContent = user;
      div.onclick = setItem;
      return div;
    };

    new Mentionify(
      document.getElementsByClassName(textarea_Class)[0],
      document.getElementById("RkzPlus-ChatMentionMenu"),
      resolveFn,
      replaceFn,
      menuItemFn,
      "@",
      0,
      max
    );
  },
  mentionEmote: function (textarea_Class) {
    const block_to_insert = document.createElement("div");
    const container_block = document.getElementsByClassName(textarea_Class)[0];
    block_to_insert.id = "RkzPlus-EmoteMentionMenu";
    block_to_insert.className = "mention_Menu";
    block_to_insert.setAttribute("role", "listbox");
    container_block.parentNode.insertBefore(block_to_insert, container_block);

    const resolveFn = (prefix) => {
      const emotes = Object.values(RkzPlus.Emote.getAll());

      return prefix === ""
        ? emotes
        : emotes
            .filter(
              (el_array) =>
                el_array &&
                (el_array.word.toLowerCase().includes(prefix.toLowerCase()) ||
                  el_array.word.toUpperCase().includes(prefix.toUpperCase()))
            )
            .sort((a, b) => {
              const diff = b.popularity - a.popularity;

              if (diff !== 0) {
                return diff;
              }

              return a.word.localeCompare(b.word);
            });
    };

    const replaceFn = (emote) => `${emote.word}`;

    const menuItemFn = (el_array, setItem, selected) => {
      const div = document.createElement("div");
      div.setAttribute("role", "option");
      div.className = "mention_Menu-item";

      if (selected) {
        div.classList.add("selected");
        div.setAttribute("aria-selected", "");
      }
      div.innerHTML =
        `<div class="nimo-room__chatroom__message-item__custom-emoticon-container" style="background: none;"><span class="nimo-image nimo-room__chatroom__message-item__custom-emoticon"><img src="${el_array.url}"/></span></div>` +
        " " +
        el_array.word;
      div.onclick = setItem;
      return div;
    };

    new Mentionify(
      document.getElementsByClassName(textarea_Class)[0],
      document.getElementById("RkzPlus-EmoteMentionMenu"),
      resolveFn,
      replaceFn,
      menuItemFn,
      ":",
      2
    );
  },
  injectFullscreen: function (e) {
    const input = e.getElementsByClassName("nimo-chat-box__input");

    if (input.length === 0 || !input[0].classList.contains("msg-input")) {
      return;
    }

    const controlsContainer = document.querySelector(".nimo-player .input-control");
    controlsContainer.style.overflow = "visible";

    input[0].classList.add("rkzplus-fullscreen-chat-input");
    this.mentionChat("rkzplus-fullscreen-chat-input", 4);
    this.mentionEmote("rkzplus-fullscreen-chat-input");
  },
};
