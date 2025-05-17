import { toast } from "react-toastify";
import { del, get, patch, post, put } from "../services/api";
import {
  CART_FETCH_SUCCESS,
  CART_FETCH_UPDATE_FAIL,
  CART_LOADING_CHANGE,
  ITEM_DELETE_FAIL,
  ITEM_DELETE_SUCCESS,
  ORDER_PLACED_SUCCESSFULLY,
  ORDER_PLACEMENT_FAIL,
  PRODUCT_ADDED_CART,
  PRODUCT_CART_ADD_FAILED,
} from "./types";

export const fetchLinkedBundles = async (usid, type) => {
  try {
    const res = await get(`/bundles/search/${usid}?type=${type}`);
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const fetchAllBundles = async () => {
  try {
    const res = await get("/bundles");
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const fetchAllProducts = async () => {
  try {
    const res = await get("/products");
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const addToCart =
  ({ bundleId, quantity, parentId, studentId }) =>
  async (dispatch) => {
    try {
      const res = await post("/cart/bundles", {
        bundleId,
        quantity,
        parentId,
        studentId,
      });
      dispatch({
        type: PRODUCT_ADDED_CART,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    } catch (error) {
      dispatch({
        type: PRODUCT_CART_ADD_FAILED,
        payload: error,
      });
      return Promise.reject(error);
    }
  };

export const getCartDetail = (parentId) => async (dispatch) => {
  try {
    const res = await get(`/cart/${parentId}`);
    dispatch({
      type: CART_FETCH_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: CART_FETCH_UPDATE_FAIL,
      payload: error,
    });
  }
};

export const deleteCartItem =
  ({ parentId, bundleId }) =>
  async (dispatch) => {
    try {
      const res = await del(`/cart/${parentId}/bundles/${bundleId}`);
      dispatch({
        type: ITEM_DELETE_SUCCESS,
        payload: res.data,
      });
      return Promise.resolve(res.data);
    } catch (error) {
      dispatch({
        type: ITEM_DELETE_FAIL,
        payload: error,
      });
      return Promise.reject(error);
    }
  };

export const loadingCartChange = (value) => (dispatch) => {
  dispatch({ type: CART_LOADING_CHANGE, payload: value });
};

export const orderPlaced =
  ({ parentId, paymentMethod, shippingMethod }) =>
  async (dispatch) => {
    try {
      const res = await post("/orders/cart", {
        parentId,
        shippingMethod,
        paymentMethod,
      });

      // If API returns error inside the response (but HTTP 200 OK)
      if (res.data?.error) {
        throw new Error(res.data.error.message || "Unknown error");
      }

      dispatch({
        type: CART_LOADING_CHANGE,
        payload: false,
      });

      return Promise.resolve(res.data);
    } catch (error) {
      dispatch({
        type: ORDER_PLACEMENT_FAIL,
        payload: error.message || "Something went wrong",
      });
      return Promise.reject(error);
    }
  };

export const paymentConfig = async (orderId) => {
  try {
    const res = await get(`/payment/config/${orderId}`);
    return res.data;
  } catch (error) {
    return error;
  }
};

export const paymentSuccess =
  ({ order_id, bank_reference_id, transaction_timestamp, application_code }) =>
  async (dispatch) => {
    try {
      const res = await post("/payment/success", {
        order_code: order_id,
        bank_reference_id,
        transaction_timestamp,
        application_code,
      });
      dispatch({
        type: ORDER_PLACED_SUCCESSFULLY,
        payload: res,
      });
      return Promise.resolve(res.data);
    } catch (error) {
      dispatch({
        type: ORDER_PLACEMENT_FAIL,
        payload: error.message || "Something went wrong",
      });
      return Promise.reject(error);
    }
  };

export const paymentError = async ({
  order_id,
  bank_reference_id,
  transaction_timestamp,
  application_code,
  error,
}) => {
  try {
    const res = await post("/payment/error", {
      error,
      application_code,
      bank_reference_id,
      order_code: order_id,
      transaction_timestamp,
    });
    return res.data;
  } catch (error) {
    return error;
  }
};

export const paymentClosed = async ({ order_code, event }) => {
  try {
    const res = await post("/payment/closed", { order_code, event });
    return res.data;
  } catch (error) {
    return error;
  }
};

export const fetchAllOrders = async () => {
  try {
    const res = await get("/orders");
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const fetchOrdersParent = async (id) => {
  try {
    const res = await get(`/orders/parent/${id}`);
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const res = await patch(`/orders/${id}/status`, { status });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateTransactionStatus = async (id, status) => {
  try {
    const res = await patch(`/orders/${id}/transaction-status`, { status });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const findParentByPhone = async (phoneNumber) => {
  try {
    const res = await post("/parents/find-by-phone", { phoneNumber: phoneNumber });
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    toast.error(error.message, { position: "top-right" });
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    const res = await post("/products", productData);
    toast.success("Product created successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const res = await put(`/products/${id}`, productData);
    toast.success("Product updated successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await del(`/products/${id}`);
    toast.success("Product deleted successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const createBundle = async (bundleData) => {
  try {
    const res = await post("/bundles", bundleData);
    toast.success("Bundle created successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateBundle = async (id, bundleData) => {
  try {
    const res = await put(`/bundles/${id}`, bundleData);
    toast.success("Bundle updated successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const deleteBundle = async (id) => {
  try {
    const res = await del(`/bundles/${id}`);
    toast.success("Bundle deleted successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateProductSize = async (sizeData) => {
  try {
    const res = await post("/sizes", sizeData);
    toast.success("Size updated successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};
