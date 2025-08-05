import React, { useEffect, useState, useMemo } from "react";
import FullPageSpinner from "../layout/FullPageSpinner";
import { 
  fetchAllBundles, 
  createBundle, 
  updateBundle, 
  deleteBundle 
} from "../../actions/product";
import QuickViewModal from "../parenPortal/products/QuickViewModal";
import BundleFormDialog from "../layout/BundleFormDialog";
import ConfirmModal from "../layout/ConfirmModal";
import { toast } from "react-toastify";

const BundleManagement = () => {
  const [bundles, setBundles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [showBundleForm, setShowBundleForm] = useState(false);
  const [editBundle, setEditBundle] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const response = await fetchAllBundles();
      setBundles(Array.isArray(response) ? response : []);
    } catch (error) {
      setBundles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) =>
      bundle.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bundles, searchTerm]);

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const paginatedBundles = filteredBundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const transformBundle = (bundle) => {
    return {
      bundle_id: bundle.id,
      bundle_name: bundle.name,
      gender: bundle.gender,
      image: bundle.image,
      applicable_classes: bundle.applicableClasses,
      class_name: bundle.applicableClasses.split(", ")[0],
      bundle_total: parseFloat(bundle.totalPrice),
      isIndividualProduct: bundle.isIndividualProduct,
      products: bundle.bundleProducts.map((bp) => ({
        product_id: bp.product.id,
        product_name: bp.product.name,
        unit_price: parseFloat(bp.product.unitPrice),
        quantity: bp.quantity,
        optional: bp.optional,
      })),
    };
  };

  const onView = (bundle) => {
    setSelectedBundle(transformBundle(bundle));
  };

  const addBundleClick = () => {
    setEditBundle(null);
    setShowBundleForm(true);
  };

  const onEditClick = (bundle) => {
    // Transform the bundle data to match the form structure
    const bundleData = {
      id: bundle.id,
      name: bundle.name,
      imageUrl: bundle.image,
      gender: bundle.gender,
      studentType: bundle.studentType,
      applicableClasses: bundle.applicableClasses,
      isIndividualProduct: bundle.isIndividualProduct,
      totalPrice: parseFloat(bundle.totalPrice),
      products: bundle.bundleProducts.length > 0 ? bundle.bundleProducts.map(bp => ({
        productId: bp.product.id.toString(),
        quantity: bp.quantity,
        optional: bp.optional
      })) : [{ productId: "", quantity: 1, optional: false }]
    };
    setEditBundle(bundleData);
    setShowBundleForm(true);
  };

  const onDeleteClick = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleSaveBundle = async (formData) => {
    try {
      setLoading(true);
      
      // Format bundle data for API
      const bundleData = {
        name: formData.name,
        imageUrl: formData.imageUrl,
        gender: formData.gender,
        studentType: formData.studentType,
        applicableClasses: formData.applicableClasses,
        isIndividualProduct: formData.isIndividualProduct,
        totalPrice: formData.totalPrice,
        products: formData.products.map(p => ({
          productId: parseInt(p.productId),
          quantity: parseInt(p.quantity),
          optional: p.optional
        }))
      };

      if (editBundle) {
        // Update existing bundle
        const updatedBundle = await updateBundle(editBundle.id, bundleData);
        setBundles(bundles.map(bundle => 
          bundle.id === editBundle.id ? updatedBundle : bundle
        ));
      } else {
        // Create new bundle
        const newBundle = await createBundle(bundleData);
        setBundles([newBundle, ...bundles]);
      }
      setShowBundleForm(false);
    } catch (error) {
      toast.error("Error saving bundle", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const deleteConfirmClick = async () => {
    try {
      setLoading(true);
      await deleteBundle(selectedId);
      setBundles(bundles.filter(bundle => bundle.id !== selectedId));
      toast.success("Bundle deleted successfully", { position: "top-right" });
    } catch (error) {
      toast.error("Error deleting bundle", { position: "top-right" });
    } finally {
      setShowConfirm(false);
      setLoading(false);
      setSelectedId(null);
    }
  };

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      <h2>Bundle Management</h2>
      <button
        className="btn btn-success mb-3 float-end"
        onClick={addBundleClick}
      >
        Add Bundle
      </button>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Suitable Classes</th>
            <th>Student Type</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBundles.length > 0 ? (
            paginatedBundles.map((bundle) => (
              <tr key={bundle.id}>
                <td>{bundle.id}</td>
                <td>{bundle.name}</td>
                <td>{bundle.gender}</td>
                <td>{bundle.applicableClasses}</td>
                <td>{bundle.studentType}</td>
                <td>{bundle.totalPrice}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => onView(bundle)}
                    >
                      <em className="bi bi-eye" />
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onEditClick(bundle)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteClick(bundle.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No bundles found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-primary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
      
      {selectedBundle && (
        <QuickViewModal
          bundle={selectedBundle}
          onClose={() => setSelectedBundle(null)}
          showAction={false}
        />
      )}

      {showBundleForm && (
        <BundleFormDialog
          data={editBundle}
          onSave={handleSaveBundle}
          onCancel={() => setShowBundleForm(false)}
          header={editBundle ? "Edit Bundle" : "Add Bundle"}
        />
      )}

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={deleteConfirmClick}
        message="Are you sure you want to delete this bundle?"
      />
    </div>
  );
};

export default BundleManagement;
