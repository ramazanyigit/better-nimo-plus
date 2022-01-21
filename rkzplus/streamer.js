RkzPlus.Streamer = {
  _streamerData: undefined,
  _lastURL: undefined,
  isStreamLive: function () {
    return this._streamerData !== undefined && this._streamerData.liveStreamStatus;
  },
  fetch: async function (url, cache = "no-store") {
    this._lastURL = url;
    const data = await fetch(url, { cache: cache });
    const text = await data.text();
    const bodyPos = text.indexOf("<body");
    const scriptStartPos = text.indexOf("<script", bodyPos);
    const scriptEndPos = text.indexOf("</script>", scriptStartPos);
    const script = text.substring(scriptStartPos, scriptEndPos);
    const dataStart = script.indexOf("{");
    const dataEnd = script.lastIndexOf("}");
    const dataBody = script.substring(dataStart, dataEnd + 1);
    try {
      this._streamerData = JSON.parse(dataBody);
      RkzPlus.User.getColor(this._streamerData.nickname);
    } catch (_) {
      console.log("fetch err:", _);
      this._streamerData = undefined;
    }
  },
  getData: async function () {
    if (!this._streamerData || window.location !== this._lastURL) {
      await this.fetch(window.location);
    }

    return this._streamerData;
  },
  reload: async function () {
    await this.fetch(this._lastURL);
  },
};
