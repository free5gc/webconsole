import axios from "axios";

const apiConfig = {
  API_URL: "",
};

if (process.env.NODE_ENV === "development") {
  apiConfig.API_URL = "http://127.0.0.1:5000";
} else {
  apiConfig.API_URL = process.env.REACT_APP_HTTP_API_URL ? process.env.REACT_APP_HTTP_API_URL : "";
}
const instance = axios.create({
  baseURL: apiConfig.API_URL,
});
export default instance;
