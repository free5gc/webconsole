import {store} from '../index';
import authActions from '../redux/actions/authActions';
import config from '../config/config';
import User from "../models/User";
import ApiHelper from "./ApiHelper";
import LocalStorageHelper from "./LocalStorageHelper";

export default class AuthHelper {

  /**
   * @param username  {string}
   * @param password  {string}
   * @throws {Error}  error message string
   * @return {Promise<(boolean|string)>} true for success, string for error message
   */
  static async login(username, password) {
    if (username === config.USERNAME && password === config.PASSWORD) {
      let user = new User(username, "System Administrator", "admin");
      LocalStorageHelper.setUserInfo(user);
      store.dispatch(authActions.setUser(user));
      return true;
    } else {
      let response = await ApiHelper.login({username: username, password: password});
      if (response === undefined) {
        return false;
      }
      if (response.status === 200) {
        let user = new User(username, "User", response.data.access_token);
        LocalStorageHelper.setUserInfo(user);
        store.dispatch(authActions.setUser(user));
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * @return {Promise<boolean>} success or not
   */
  static async logout() {
    store.dispatch(authActions.logout());
    return true;
  }
}
