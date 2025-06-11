import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../../images/logoWText.png";
import { updateParent, logout } from "../../actions/auth";

const PasswordReset = () => {
  const dispatch = useDispatch();
  const { user, isFirstTimeLogin } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password) => {
    // Minimum length check
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    
    // Maximum length check
    if (password.length > 20) {
      return "Password cannot exceed 20 characters";
    }
    
    // Capital letter check
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one capital letter";
    }
    
    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character";
    }
    
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (passwordError) {
      return toast.error(passwordError);
    }

    setIsSubmitting(true);
    
    // Use the existing updateUser action instead of a separate reset API
    await updateParent({ 
      role: user.role,
      id: user.id,
      password: password,
    }, true)
    dispatch(logout());
    setIsSubmitting(false);
  };
  return (
    <div className={`d-flex w-100 align-items-center justify-content-center bg-light ${isFirstTimeLogin ? "vh-100" : "py-4"}`}>
      <div className="bg-white p-4 rounded shadow-sm w-100" style={{ maxWidth: "500px" }}>
        <div className="text-center mb-4">
        {isFirstTimeLogin && <img src={logo} alt="logo" width={250} className="mb-4 mx-auto" />}
          <h3 className="fw-bold">Reset Your Password</h3>
          {isFirstTimeLogin && <p className="text-muted">
            You've logged in with a default password. Please create a new password to continue.
          </p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="fw-medium pb-2">New Password</div>
            <div className="input-icon-wrapper mb-0">
              <Lock className="input-icon" size={20} />
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control input-with-icon ${passwordError ? "is-invalid" : ""}`}
                placeholder="Enter new password"
                required
              />
            </div>
              <div className={passwordError ? "invalid-feedback d-block" : "form-text small text-muted mt-1"}>
                {passwordError || "Password requires min 6 chars, max 20 chars, 1 capital letter, 1 special character"}
              </div>
          </div>

          <div className="mb-4">
            <div className="fw-medium pb-2">Confirm Password</div>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control input-with-icon"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting || passwordError || !formData.password || !formData.confirmPassword}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset; 