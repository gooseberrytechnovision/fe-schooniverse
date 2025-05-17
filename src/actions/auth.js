import {
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOADING_CHANGE,
  USER_UPDATED,
  USER_UPDATE_FAILED,
  CLEAR_PRODUCT,
} from "./types";
import { get, post, put } from "../services/api";
import { toast } from "react-toastify";

//Load user
export const loadUser = () => async (dispatch) => {
  try {
    const res = await get("/parents/me");

    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch(loadAdminUser());
  }
};

export const loadAdminUser = () => async (dispatch) => {
  try {
    const res = await get("/admins/load/user");
    dispatch({
      type: USER_LOADED,
      payload: res.data.admin,
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

export const login =
  ({ username, password }) =>
  async (dispatch) => {
    try {
      const res = await post("/auth/login", {
        usid: username,
        password: password,
      });
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res,
      });

      dispatch(loadUser());
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err || "Something went wrong",
      });
      toast.error("Invalid Credentials!", {
        position: "top-right",
      });
    }
  };

export const loadingChange = (value) => (dispatch) => {
  dispatch({ type: LOADING_CHANGE, payload: value });
};

export const updateProfile = (data) => async (dispatch) => {
  try {
    const res = await put(`/profiles/${data?.id}?role=${data?.role}`, data);
    dispatch({ type: USER_UPDATED, payload: res.data });
    toast.success("Profile updated successfully!", { position: "top-right" });
  } catch (error) {
    dispatch({ type: USER_UPDATE_FAILED, payload: error });
    toast.error("Error while updating profile details!", {
      position: "top-right",
    });
  }
};

export const sendOTP = async (usid) => {
  try {
    const res = await post("/auth/send-otp", { usid: usid });
    toast.success(res.data.message, { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error("Error while sending OTP!", { position: "top-right" });
    return error;
  }
};

export const verifyOTP =
  ({ usid, otp }) =>
  async (dispatch) => {
    try {
      const res = await post("/auth/verify-otp", { usid, otp });
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res,
      });
      dispatch(loadUser());
    } catch (error) {
      dispatch({
        type: LOGIN_FAIL,
        payload: error || "Something went wrong",
      });
      toast.error("Invalid OTP. Please try again.!", {
        position: "top-right",
      });
    }
  };

export const adminLogin =
  ({ email, password }) =>
  async (dispatch) => {
    try {
      const res = await post("/admins/login", { email, password });
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res,
      });
      dispatch(loadAdminUser());
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
      dispatch({ type: LOGIN_FAIL, payload: error || "Something went wrong" });
    }
  };

export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT });
  dispatch({ type: CLEAR_PRODUCT });
};
