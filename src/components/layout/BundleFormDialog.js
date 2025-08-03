import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Minus } from "lucide-react";
import { fetchAllProducts } from "../../actions/product";
import { classList, studentTypeList } from "../../utils/constants";
import Select from 'react-select';

const BundleFormDialog = ({ data, onSave, onCancel, header }) => {

  const [formData, setFormData] = useState(() => {
    if (data) {
      return { 
        ...data,
        applicableClassesArray: data.applicableClasses ? data.applicableClasses.split(", ").map(cls => {
          const classItem = classList.find(c => c.label === cls);
          return classItem ? { value: classItem.key, label: classItem.label } : null;
        }).filter(Boolean) : []
      };
    }

    return {
      name: "",
      imageUrl: "",
      gender: "",
      studentType: "",
      applicableClasses: "",
      applicableClassesArray: [],
      totalPrice: 0,
      isIndividualProduct: false,
      products: [{ productId: "", quantity: 1, optional: false }]
    };
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const genderList = [
    { key: "Boy", label: "Boy" },
    { key: "Girl", label: "Girl" },
  ];
  
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await fetchAllProducts();
        setProducts(Array.isArray(response) ? response : []);
      } catch (error) {
        setProducts([]);
        toast.error("Failed to load products", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOptions, actionMeta) => {
    if (actionMeta.name === "applicableClassesArray") {
      const selectedClasses = selectedOptions || [];
      const classesString = selectedClasses.map(option => option.label).join(", ");
      
      setFormData({ 
        ...formData,
        applicableClassesArray: selectedClasses,
        applicableClasses: classesString
      });
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    
    // If changing product ID, check for duplicates
    if (field === "productId" && value) {
      const isDuplicate = updatedProducts.some((p, i) => 
        i !== index && p.productId === value
      );
      
      if (isDuplicate) {
        const duplicateProduct = products.find(p => p.id === parseInt(value));
        toast.error(`Product "${duplicateProduct.name}" is already selected`, { position: "top-right" });
        return;
      }
    }
    
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    
    // Auto-calculate total price when product changes
    const totalPrice = calculateTotalPrice(updatedProducts);

    setFormData({
      ...formData,
      products: updatedProducts,
      totalPrice
    });
  };

  const calculateTotalPrice = (bundleProducts) => {
    return bundleProducts.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.productId));
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const addProductField = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { productId: "", quantity: 1, optional: false }]
    });
  };

  const removeProductField = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    const totalPrice = calculateTotalPrice(updatedProducts);
    
    setFormData({
      ...formData,
      products: updatedProducts,
      totalPrice
    });
  };

  const toggleOptional = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { 
      ...updatedProducts[index], 
      optional: !updatedProducts[index].optional 
    };
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  const checkDuplicateProducts = () => {
    const productIds = formData.products
      .filter(p => p.productId) // Filter out empty selections
      .map(p => p.productId);
    
    const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      const duplicateProduct = products.find(p => p.id === parseInt(duplicates[0]));
      if (duplicateProduct) {
        toast.error(`Product "${duplicateProduct.name}" is selected multiple times`, { position: "top-right" });
      } else {
        toast.error("Same product is selected multiple times", { position: "top-right" });
      }
      return true;
    }
    
    return false;
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.imageUrl &&
      formData.gender &&
      formData.studentType &&
      formData.applicableClasses &&
      formData.products.length > 0 &&
      formData.products.every(p => p.productId && p.quantity > 0) &&
      typeof formData.isIndividualProduct === 'boolean'
    );
  };

  const handleFormSubmit = () => {
    if (checkDuplicateProducts()) {
      return;
    }
    
    const preparedData = {
      ...formData,
    };
    
    onSave(preparedData);
  };

  const classOptions = classList.map(cls => ({ value: cls.key, label: cls.label }));

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header justify-content-between">
            <h5 className="modal-title">
              {header || "Bundle Form"}
            </h5>
            <button
              type="button"
              className="close"
              onClick={onCancel}
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center">Loading products...</div>
            ) : (
              <form>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Bundle Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter bundle name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Image URL *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="Enter image URL"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        {genderList.map(option => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Student Type *</label>
                      <select
                        className="form-control"
                        name="studentType"
                        value={formData.studentType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Student Type</option>
                        {studentTypeList.map(option => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Applicable Classes *</label>
                      <Select
                        isMulti
                        name="applicableClassesArray"
                        value={formData.applicableClassesArray}
                        options={classOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleSelectChange}
                        placeholder="Select classes"
                      />
                      <input 
                        type="hidden" 
                        name="applicableClasses" 
                        value={formData.applicableClasses} 
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="font-weight-bold">Total Price</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`₹${formData.totalPrice.toFixed(2)}`}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-8">
                    <div className="form-group mt-2 d-flex align-items-center">
                      <label className="font-weight-bold d-block mb-1 me-2">Is Individual Product</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isIndividualProduct"
                          name="isIndividualProduct"
                          checked={formData.isIndividualProduct || false}
                          onChange={(e) => {
                            // If switching to individual product, set all products as non-optional
                            let updatedProducts = [...formData.products];
                            if (e.target.checked) {
                              updatedProducts = [
                                {
                                  ...updatedProducts[0],
                                  optional: false
                                }
                              ];
                            }
                            
                            setFormData({
                              ...formData,
                              isIndividualProduct: e.target.checked,
                              products: updatedProducts
                            });
                          }}
                        />
                        <label className="form-check-label" htmlFor="isIndividualProduct">
                          {formData.isIndividualProduct ? "Yes" : "No"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12">
                    <h5>Bundle Products</h5>
                    <p className="text-muted small">Add products to this bundle</p>
                  </div>
                </div>
                
                <div className="row mb-2 fw-bold border-bottom pb-2">
                  <div className="col-md-5">Product</div>
                  <div className="col-md-2">{formData.isIndividualProduct ? "MOQ" : "Quantity"}</div>
                  <div className="col-md-3">Optional</div>
                  <div className="col-md-2">Actions</div>
                </div>
                
                {formData.products.map((product, index) => (
                  <div className="row mb-2 align-items-center" key={index}>
                    <div className="col-md-5">
                      <select
                        className="form-control"
                        value={product.productId}
                        onChange={(e) => 
                          handleProductChange(index, "productId", e.target.value)
                        }
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ₹{p.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <input
                        type="number"
                        className="form-control"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={product.optional}
                          onChange={() => toggleOptional(index)}
                          disabled={formData.isIndividualProduct}
                          id={`optional-${index}`}
                        />
                        <label className="form-check-label" htmlFor={`optional-${index}`}>
                          Optional
                        </label>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger me-1"
                        onClick={() => removeProductField(index)}
                        disabled={formData.products.length === 1 || formData.isIndividualProduct}
                      >
                        <Minus size={16} />
                      </button>
                      {index === formData.products.length - 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={addProductField}
                          disabled={formData.isIndividualProduct}
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </form>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-danger" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFormSubmit}
              disabled={!isFormValid() || loading}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleFormDialog; 