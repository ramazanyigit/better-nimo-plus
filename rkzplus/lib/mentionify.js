class Mentionify {
  constructor(ref, menuRef, resolveFn, replaceFn, menuItemFn, triggerKey, triggerLen = 0, onMenuActiveFn, showMax = 20) {
    this.ref = ref;
    this.menuRef = menuRef;
    this.resolveFn = resolveFn;
    this.replaceFn = replaceFn;
    this.menuItemFn = menuItemFn;
    this.options = [];
    this.onMenuActiveChange = onMenuActiveFn;

    this.makeOptions = this.makeOptions.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.triggerKey = triggerKey;
    this.triggerLen = triggerLen;
    this.showMax = showMax;

    this.ref.addEventListener("input", this.onInput);
    this.ref.addEventListener("keydown", this.onKeyDown);

    this.menuRef.parentNode.style.position = "relative";
    this.menuRef.style.position = "absolute";
    this.menuRef.style.left = "0";
    this.menuRef.style.right = "0";
    this.menuRef.style.bottom = `${this.ref.scrollHeight + 2}px`;
  }

  async makeOptions(query) {
    const options = await this.resolveFn(query).slice(0, this.showMax);
    if (options.lenght !== 0) {
      this.options = options;
      this.renderMenu();
    } else {
      this.closeMenu();
    }
  }

  closeMenu() {
    setTimeout(() => {
      this.options = [];
      this.left = undefined;
      this.top = undefined;
      this.triggerIdx = undefined;
      this.menuActive = false;
      this.renderMenu();
      this.onMenuActiveChange(false);
    }, 0);
  }

  selectItem(active) {
    return () => {
      const preMention = this.ref.value.substr(0, this.triggerIdx);
      const option = this.options[active];
      const mention = this.replaceFn(option, this.ref.value[this.triggerIdx]);
      const postMention = this.ref.value.substr(this.ref.selectionStart);
      const newValue = `${preMention}${mention}${postMention}`;
      this.ref.value = mention ? newValue : this.ref.value;
      const caretPosition = this.ref.value.length - postMention.length;
      this.ref.setSelectionRange(caretPosition, caretPosition);
      this.closeMenu();
      this.ref.focus();
    };
  }

  onInput() {
    const positionIndex = this.ref.selectionStart;
    const textBeforeCaret = this.ref.value.slice(0, positionIndex);
    const tokens = textBeforeCaret.split(/\s/);
    const lastToken = tokens[tokens.length - 1];
    const triggerIdx = textBeforeCaret.endsWith(lastToken) ? textBeforeCaret.length - lastToken.length : -1;
    const maybeTrigger = textBeforeCaret[triggerIdx];
    const keystrokeTriggered = maybeTrigger === this.triggerKey;

    if (!keystrokeTriggered) {
      this.closeMenu();
      return;
    }

    const query = textBeforeCaret.slice(triggerIdx + 1);

    if (query.length < this.triggerLen) {
      this.closeMenu();
      return;
    }

    this.makeOptions(query);

    const { top, left } = this.ref.getBoundingClientRect();

    setTimeout(() => {
      this.active = 0;
      this.left = window.scrollX + left + this.ref.scrollLeft;
      this.top = window.scrollY + top - this.ref.scrollTop;
      this.triggerIdx = triggerIdx;
      this.menuActive = true;
      this.onMenuActiveChange(true);
      this.renderMenu();
    }, 0);
  }

  onKeyDown(ev) {
    let keyCaught = false;
    if (this.triggerIdx !== undefined) {
      switch (ev.key) {
        case "ArrowDown":
          this.active = Math.min(this.active + 1, this.options.length - 1);
          this.renderMenu();
          keyCaught = true;
          break;
        case "ArrowUp":
          this.active = Math.max(this.active - 1, 0);
          this.renderMenu();
          keyCaught = true;
          break;
        case "Enter":
        case "Tab":
          this.selectItem(this.active)();
          keyCaught = true;
          break;
        case "Escape":
          this.closeMenu();
          keyCaught = true;
          break;
      }
    }

    if (keyCaught) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  renderMenu() {
    if (this.top === undefined) {
      this.menuRef.hidden = true;
      return;
    }

    this.menuRef.innerHTML = "";

    this.options.forEach((option, idx) => {
      const child = this.menuItemFn(option, this.selectItem(idx), this.active === idx);
      this.menuRef.appendChild(child);

      if (this.active === idx) {
        const diff = child.offsetTop - this.menuRef.offsetHeight;
        if (diff > 0) {
          this.menuRef.scrollTop += Math.min(diff + child.offsetHeight, this.menuRef.scrollHeight);
        }
      }
    });

    this.menuRef.hidden = false;
  }
}
