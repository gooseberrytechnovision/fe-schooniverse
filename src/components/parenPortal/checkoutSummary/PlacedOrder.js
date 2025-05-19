import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./PlaceOrder.css";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import {
  getCartDetail,
  loadingCartChange,
  orderPlaced,
  paymentClosed,
  paymentConfig,
  paymentError,
  paymentSuccess,
} from "../../../actions/product";
import { updateStudentDetail } from "../../../actions/student";
import FullPageSpinner from "../../layout/FullPageSpinner";
import { SHIPPING_CHARGES } from "../../../utils/constants";
import { UPDATE_CART_ITEMS } from "../../../actions/types";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, cartData } = useSelector((state) => ({
    user: state.auth.user,
    cartData: state.product,
  }));
  const method = "DIRECT";

  const [orderId, setOrderId] = useState();
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("school");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");
  const [addressUpdateLoading, setAddressUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        dispatch(getCartDetail(user.id));
      } catch (error) {
        toast.error("Failed to load cart items!", { position: "top-right" });
      }
    };
    if (!cartData?.items?.length && !paymentDone) {
      fetchCart();
    }
  }, [dispatch, cartData?.items?.length, paymentDone, user.id]);

  useEffect(() => {
    if (cartData?.items?.length) {
      const total = cartData.items.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0
      );
      const quantity = cartData.items.reduce(
        (acc, item) => acc + (item.quantity || 0),
        0
      );

      setTotalQuantity(quantity);
      setGrandTotal(
        shippingMethod === "home" ? total + SHIPPING_CHARGES : total
      );
    } else {
      setTotalQuantity(0);
      setGrandTotal(0);
    }
  }, [cartData?.items, shippingMethod]);

  useEffect(() => {
    const handleGqSuccess = (paymentResponse) => {
      const paymentData = paymentResponse?.gqData?.data;
      if (paymentData.event === "dt.payment.captured") {
        dispatch(paymentSuccess({ order_id: orderId, ...paymentData, cartItems: cartData.items }));
        setPaymentDone(true);
        localStorage.setItem("orderId", orderId);
      }
    };

    const handleGqError = (errorInfo) => {
      const paymentData = errorInfo?.gqData?.data;
      if (paymentData?.event === "dt.payment.failed") {
        paymentError({ order_id: orderId, ...paymentData, cartItems: cartData.items });
        setPaymentFailed(true);
      } else {
        toast.error("Payment failed. Please try again.", {
          position: "top-right",
        });
      }
    };

    const handleGqPopUpClose = (closeData) => {
      if (paymentDone) {
        toast.success("Order placed successfully!", {
          position: "top-right",
        });
        navigate(`/thankyou/${orderId}`);
      }

      if (paymentFailed) {
        toast.error("Payment failed. Please try again.", {
          position: "top-right",
        });
      }

      if (!paymentDone && !paymentFailed) {
        paymentClosed({
          event: closeData.gqData.data.event,
          order_code: orderId,
          cartItems: cartData.items,
        });
        toast.info("Payment cancelled by user.", { position: "top-right" });
      }
    };

    document.addEventListener("onGqSuccess", handleGqSuccess);
    document.addEventListener("onGqError", handleGqError);
    document.addEventListener("onGqPopupClose", handleGqPopUpClose);

    return () => {
      document.removeEventListener("onGqSuccess", handleGqSuccess);
      document.removeEventListener("onGqError", handleGqError);
      document.removeEventListener("onGqPopupClose", handleGqPopUpClose);
    };
  });

  const handlePlaceOrder = () => {
    if (!cartData?.items?.length) {
      toast.warning("Your cart is empty!", { position: "top-right" });
      return;
    }
    dispatch(loadingCartChange(true));
    dispatch(
      orderPlaced({
        parentId: user.id,
        shippingMethod: shippingMethod,
        paymentMethod: method,
      })
    )
      .then((orderInfo) => {
        if (orderInfo?.id) {
          setOrderId(orderInfo.id);
          setLoading(true);
          paymentConfig(orderInfo.id)
            .then((config) => {
              window.GqErpSDK.setOptions({
                ...config,
                customer_mobile: user?.phoneNumber,
              });
              window.GqErpSDK.render();
            })
            .catch(() => {
              toast.error(
                "Something went wrong on our end. Please try again later.",
                { position: "top-right" }
              );
            })
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {
        toast.error(
          "Something went wrong on our end. Please try again later.",
          { position: "top-right" }
        );
      });
  };

  const handleEditAddress = () => {
    setEditedAddress(cartData.items[0]?.student?.address || "");
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    if (!editedAddress.trim()) {
      toast.error("Address cannot be empty", { position: "top-right" });
      return;
    }

    setAddressUpdateLoading(true);
    try {
      const studentId = cartData.items[0]?.student?.usid;
      if (!studentId) {
        toast.error("Student information not found", { position: "top-right" });
        return;
      }
      
      await updateStudentDetail({ address: editedAddress }, studentId);
      
      // Update local cart data to show new address
      const updatedItems = [...cartData.items];
      updatedItems[0] = {
        ...updatedItems[0],
        student: {
          ...updatedItems[0].student,
          address: editedAddress
        }
      };
      dispatch({ 
        type: UPDATE_CART_ITEMS, 
        payload: updatedItems
      });
      
      toast.success("Address updated successfully", { position: "top-right" });
      setIsEditingAddress(false);
    } catch (error) {
      toast.error("Failed to update address", { position: "top-right" });
    } finally {
      setAddressUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingAddress(false);
  };

  return cartData?.loading || loading ? (
    <FullPageSpinner loading={cartData?.loading || loading} />
  ) : (
    <div className="container py-4">
      <div className="row">
        {/* Left Column - Order Summary */}
        <div className="col-lg-8">
          <div className="mb-3 fs-3">Order Items</div>
          {cartData?.items?.length ? (
            cartData.items.map((item) => (
              <div key={item.bundleId} className="card default-card ">
                <div className="row g-0 align-items-center">
                  <div className="col-md-3 text-center p-2">
                    <img
                      src={item.bundle?.image}
                      className="img-fluid rounded shadow-sm"
                      alt={item.bundle?.name || "Product"}
                      style={{ maxHeight: "120px" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="card-body">
                      <h5 className="card-title text-dark fw-bold">
                        {item.bundle?.name || "Unknown Product"}
                      </h5>
                      <p className="text-muted">₹{item.price || 0}</p>
                      <p className="small mb-1">
                        <strong>Student Name:</strong>{" "}
                        {item.student.studentName || "--"}
                      </p>
                      <p className="small mb-1">
                        <strong>Class:</strong> {item.student.class || "--"}
                      </p>
                      {/* <p className="small mb-1">
                        <strong>Recommended For:</strong>{" "}
                        {item.bundle.applicableClasses || "N/A"}
                      </p> */}
                      <p className="small mb-1">
                        <strong>Gender:</strong>{" "}
                        {item.bundle.gender || "Unisex"}
                      </p>
                      <p className="small mb-1">
                        <strong>House:</strong>{" "}
                        {item.student?.house || "-"}
                      </p>
                      <p className="small mb-1">
                        <strong>Quantity:</strong> {item.quantity || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">Your cart is empty 🛒</p>
          )}
        </div>
        {/* Right Column - Shipping & Payment */}
        <div className="col-lg-4">
          {/* Shipping Details */}
          <div className="fs-3 mb-3">Order Summary</div>
          {/* Payment & Total Summary */}
          <div className="card default-card ">
            <h4 className="mb-3 text-primary">💳 Payment & Shipping</h4>
            <p className="d-flex justify-content-between fw-bold">
              <span>Total Items:</span> <span>{totalQuantity}</span>
            </p>
            <p className="d-flex justify-content-between text-dark">
              <span>Shipping Charges:</span>{" "}
              <span>
                {shippingMethod === "home" ? SHIPPING_CHARGES : "No Charges"}
              </span>
            </p>
            <p className="d-flex justify-content-between text-dark fw-bold">
              <span>Grand Total:</span>{" "}
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </p>
            <hr />
            <div className="fs-5 shipping-title">Shipping details</div>
            <p className=" mb-1">{user?.parentName}</p>
            {/* Shipping Preference Box */}
            {cartData?.items?.length > 0 && (
              <>
                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="shippingMethod"
                    id="pickupFromSchool"
                    value="school"
                    checked={shippingMethod === "school"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="pickupFromSchool"
                  >
                    Pick Up from School (No Charges)
                  </label>
                </div>
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="shippingMethod"
                    id="homeDelivery"
                    value="home"
                    checked={shippingMethod === "home"}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="homeDelivery">
                    Home Delivery (₹{SHIPPING_CHARGES})
                  </label>
                </div>

                {/* Show address if "Delivered at Home" is selected */}
                {shippingMethod === "home" &&
                  cartData.items[0]?.student?.address && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                      <p className="fw-bold mb-1">📍 Delivery Address:</p>
                        {!isEditingAddress && (
                          <button 
                            onClick={handleEditAddress} 
                            className="btn btn-sm btn-link p-0"
                            aria-label="Edit address"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>
                      
                      {isEditingAddress ? (
                        <div className="mb-3">
                          <textarea
                            className="form-control mb-2"
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            rows={3}
                            placeholder="Enter delivery address"
                          />
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={handleSaveAddress}
                              disabled={addressUpdateLoading}
                            >
                              {addressUpdateLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleCancelEdit}
                              disabled={addressUpdateLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                      <p className="text-muted mb-0">
                        {cartData.items[0].student.address}
                      </p>
                      )}
                    </div>
                  )}
              </>
            )}
            <hr />

            <button
              className="btn btn-primary w-100 mt-3 text-white gq-button"
              onClick={handlePlaceOrder}
              disabled={!cartData?.items?.length}
              id="gq-button"
            >
              🛍️ Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
