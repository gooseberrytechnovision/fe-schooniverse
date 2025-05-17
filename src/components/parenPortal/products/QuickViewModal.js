import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import bannerImage from "../../../images/Gaudium washcare banner.png";
import { updateProductSize } from "../../../actions/product";
import { sizeOptions as productSizeOptions } from "../../../utils/constants";

const QuickViewModal = ({ bundle, onClose, onAddToCart, showAction, user, onSizeUpdate }) => {
  const [quantity, setQuantity] = useState(1);
  const [productSizes, setProductSizes] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [pendingSizes, setPendingSizes] = useState({});

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [bundle]);

  if (!bundle) return null;

  const handleAddToCart = () => {
    onAddToCart(bundle.bundle_id, quantity, bundle.student.id);
  };

  const handleDownloadImage = () => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = bannerImage;
    link.download = 'Gaudium-washcare-instructions.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewSizeChart = (productName) => {
    const jpgUrl = `/images/size-charts/${productName}.jpg`;
    const pngUrl = `/images/size-charts/${productName}.png`;
    // Try to determine which URL to use
    const img = new Image();
    img.onload = () => {
      window.open(jpgUrl, '_blank');
    };
    img.onerror = () => {
      // If JPG fails, try PNG
      const pngImg = new Image();
      pngImg.onload = () => {
        window.open(pngUrl, '_blank');
      };
      pngImg.onerror = () => {
        toast.error("Size chart not found", { position: "top-right" });
      };
      pngImg.src = pngUrl;
    };
    img.src = jpgUrl;
  };

  const handleSizeSelect = (productId, size) => {
    setPendingSizes(prev => ({ ...prev, [productId]: size }));
  };
  
  const handleSaveSizeClick = async (productId) => {
    const size = pendingSizes[productId];
    if (!size) return;
    
    // Set loading state for this product
    setLoadingStates(prev => ({ ...prev, [productId]: true }));
    
    try {
      // Update local state
      setProductSizes(prev => ({ ...prev, [productId]: size }));
      
      const sizeData = {
        size,
        studentId: bundle.student.id,
        productId
      };
      
      await updateProductSize(sizeData);
      
      // Update the bundle object with the new size
      if (onSizeUpdate) {
        const updatedBundle = {
          ...bundle,
          products: bundle.products.map(product => {
            if (product.product_id === productId) {
              return { ...product, size };
            }
            return product;
          })
        };
        onSizeUpdate(updatedBundle);
      }
      
      // Clear pending size after successful save
      setPendingSizes(prev => {
        const newState = {...prev};
        delete newState[productId];
        return newState;
      });
      
      toast.success("Size updated successfully", { position: "top-right" });
    } catch (error) {
      setProductSizes(prev => ({ ...prev, [productId]: '' }));
      toast.error("Failed to update size", { position: "top-right" });
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg w-m-50"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{bundle.bundle_name}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <img
              src={bundle.image}
              className="img-fluid mb-3"
              alt={bundle.bundle_name}
              style={{ maxHeight: "400px", width: "100%" }}
            />
            {showAction && (
              <p>
                <strong>Student Name:</strong> {bundle.student?.studentName}
              </p>
            )}
            <p>
              <strong>Gender:</strong> {bundle.gender}
            </p>
            {showAction && (
              <p>
                <strong>Class:</strong> {bundle.class_name}
              </p>
            )}
            {showAction && (
              <p>
                <strong>House:</strong> {bundle.student?.house}
              </p>
            )}
            <p>
              <strong>Recommended For:</strong> {bundle.applicable_classes}
            </p>
            <p>
              <strong>Bundle Price:</strong> ₹{bundle.bundle_total}
            </p>

            <h6 className="mt-4">Bundle Contents</h6>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size Chart</th>
                    <th>Quantity</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.products
                    .filter((item) => !item.optional)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.product_name}</td>
                        <td>
                            <button onClick={(e) => {
                              e.preventDefault();
                              handleViewSizeChart(item.product_name);
                            }} className="text-primary">
                              View Size Chart
                            </button>
                        </td>
                        <td>{item.quantity}</td>
                        <td>
                          {item.size ? (
                            item.size
                          ) : (
                            <div className="d-flex align-items-center">
                              {productSizeOptions[item.product_name] ? (
                                <select
                                  className="form-select form-select-sm"
                                  value={pendingSizes[item.product_id] || productSizes[item.product_id] || ""}
                                  onChange={(e) => handleSizeSelect(item.product_id, e.target.value)}
                                  disabled={loadingStates[item.product_id]}
                                >
                                  <option value="">Select Size</option>
                                  {productSizeOptions[item.product_name]?.map((size) => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Enter size"
                                  value={pendingSizes[item.product_id] || productSizes[item.product_id] || ""}
                                  onChange={(e) => handleSizeSelect(item.product_id, e.target.value)}
                                  disabled={loadingStates[item.product_id]}
                                />
                              )}
                              {pendingSizes[item.product_id] && (
                                <button 
                                  className="btn btn-sm btn-primary ms-2"
                                  onClick={() => handleSaveSizeClick(item.product_id)}
                                  disabled={loadingStates[item.product_id]}
                                >
                                  {loadingStates[item.product_id] ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  ) : (
                                    "Save"
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-3 text-center">
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={handleDownloadImage}
              >
                <i className="bi bi-download me-1"></i>
                Download Washcare Instructions
              </button>
            </div>
          </div>

          <div className="modal-footer">
            {showAction && (
              <>
                {/* Quantity Selection Dropdown */}
                {/* <div className="d-flex align-items-center">
                  <label className="me-2" htmlFor="quantitySelect">
                    Quantity:
                  </label>
                  <select
                    id="quantitySelect"
                    className="form-select me-3"
                    style={{ width: "80px" }}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div> */}
              </>
            )}

            <button type="button" className="btn btn-danger" onClick={onClose}>
              Close
            </button>
            {showAction && (
              <button
                type="button"
                className={`btn ${bundle.isAlreadyPurchased ? "btn-secondary" : "btn-primary"}`}
                onClick={handleAddToCart}
                disabled={bundle.isAlreadyPurchased}
              >
                {bundle.isAlreadyPurchased ? "Already Purchased" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
