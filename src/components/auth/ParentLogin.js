import React, { useEffect, useRef, useState } from "react";
import { KeyRound, UserRound, ArrowRight, ArrowLeft } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ParentLogin.css";
import { loadingChange, sendOTP, verifyOTP } from "../../actions/auth";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import FullPageSpinner from "../layout/FullPageSpinner";
import { toast } from "react-toastify";
import loginImg from "../../images/parentLoginImg.png";
import logo from "../../images/logoWText.png";

const ParentLogin = () => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [authMethod, setAuthMethod] = useState("select");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    dispatch(loadingChange(true));
    if (otp.length) {
      dispatch(verifyOTP({ usid: userId, otp: otp }));
    } else {
      toast.error("Please enter OTP.", {
        position: "top-right",
      });
    }
  };

  const triggerOTP = async () => {
    if (userId) {
      setOtpLoading(true);
      try {
        await sendOTP(userId);
      } catch (error) {
      } finally {
        setOtpLoading(false);
        setAuthMethod("otp");
      }
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <div className="d-inline-flex vh-99 w-100 row">
      <div className="col-md-6 d-none d-md-block p-0 m-0 h-100">
        <img
          src={loginImg}
          alt="Students going to school"
          className="w-100 vh-100 object-fit-cover"
        />
      </div>
      <div className="col-md-6 p-0 m-0 col-sm-12 d-flex align-items-center justify-content-center bg-light ">
        <div className="bg-white align-content-around h-100 w-100">
          <div className="mx-auto w-75">
            <div className="w-75 float-end">
              <div className="">
                <img src={logo} alt="logo" width={250} />
                <p className="auth-subtitle my-4">
                  Please enter your details to continue
                </p>
              </div>

              {authMethod === "select" &&
                (otpLoading ? (
                  <FullPageSpinner loading={otpLoading} />
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="fw-medium pb-2">Enter User ID</div>
                      <div className="input-icon-wrapper">
                        <UserRound className="input-icon" size={20} />
                        <input
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          className="form-control input-with-icon"
                          placeholder="Enter User ID"
                          ref={inputRef}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <button
                        type="button"
                        onClick={() => triggerOTP()}
                        className="btn btn-primary w-100"
                        disabled={!userId}
                      >
                        <KeyRound size={20} className="me-2" /> Login with OTP
                      </button>
                    </div>
                  </>
                ))}

              {authMethod === "otp" && (
                <form onSubmit={handleOtpSubmit}>
                  <div className="mb-4">
                    <div className="input-icon-wrapper">
                      <KeyRound className="input-icon" size={20} />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="form-control input-with-icon"
                        placeholder="Enter OTP"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-secondary w-100 mb-3"
                  >
                    <ArrowRight size={20} className="me-2" /> Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod("select")}
                    className="btn btn-light w-100"
                  >
                    <ArrowLeft size={20} className="me-2" /> Back
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentLogin;
