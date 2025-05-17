import {
  CART_FETCH_SUCCESS,
  CART_FETCH_UPDATE_FAIL,
  CART_LOADING_CHANGE,
  CLEAR_PRODUCT,
  ITEM_DELETE_FAIL,
  ITEM_DELETE_SUCCESS,
  ORDER_PLACED_SUCCESSFULLY,
  ORDER_PLACEMENT_FAIL,
  PRODUCT_ADDED_CART,
  PRODUCT_CART_ADD_FAILED,
  UPDATE_CART_ITEMS,
} from "../actions/types";

const initialState = {
  loading: true,
  cartId: null,
  parentId: null,
  items: null,
  error: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case PRODUCT_ADDED_CART:
    case CART_FETCH_SUCCESS:
    case ITEM_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        cartId: payload.id,
        parentId: payload.parentId,
        items: payload.items,
        error: null,
      };
    case PRODUCT_CART_ADD_FAILED:
    case CART_FETCH_UPDATE_FAIL:
    case ITEM_DELETE_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };
    case CART_LOADING_CHANGE:
      return {
        ...state,
        loading: payload,
      };
    case ORDER_PLACED_SUCCESSFULLY:
      return {
        ...state,
        loading: false,
        error: null,
        cartId: null,
        parentId: null,
        items: null,
      };
    case ORDER_PLACEMENT_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };
    case UPDATE_CART_ITEMS:
      return {
        ...state,
        items: payload,
      };
    case CLEAR_PRODUCT:
      return {
        loading: true,
        cartId: null,
        parentId: null,
        items: null,
        error: null,
      };
    default:
      return state;
  }
}
