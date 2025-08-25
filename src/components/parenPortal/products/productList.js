import { useEffect, useState } from "react";
import QuickViewModal from "./QuickViewModal";
import "./productList.css";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchLinkedBundles } from "../../../actions/product";
import FullPageSpinner from "../../layout/FullPageSpinner";
import { toast } from "react-toastify";
import { loadUser } from "../../../actions/auth";
import { updateProductSize } from "../../../actions/product";

const ProductListing = ({ isBundle = false }) => {
  const { user } = useSelector((state) => state.auth);
  const [bundles, setBundles] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [search, setSearch] = useState("");
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});

  const dispatch = useDispatch();

  const getBundles = async () => {
    if (!user.students?.length) {
      setBundles([]);
      setLoading(false);
      return;
    }

    try {
      if ((isBundle && user?.settings?.enableBulkProducts) || (!isBundle && user?.settings?.enableIndividualProducts)) {
        const bundleResponses = await Promise.all(
          user.students.map((id, index) => {
            let type = user?.studentData[index]?.studentType;
            return fetchLinkedBundles(id, type, !isBundle);
          })
        );
        const updatedBundles = bundleResponses.flat().map((bundle, index) => ({
          ...bundle,
          student: user.studentData[index % user.studentData.length], // Assign student
        }));
        setBundles(updatedBundles);

        // Initialize quantities and sizes state for all bundles
        const initialQuantities = {};
        const initialSizes = {};
        updatedBundles.forEach(bundle => {
          initialQuantities[bundle.bundle_id] = bundle?.products[0]?.quantity || 1;

          // Set default size to the first available size if there are any
          if (bundle?.products[0]?.availableSizes && bundle.products[0].availableSizes.length > 0) {
            initialSizes[bundle.bundle_id] = bundle.products[0].availableSizes[0];
          } else {
            bundle.products[0].availableSizes = ["Free-NA"];
            initialSizes[bundle.bundle_id] = "Free-NA";
          }
        });
        setQuantities(initialQuantities);
        setSelectedSizes(initialSizes);
      }
    } catch (error) {
      setBundles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    dispatch(loadUser());
    user?.settings?.enablePurchasing ? getBundles() : setLoading(false);
  }, [user.students?.length, isBundle]);

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    let sortedBundles = [...bundles];

    if (event.target.value === "price-low-high") {
      sortedBundles.sort((a, b) => a.bundle_total - b.bundle_total);
    } else if (event.target.value === "price-high-low") {
      sortedBundles.sort((a, b) => b.bundle_total - a.bundle_total);
    }
    setBundles(sortedBundles);
  };

  // Handler for size updates in the bundle
  const handleBundleSizeUpdate = (updatedBundle) => {
    // Update the selected bundle
    setSelectedBundle(updatedBundle);

    // Update the bundle in the main list
    setBundles(prevBundles =>
      prevBundles.map(bundle =>
        bundle.bundle_id === updatedBundle.bundle_id ? updatedBundle : bundle
      )
    );
  };

  const handleQuantityChange = (bundleId, value) => {
    setQuantities(prev => ({
      ...prev,
      [bundleId]: value
    }));
  };

  const handleSizeChange = (bundle, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [bundle.bundle_id]: size
    }));
  };

  const addToCartClick = async (bundleId, quantity, studentId) => {
    if (!user?.settings?.enablePurchasing) {
      toast.error("Purchasing is currently disabled by the administrator.", { position: "top-right" });
      return;
    }
    if (!isBundle) {
      const sizeData = {
        size: selectedSizes[bundleId],
        studentId: studentId,
        productId: filteredBundles.find(b => b.bundle_id === bundleId)?.products[0]?.product_id
      };

      updateProductSize(sizeData, false);
    }

    setLoading(true);
    const body = { bundleId, quantity, parentId: user.id, studentId };

    try {
      await dispatch(addToCart(body));
      toast.success("Product added to cart successfully!", {
        position: "top-right",
      });
    } catch (error) {
      toast.error("Failed to add product to cart.", { position: "top-right" });
    } finally {
      setLoading(false);
      setSelectedBundle(null);
    }
  };

  const filteredBundles = bundles.filter((bundle) =>
    bundle.bundle_name?.toLowerCase().includes(search?.toLowerCase())
  );

  // Check if purchasing is disabled
  if (!user?.settings?.enablePurchasing) {
    return (
      <div className="container py-5 my-10 text-center">
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Purchasing Temporarily Unavailable</h4>
          <p>Product purchasing is currently disabled by the administrator. Please check back later.</p>
        </div>
      </div>
    );
  }

  // Check if all product types are disabled
  if (!user?.settings?.enableIndividualProducts && !user?.settings?.enableBulkProducts) {
    return (
      <div className="container py-5 my-10 text-center">
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Products Temporarily Unavailable</h4>
          <p>Product purchasing is currently disabled by the administrator. Please check back later.</p>
        </div>
      </div>
    );
  }

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      {/* <div className="row mb-4">
        <div className="col-md-8">
          <input
            type="text"
            placeholder="Search bundles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control mb-2 mb-md-0 w-100 w-md-75"
          />
        </div>
        <div className="col-md-4">
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="form-select w-100 w-md-25 ms-md-3"
          >
            <option value="default">Sort by</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div> */}

      <div className="row g-4">
        {filteredBundles.length > 0 ? (
          <div className="row g-4">
            {filteredBundles.map((bundle, index) => (
              <div
                key={`${bundle.bundle_id}-${index}`}
                className="col-12 col-sm-6 col-md-6 col-xl-4"
              >
                <div className="card product-card shadow-sm border-0 h-100">
                  <div className="position-relative">
                    <img
                      src={bundle.image}
                      className="card-img-top"
                      alt={bundle.name}
                      style={{ maxHeight: "350px" }}
                    />
                    {isBundle && <div className="card-img-overlay d-flex justify-content-center align-items-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => setSelectedBundle(bundle)}
                      >
                        Quick View
                      </button>
                    </div>}
                  </div>
                  <div className="card-body text-center d-flex flex-column">
                    <h5 className="card-title fw-bold">{bundle.bundle_name}</h5>
                    <div className="bundle-details">
                      <strong>Student Name:</strong>{" "}
                      <span>{bundle.student?.studentName}</span>
                      <strong>Gender:</strong> <span>{bundle.gender}</span>
                      <strong>Class:</strong> <span>{bundle.class_name}</span>
                      <strong>House:</strong> <span>{bundle.student?.house}</span>
                    </div>
                    <p className="fw-bold text-primary fs-5">
                      ₹{bundle.bundle_total}
                    </p>

                    {!isBundle && <div className="d-flex justify-content-center mb-3">
                      <div className="me-3">
                        <label htmlFor={`quantity-${bundle.bundle_id}`} className="d-block mb-1 text-start">Quantity:</label>
                        <input
                          id={`quantity-${bundle.bundle_id}`}
                          type="number"
                          className="form-control form-control-sm"
                          style={{ width: "70px" }}
                          value={quantities[bundle.bundle_id] || 1}
                          onChange={(e) => handleQuantityChange(bundle.bundle_id, e.target.value)}
                          min={bundle?.products[0]?.quantity || 1}
                        />
                      </div>

                      {bundle?.products[0]?.availableSizes && bundle.products[0].availableSizes.length > 0 && (
                        <div>
                          <label htmlFor={`size-${bundle.bundle_id}`} className="d-block mb-1 text-start">Size:</label>
                          <select
                            id={`size-${bundle.bundle_id}`}
                            className="form-select form-select-sm"
                            style={{ width: "80px" }}
                            value={selectedSizes[bundle.bundle_id] || bundle.products[0].availableSizes[0]}
                            onChange={(e) => handleSizeChange(bundle, e.target.value)}
                          >
                            {bundle.products[0].availableSizes.map((size, idx) => (
                              <option key={idx} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>}

                    <button
                      className={`btn ${bundle.isAlreadyPurchased ? "btn-secondary" : "btn-outline-primary"} mt-auto`}
                      onClick={() =>
                        addToCartClick(bundle.bundle_id, isBundle ? 1 : quantities[bundle.bundle_id] || 1, bundle.student.id)
                      }
                      disabled={bundle.isAlreadyPurchased}
                    >
                      {bundle.isAlreadyPurchased ? "Already Purchased" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <h4 className="text-muted">No products found</h4>
          </div>
        )}
      </div>

      {selectedBundle && (
        <QuickViewModal
          bundle={selectedBundle}
          onClose={() => setSelectedBundle(null)}
          onAddToCart={addToCartClick}
          showAction={true}
          user={user}
          onSizeUpdate={handleBundleSizeUpdate}
        />
      )}
    </div>
  );
};

export default ProductListing;
