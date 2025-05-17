import React, { useEffect, useState, useMemo } from "react";
import FullPageSpinner from "../layout/FullPageSpinner";
import { 
  fetchAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../../actions/product";
import PopupDialog from "../layout/PopupDialog";
import ConfirmModal from "../layout/ConfirmModal";
import { toast } from "react-toastify";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchAllProducts();
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProductClick = () => {
    const data = [
      {
        label: "Name",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "Price",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "Image URL",
        value: "",
        editable: true,
        options: null,
      },
    ];
    setSelectedId(null);
    setSelectedRow(data);
    setShowPopup(true);
  };

  const onEditProductClick = (product) => {
    const data = [
      {
        label: "Name",
        value: product.name || "",
        editable: true,
        options: null,
      },
      {
        label: "Price",
        value: product.price?.toString() || "",
        editable: true,
        options: null,
      },
      {
        label: "Image URL",
        value: product.imageUrl || "",
        editable: true,
        options: null,
      },
    ];
    setSelectedId(product.id);
    setSelectedRow(data);
    setShowPopup(true);
  };

  const onDeleteClick = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const deleteConfirmClick = async () => {
    setLoading(true);
    try {
      await deleteProduct(selectedId);
      setProducts(products.filter(product => product.id !== selectedId));
    } catch (error) {
      toast.error("Failed to delete product", { position: "top-right" });
    } finally {
      setShowConfirm(false);
      setLoading(false);
      setSelectedId(null);
    }
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      const productData = {
        name: formData[0].value,
        price: parseFloat(formData[1].value),
        imageUrl: formData[2].value,
      };

      if (selectedId) {
        // Update existing product
        const updatedProduct = await updateProduct(selectedId, productData);
        setProducts(products.map(product => 
          product.id === selectedId ? updatedProduct : product
        ));
      } else {
        // Create new product
        const newProduct = await createProduct(productData);
        setProducts([newProduct, ...products]);
      }
    } catch (error) {
      toast.error("Error saving product", { position: "top-right" });
    } finally {
      setShowPopup(false);
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      <h2>Product Management</h2>
      <button
        className="btn btn-success mb-3 float-end"
        onClick={addProductClick}
      >
        Add Product
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
            <th>Unit Price</th>
            <th>Image</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>
                  {product.imageUrl && (
                    <img src={product.imageUrl} width={90} alt={product.name} />
                  )}
                </td>
                <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onEditProductClick(product)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteClick(product.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No products found.
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

      {showPopup && (
        <PopupDialog
          data={selectedRow}
          onSave={handleSave}
          onCancel={() => setShowPopup(false)}
          header={selectedId ? "Edit Product" : "Add Product"}
        />
      )}
      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={deleteConfirmClick}
        message="Are you sure you want to delete this product?"
      />
    </div>
  );
};

export default ProductManagement;
