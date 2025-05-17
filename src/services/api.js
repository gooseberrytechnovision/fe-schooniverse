import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const request = async (endpoint, method = "GET", data = null) => {
  try {
    if (localStorage.token) {
      api.defaults.headers["Authorization"] = localStorage.token;
    } else {
      delete api.defaults.headers["Authorization"];
    }
    const response = await api({
      url: endpoint,
      method,
      data,
      withCredentials: true,
    });

    return { data: response.data, token: response.data?.access_token };
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const get = (endpoint) => request(endpoint, "GET", null);
export const post = (endpoint, data) => request(endpoint, "POST", data);
export const put = (endpoint, data) => request(endpoint, "PUT", data);
export const patch = (endpoint, data) => request(endpoint, "PATCH", data);
export const del = (endpoint) => request(endpoint, "DELETE", {});
