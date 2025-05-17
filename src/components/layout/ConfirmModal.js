import React from "react";

const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Action</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>{message || "Are you sure you want to proceed?"}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
