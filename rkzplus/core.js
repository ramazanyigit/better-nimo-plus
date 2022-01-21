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
};
