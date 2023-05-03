import Http from './Http';
import { store } from '../index';
import subscriberActions from "../redux/actions/subscriberActions";
import Subscriber from "../models/Subscriber";
import tenantActions from "../redux/actions/tenantActions";
import Tenant from "../models/Tenant";
import userActions from "../redux/actions/userActions";
import User from "../models/User";
import axios from 'axios';
import LocalStorageHelper from "./LocalStorageHelper";

class ApiHelper {

  static async fetchSubscribers() {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get('subscriber');
      if (response.status === 200 && response.data) {
        const subscribers = response.data.map(val => new Subscriber(val['ueId'], val['plmnID'], val['msisdn']));
        store.dispatch(subscriberActions.setSubscribers(subscribers));
        return true;
      }
    } catch (error) {
    }

    return false;
  }

  static async fetchSubscriberById(id, plmn) {
    try {
      let response = await Http.get(`subscriber/${id}/${plmn}`);
      if (response.status === 200 && response.data) {
        return response.data;
      }
    } catch (error) {
    }

    return false;
  }

  static async createSubscriber(subscriberData) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.post(
        `subscriber/${subscriberData["ueId"]}/${subscriberData["plmnID"]}/${subscriberData["userNumber"]}`, subscriberData);
      if (response.status === 201)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async updateSubscriber(subscriberData) {
    try {
      let response = await Http.put(
        `subscriber/${subscriberData["ueId"]}/${subscriberData["plmnID"]}`, subscriberData);
      if (response.status === 204)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async deleteSubscriber(id, plmn) {
    try {
      let response = await Http.delete(`subscriber/${id}/${plmn}`);
      if (response.status === 204)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async login(loginRequest) {
    console.log("login");
    try {
      let response = await Http.post(`login`, loginRequest);
      return response;
    } catch (error) {
      console.error(error);
    }
    return false;
  }

  static async fetchTenants() {
    try {
      store.dispatch(tenantActions.setTenants([]));
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get('tenant');
      if (response.status === 200 && response.data) {
        const tenants = response.data.map(val => new Tenant(val['tenantId'], val['tenantName']));
        store.dispatch(tenantActions.setTenants(tenants));
        return true;
      }
    } catch (error) {
    }

    return false;
  }

  static async fetchTenantById(id) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get(`tenant/${id}`);
      if (response.status === 200 && response.data) {
        return response.data;
      }
    } catch (error) {
    }

    return false;
  }

  static async createTenant(tenantData) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.post(
        'tenant', tenantData);
      if (response.status === 200)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async updateTenant(tenantData) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.put(
        `tenant/${tenantData["tenantId"]}`, tenantData);
      if (response.status === 200)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async deleteTenant(id) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.delete(`tenant/${id}`);
      if (response.status === 200)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async fetchUsers(tenantId) {
    try {
      store.dispatch(userActions.setUsers([]));
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get(`tenant/${tenantId}/user`);
      if (response.status === 200 && response.data) {
        const users = response.data.map(val => new User('', '', '', val['userId'], val['email']));
        store.dispatch(userActions.setUsers(users));
        return true;
      }
    } catch (error) {
    }

    return false;
  }

  static async fetchUserById(tenantId, id) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get(`tenant/${tenantId}/user/${id}`);
      if (response.status === 200 && response.data) {
        return response.data;
      }
    } catch (error) {
    }

    return false;
  }

  static async createUser(tenantId, userData) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      userData['encryptedPassword'] = userData['password'];
      let response = await Http.post(
        `tenant/${tenantId}/user`, userData);
      if (response.status === 200)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async updateUser(tenantId, userId, userData) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      userData['encryptedPassword'] = userData['password'];
      let response = await Http.put(
        `tenant/${tenantId}/user/${userId}`, userData);
      if (response.status === 200)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  static async deleteUser(tenantId, id) {
    try {
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.delete(`tenant/${tenantId}/user/${id}`);
      if (response.status === 200)
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

}

export default ApiHelper;
