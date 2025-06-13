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
import axios from "axios";

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
  ({ parentId, paymentMethod, shippingMethod, isAddressEdited , deliveryAddress }) =>
  async (dispatch) => {
    try {
      const res = await post("/orders/cart", {
        parentId,
        shippingMethod,
        paymentMethod,
        isAddressEdited,
        deliveryAddress,
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
  ({ order_id, bank_reference_id, transaction_timestamp, application_code, cartItems, payment_group }) =>
  async (dispatch) => {
    try {
      const res = await post("/payment/success", {
        order_code: order_id,
        bank_reference_id,
        transaction_timestamp,
        application_code,
        cartItems,
        payment_group
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
  cartItems,
  error,
}) => {
  try {
    const res = await post("/payment/error", {
      error,
      application_code,
      bank_reference_id,
      order_code: order_id,
      transaction_timestamp,
      cartItems,
    });
    return res.data;
  } catch (error) {
    return error;
  }
};

export const paymentClosed = async ({ order_code, event, cartItems }) => {
  try {
    const res = await post("/payment/closed", { order_code, event, cartItems });
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

export const updateOrderStatus = async (id, data) => {
  try {
    const res = await patch(`/orders/${id}/status`, data);
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateTransactionStatus = async (id, status, settlement_status, application_code) => {
  try {
    const res = await patch(`/orders/${id}/transaction-status`, { status, settlement_status, application_code });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const bulkUpdateTransactionStatus = async (bulkUpdateData) => {
  try {
    const res = await post('/orders/bulk-transaction-status', bulkUpdateData);
    return res.data;
  } catch (error) {
    // Let the component handle the error
    throw error;
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

export const getProductsByIds = async (productIds) => {
  try {
    const res = await post("/products/by-ids", { productIds });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return {};
  }
};

export const getSizesInBulk = async (studentProductIds) => {
  try {
    const res = await post("/sizes/bulk", studentProductIds);
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return {};
  }
};

export const getPaymentByOrderId = async (orderId) => {
  try {
    const res = await get(`/payment/${orderId}`);
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return null;
  }
};

export const verifyGqPaymentStatus = async (applicationCode) => {
  try {
    const apiKey = "cf24af42-2508-4633-b2a5-febd10795aa7";
    const authToken = "Basic R1EtMjEyNDNjNzUtYmU1Mi00ZDAyLWFiNTItZGJmMDEzNmY2ZDgyOjRlOTI4MzVjLTVkMzQtNGYzOC05MTExLWVhNjhhZGNhNTcwYQ==";
    
    const headers = {
      "GQ-API-Key": apiKey,
      "Authorization": authToken,
      "Content-Type": "application/json"
    };
    
    // Using axios directly for custom headers
    const response = await axios.get(
      `https://erp-api.grayquest.com/v1/payments/fetch?application_code=${applicationCode}`,
      { headers }
    );
    
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Payment verification error:", error);
  }
};
