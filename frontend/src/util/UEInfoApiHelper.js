import Http from './Http';
import {store} from '../index';
import ueinfoActions from "../redux/actions/ueinfoActions";
import UEInfo from "../models/UEInfo";
import axios from 'axios';
import LocalStorageHelper from "./LocalStorageHelper";

class UeInfoApiHelper {

  static async fetchRegisteredUE() {
    const MSG_FETCH_ERROR = "Error fetching registered UEs. Is the core network up?";

    try {
      let url =  "registered-ue-context"
      // console.log("Making request to ", url, " ....")
      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get(url);
      if (response.status === 200) {
        let registered_users = [];
        if (response.data) {
          registered_users = response.data.map(ue_context =>
            new UEInfo(ue_context.Supi, ue_context.CmState)
          );
          store.dispatch(ueinfoActions.setRegisteredUE(registered_users));
        } else {
          store.dispatch(ueinfoActions.setRegisteredUE(registered_users));
        }
        return true;
      } else {

        console.log("Request failed, url:", url)
        console.log("Response: ", response.status, response.data)

        let err_msg;
        if (response.data !== undefined){
          err_msg = response.data
        } else {
          err_msg = MSG_FETCH_ERROR
        }
        store.dispatch(ueinfoActions.setRegisteredUEError(err_msg));
      }
    } catch (error) {
        let err_msg;
        if (error.response && error.response.data){
          err_msg = error.response.data.cause || MSG_FETCH_ERROR
        } else {
          err_msg = MSG_FETCH_ERROR
        }
        console.log(error.response);
        store.dispatch(ueinfoActions.setRegisteredUEError(err_msg));
    }

    return false;
  }

  static async fetchUEInfoDetail(supi) {
    try {
      let url = `registered-ue-context/${supi}`
      // console.log("Making request to ", url, " ....")

      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get(url);
      if (response.status === 200 && response.data) {
        //To do: implement set rgistered ue action

        console.log(response.data)

        let ue_context = response.data[0]
        store.dispatch(ueinfoActions.setUEInfoDetailAMF(ue_context));

        let smContextRef = ue_context.PduSessions[0].SmContextRef

        return [true, smContextRef];
      } else {

        console.log("Request failed, url:", url)
        console.log("Response: ", response.status, response.data)
      }
    } catch (error) {
        console.log(error)
    }

    return [false, ""];
  }

  static async fetchUEInfoDetailSMF(smContextRef) {
    try {
      let  url = `ue-pdu-session-info/${smContextRef}`
      // console.log("Making request to ", url, " ....")

      let user = LocalStorageHelper.getUserInfo();
      axios.defaults.headers.common['Token'] = user.accessToken;
      let response = await Http.get(url);
      if (response.status === 200 && response.data) {
        //To do: implement set rgistered ue action

        let smContext = response.data
        store.dispatch(ueinfoActions.setUEInfoDetailSMF(smContext));


        return true;
      } else {

        console.log("Request failed, url:", url)
        console.log("Response: ", response.status, response.data)
      }
    } catch (error) {
        console.log(error)
    }

    return false;
  }
}

export default UeInfoApiHelper;
