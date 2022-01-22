RkzPlus.User = {
  _users: undefined,
  getColor: function (username) {
    if (!this._users) {
      this._users = JSON.parse(localStorage.getItem("usersColors") || "{}");
    }

    if (!this._users[username]) {
      this.createColor(username);
    }

    return this._users[username];
  },
  createColor: function (username) {
    this._users[username] = `hsl(${Math.ceil(365 * Math.random())}, ${Math.ceil(Math.random() * 50 + 50)}%, 65%)`;

    localStorage.setItem("usersColors", JSON.stringify(this._users));
  },
  getAllUsers: function () {
    if (!this._users) {
      this._users = JSON.parse(localStorage.getItem("usersColors") || "{}");
    }

    return Object.keys(this._users);
  },
};
