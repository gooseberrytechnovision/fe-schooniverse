import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";

// Redux
import { Provider, useSelector } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/auth";

import "./App.css";
import Dashboard from "./components/parenPortal/dashboard";
import Footer from "./components/layout/footer";
import CheckoutSummary from "./components/parenPortal/checkoutSummary/CheckoutSummary";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ProfilePage from "./components/parenPortal/ProfilePage";
import OrderHistory from "./components/parenPortal/orders/OrderHistory";
import ProductManagement from "./components/admin/ProductManagement";
import ParentLogin from "./components/auth/ParentLogin";
import StudentManagement from "./components/admin/StudentManagement";
import OrderManagement from "./components/admin/OrderManagement";
import ThankYouPage from "./components/parenPortal/checkoutSummary/ThankyouPage";
import BundleManagement from "./components/admin/BundleManagement";
import FAQs from "./components/parenPortal/FAQs";
import PrivateRoute from "./components/routing/PrivateRoute";
import { ROLES } from "./utils/constants";
import AuthRedirect from "./components/layout/AuthRedirect";
import FullPageSpinner from "./components/layout/FullPageSpinner";
import SupportQueries from "./components/admin/SupportQueries";
import AdminLogin from "./components/auth/AdminLogin";
import AdminManagement from "./components/admin/AdminManagement";
import PasswordReset from "./components/auth/PasswordReset";
import Settings from "./components/admin/Settings";

// Import new pages
import AboutUs from "./pages/about";
import ContactUs from "./pages/contact";
import TermsAndConditions from "./pages/terms";
import PrivacyPolicy from "./pages/privacy";
import RefundPolicy from "./pages/refund-policy";

import { ToastContainer } from "react-toastify";
const ProductListing = lazy(() =>
  import("./components/parenPortal/products/productList")
);
const ChildrenDetails = lazy(() =>
  import("./components/parenPortal/children/ChildrenDetails")
);

const Layout = ({ children }) => {
  const { isAuthenticated, loading, isFirstTimeLogin } = useSelector((state) => state.auth);
  const showNavAndFooter = !isFirstTimeLogin && isAuthenticated && !loading;
  
  return (
    <>
      {loading && <FullPageSpinner loading={loading} />}
      {/* Show Navbar only if authenticated, not loading, and not on first time login */}
      {showNavAndFooter && <Navbar />}
      {children}
      {showNavAndFooter && <Footer />}
    </>
  );
};

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <ToastContainer />
      <Router>
        <Suspense fallback={<FullPageSpinner loading={true} />} />
        <Layout>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/login" element={<ParentLogin />} />
            <Route
              path="/admin/login"
              element={<AdminLogin userType={"Admin"} />}
            />
            <Route
              path="/vendor/login"
              element={<AdminLogin userType={"Vendor"} />}
            />

            {/* Password Reset Route */}
            <Route element={<PrivateRoute />}>
              <Route path="/reset-password" element={<PasswordReset />} />
            </Route>

            {/* Public Routes */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />

            {/* Private Routes for Authenticated Users */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={[ROLES.PARENT]} />}>
              <Route exact path="/products" element={<ProductListing isBundle={false} />} />
              <Route exact path="/bundles" element={<ProductListing isBundle={true} />} />
              <Route path="/children" element={<ChildrenDetails />} />
              <Route path="/order/history" element={<OrderHistory />} />
              <Route path="/thankyou/:orderId" element={<ThankYouPage />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/cart" element={<CheckoutSummary />} />
              <Route path="/checkout" element={<CheckoutSummary />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/students" element={<StudentManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/bundle" element={<BundleManagement />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={[ROLES.VENDOR]} />}>
              <Route path="/vendor/orders" element={<OrderManagement isVendor={true} />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
