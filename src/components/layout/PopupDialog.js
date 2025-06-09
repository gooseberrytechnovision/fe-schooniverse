import React, { useState } from "react";
import "./PopupDialog.css";
import { findParentByPhone } from "../../actions/product";

const PopupDialog = ({ data, onSave, onCancel, header }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (index, newValue) => {
    const updatedData = [...formData];
    updatedData[index].value = newValue;
    setFormData(updatedData);
    if (updatedData[index].label === "Phone Number") {
      handlePhoneChange(updatedData[index].value, updatedData);
    }
  };

  const handlePhoneChange = async (value, formData) => {
    const updatedData = [...formData];
    const parentNameIndex = updatedData.findIndex(item => item.label === "Parent Name");
    const emailIndex = updatedData.findIndex(item => item.label === "Email");
    if (value && value.length >= 10) {
      const parent = await findParentByPhone(value);
      
      if (parent) {
        updatedData[parentNameIndex].value = parent.parentName || "";
        updatedData[emailIndex].value = parent.email || "";
        updatedData[parentNameIndex].editable = false;
        updatedData[emailIndex].editable = false;
      } else {
        updatedData[parentNameIndex].value = "";
        updatedData[emailIndex].value = "";
        updatedData[parentNameIndex].editable = true;
        updatedData[emailIndex].editable = true;
      }
    } else {
      updatedData[parentNameIndex].value = "";
      updatedData[emailIndex].value = "";
      updatedData[parentNameIndex].editable = true;
      updatedData[emailIndex].editable = true;
    }
    setFormData(updatedData);
  };
  // Check if all fields are filled
  const isFormValid = formData.every((item) => item?.value?.trim() !== "");

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
                      <input
                        type="text"
                        className="form-control"
                        value={item.value}
                        maxLength={item?.maxLength || undefined}
                        onChange={(e) => handleChange(index, e.target.value)}
                      />
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

export default PopupDialog;
