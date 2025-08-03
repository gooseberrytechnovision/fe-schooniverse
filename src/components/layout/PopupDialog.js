import React, { useState } from "react";
import "./PopupDialog.css";
import { findParentByPhone } from "../../actions/product";
import { Plus, Minus } from "lucide-react";

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

  const handleMultipleEntryChange = (parentIndex, entryIndex, value) => {
    const updatedData = [...formData];
    const currentValues = Array.isArray(updatedData[parentIndex].value) 
      ? updatedData[parentIndex].value 
      : [];
    
    const newValues = [...currentValues];
    newValues[entryIndex] = value;
    
    updatedData[parentIndex].value = newValues;
    setFormData(updatedData);
  };

  const addMultipleEntryField = (index) => {
    const updatedData = [...formData];
    // Make sure value is an array
    const currentValues = Array.isArray(updatedData[index].value) 
      ? updatedData[index].value 
      : [];
    
    updatedData[index].value = [...currentValues, ""];
    setFormData(updatedData);
  };

  const removeMultipleEntryField = (parentIndex, entryIndex) => {
    const updatedData = [...formData];
    const currentValues = [...updatedData[parentIndex].value];
    currentValues.splice(entryIndex, 1);
    updatedData[parentIndex].value = currentValues;
    setFormData(updatedData);
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
  const isFormValid = formData.every((item) => {
    if (item.optional === true && item.options !== "Multiple Entry") {
      return true;
    }
    if(item.options === "Multiple Entry"){
      if(item.value.length > 0){
        return item.value.every(val => val.trim() !== "");
      }
      if(item.value.length === 0 && item.optional === true){
        return true;
      }
      return false;
    }
    return item?.value?.trim() !== "";
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
                    ) : item.options && item.options === "Multiple Entry" ? (
                      <div>
                        {Array.isArray(item.value) && item.value.length > 0 ? (
                          item.value.map((entry, entryIndex) => (
                            <div key={entryIndex} className="d-flex mb-2 align-items-center">
                              <input
                                type="text"
                                className="form-control me-2"
                                value={entry}
                                maxLength={5}
                                onChange={(e) => handleMultipleEntryChange(index, entryIndex, e.target.value)}
                              />
                              <div className="d-flex">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger me-1"
                                  onClick={() => removeMultipleEntryField(index, entryIndex)}
                                >
                                  <Minus size={16} />
                                </button>
                                {entryIndex === item.value.length - 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success"
                                    disabled={item.value[entryIndex] === ""}
                                    onClick={() => addMultipleEntryField(index)}
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              const updatedData = [...formData];
                              updatedData[index].value = [""];
                              setFormData(updatedData);
                            }}
                          >
                            <Plus size={16} /> Add Entry
                          </button>
                        )}
                      </div>
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
                      {Array.isArray(item.value) ? item.value.join(", ") : item.value}
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
