
export default class userActions {
  static SET_USERS = 'USER/SET_USERS';

  static setUsers(users) {
    return {
      type: this.SET_USERS,
      users: users,
    };
  }
}
