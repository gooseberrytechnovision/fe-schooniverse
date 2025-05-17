import React, { lazy, Suspense } from "react";
import CheckoutStepper from "../checkoutStepper/checkoutStepper";
import { useLocation } from "react-router-dom";
import "./CheckoutSummary.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";
import FullPageSpinner from "../../layout/FullPageSpinner";

// Lazy Load the Cart component
const Cart = lazy(() => import("./Cart"));
const PlacedOrder = lazy(() => import("./PlacedOrder"));

const stepLabel = ["🛒 SHOPPING CART", "📦 ORDER CONFIRMATION"];
const stepPaths = ["cart", "checkout"];

const CheckoutSummary = () => {
  const location = useLocation();
  const currentPath = location.pathname.replace("/", ""); // Get the current path
  const activeStep = stepPaths.indexOf(currentPath); // Determine active step index

  // Dynamically render the correct component
  const renderStepComponent = () => {
    switch (currentPath) {
      case "cart":
        return (
          <Suspense fallback={<FullPageSpinner loading={true} />}>
            <Cart />
          </Suspense>
        );
      // case "payment":
      //   return <PaymentMethod />;
      case "checkout":
        return (
          <Suspense fallback={<FullPageSpinner loading={true} />}>
            <PlacedOrder />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<FullPageSpinner loading={true} />}>
            <Cart />
          </Suspense>
        ); // Default to Cart if path doesn't match
    }
  };

  return (
    <div>
      <div className="container-fluid stepper-header">
        <div className="container py-3">
          <div className="row">
            <div className="col-md-4">
              <div className="h-100 align-content-around">
                <Link to="/products" className="text-white">
                  <ArrowBackIcon />
                </Link>{" "}
                Continue Shopping
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="container">
        <div className="stepper-label mt-4">{stepLabel[activeStep]}</div>
      </div>

      <CheckoutStepper activeStep={activeStep} />

      {/* Load the appropriate component dynamically */}
      {renderStepComponent()}
    </div>
  );
};

export default CheckoutSummary;
