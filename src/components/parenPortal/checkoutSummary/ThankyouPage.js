import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { downloadPaymentReceipt } from "../../../utils/pdfGenerator";

const ThankYouPage = () => {
  const { orderId } = useParams();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true);
      await downloadPaymentReceipt(orderId);
      toast.success("Receipt downloaded successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Failed to download receipt. Please try again.", { position: "top-right" });
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card p-5 shadow border-0 rounded-4"
        style={{ maxWidth: "450px" }}
      >
        <div className="card-body text-center">
          <i
            className="bi bi-check-circle-fill text-success mb-4"
            style={{ fontSize: "4rem" }}
          ></i>
          <h2 className="fw-bold text-success mb-3">Thank You!</h2>
          <p className="text-muted fs-5 mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-secondary mb-4">
            Order ID: <strong>{orderId}</strong>
          </p>
          <div className="d-grid gap-2">
            <button 
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="btn btn-primary btn-lg px-4"
            >
              {downloading ? (
                <>
                  <i className="bi bi-download me-2"></i>
                  Downloading...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Download Receipt
                </>
              )}
            </button>
            <Link to="/" className="btn btn-success btn-lg px-4">
            Return Home
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
