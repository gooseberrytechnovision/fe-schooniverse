import React, { useState } from "react";
import "./PopupDialog.css";

const ParentEditDialog = ({ data, onSave, onCancel, header }) => {
  const [formData, setFormData] = useState(data);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password) => {
    // Skip validation if password is empty (optional for updates)
    if (password.trim() === "") {
      return "";
    }
    
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

  const handleChange = (index, newValue) => {
    const updatedData = [...formData];
    updatedData[index].value = newValue;
    
    // Validate password if the field is a password field
    if (updatedData[index].label.toLowerCase() === "password") {
      setPasswordError(validatePassword(newValue));
    }
    
    setFormData(updatedData);
  };

  // Check if all fields are filled and password is valid
  const isFormValid = formData.every((item) => {
    // Skip validation for password field if it's empty (as it's optional for updates)
    if (item.label.toLowerCase() === "password") {
      return passwordError === "" || item.value.trim() === "";
    }
    // For other fields
    return item.value.trim() !== "";
  });

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title col-md-10 text-start">
              {header ? header : "Edit Data"}
            </h5>
            <button
              type="button"
              className="close col-md-2 text-end"
              onClick={onCancel}
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {formData.map((item, index) => (
              <div className="form-group row my-2" key={index}>
                <label className="col-sm-4 col-form-label text-right">
                  {item.label}
                </label>
                <div className="col-sm-8">
                  {item.editable ? (
                    item.options && Array.isArray(item.options) ? (
                      // Dropdown (Select) Field with Default Option
                      <select
                        className="form-control dialog-select"
                        value={item.value}
                        onChange={(e) => handleChange(index, e.target.value)}
                      >
                        <option value="">Select an option</option>
                        {item.options.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Text Input Field
                      <>
                      <input
                        type="text"
                          className={`form-control ${item.label.toLowerCase() === "password" && passwordError ? "is-invalid" : ""}`}
                        value={item.value}
                        maxLength={item?.maxLength || undefined}
                        onChange={(e) => handleChange(index, e.target.value)}
                      />
                        {item.label.toLowerCase() === "password" && (
                          <div className={passwordError ? "invalid-feedback d-block" : "form-text small text-muted mt-1"}>
                            {passwordError || "Password requires min 6 chars, max 20 chars, 1 capital letter, 1 special character"}
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    // Read-only Text
                    <p className="form-control-plaintext text-start">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-danger" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSave(formData)}
              disabled={!isFormValid}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentEditDialog;
