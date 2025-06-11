import {
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOADING_CHANGE,
  USER_UPDATED,
  USER_UPDATE_FAILED,
  LOGIN_WITH_DEFAULT_PASSWORD
} from "../actions/types";

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  loading: true,
  user: null,
  isFirstTimeLogin: false
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };
    case LOGIN_SUCCESS:
      localStorage.setItem("token", payload.token);
      return {
        ...state,
        token: payload.token,
        isAuthenticated: true,
        isFirstTimeLogin: false,
        loading: false,
      };
    case LOGIN_WITH_DEFAULT_PASSWORD:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        isFirstTimeLogin: payload.data.isFirstTimeLogin,
        user: { role: "parent", id: payload.data.parentId },
      };
    case LOGIN_FAIL:
    case AUTH_ERROR:
    case LOGOUT:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        isFirstTimeLogin: false,
        loading: false,
        user: {},
      };
    case LOADING_CHANGE:
      return {
        ...state,
        loading: payload,
      };
    case USER_UPDATED:
      return {
        ...state,
        loading: false,
        user: payload,
      };
    case USER_UPDATE_FAILED:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}
