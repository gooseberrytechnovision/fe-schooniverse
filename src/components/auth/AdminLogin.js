import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/auth.css"; // Ensure CSS is imported properly
import { adminLogin, loadingChange } from "../../actions/auth";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import adminLoginImg from "../../images/adminLoginImg.png";
import logo from "../../images/logoWText.png";

const AdminLogin = ({ userType }) => {
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loadingChange(true));
    if (email && password) {
      dispatch(adminLogin({ email: email, password: password }));
    } else {
      toast.error("Enter Email and Password.", {
        position: "top-right",
      });
    }
  };

  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <div className="d-inline-flex vh-99 w-100 row">
      <div className="col-md-6 d-none d-md-block p-0 m-0 h-100">
        <img
          src={adminLoginImg}
          alt="Students going to school"
          className="w-100 vh-100 object-fit-cover"
        />
      </div>
      <div className="col-md-6 p-0 m-0 col-sm-12 d-flex align-items-center justify-content-center bg-light ">
        <div className="bg-white align-content-around h-100 w-100">
          <div className="mx-auto w-75">
            <form onSubmit={handleLoginSubmit} className="w-75 float-end">
              <>
                <img src={logo} alt="logo" width={250} />
                <div className="my-4">
                  <h2 className="fs-4">{userType} Login</h2>
                  <p className="auth-subtitle">
                    Enter your credentials to continue
                  </p>
                </div>
              </>

              <div className="mb-4">
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control input-with-icon"
                    placeholder="Enter Username"
                    ref={inputRef}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control input-with-icon"
                    placeholder="Enter Password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn auth-btn auth-btn-password w-100 mb-3"
              >
                <span>Login</span>
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
