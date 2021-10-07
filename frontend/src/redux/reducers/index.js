import {reducer as formReducer} from 'redux-form'
import auth from './auth';
import layout from './layout';
import subscriber from "./subscriber";
import ueinfo from "./ueinfo";
import tenant from "./tenant";
import user from "./user";

export default {
  auth,
  layout,
  subscriber,
  ueinfo,
  tenant,
  user,
  form: formReducer,
};
