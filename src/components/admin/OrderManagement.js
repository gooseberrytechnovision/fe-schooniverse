import React, { useEffect, useState, useMemo } from "react";
import FullPageSpinner from "../layout/FullPageSpinner";
import { Modal, Button, Form } from "react-bootstrap";
import {
  fetchAllOrders,
  updateOrderStatus,
  updateTransactionStatus,
  getProductsByIds,
  getSizesInBulk
} from "../../actions/product";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const OrderManagement = ({ isVendor = false }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [productsMap, setProductsMap] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [modeOfDelivery, setModeOfDelivery] = useState(""); // New state for mode of delivery
  const barcodeInputRef = React.useRef(null);
  const itemsPerPage = 10;

  // Define mode of delivery options
  const deliveryOptions = [
    { value: "Home Delivery", label: "Home Delivery" },
    { value: "Pickup from School", label: "Pickup from School" }
  ];

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      try {
        const response = await fetchAllOrders();
        setOrders(Array.isArray(response) ? response : []);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order?.parent?.parentName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order?.id?.toString().includes(searchTerm) ||
          order?.payments[0]?.applicationCode?.toString().includes(searchTerm)
      )
      .filter((order) => {
        if (startDate && endDate) {
          const orderDate = new Date(order.createdAt);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return orderDate >= start && orderDate <= end;
        }
        return true;
      })
      .filter((order) => {
        if (statusFilter) {
          return order.status.toLowerCase() === statusFilter.toLowerCase();
        }
        return true;
      });
  }, [orders, searchTerm, startDate, endDate, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onView = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status); // Set initial status
    setBarcode(order.trackingId);
    setModeOfDelivery(order.modeOfDelivery || ""); // Set initial mode of delivery
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      if (isVendor) {
        await updateOrderStatus(selectedOrder.id, {
          status: newStatus, 
          trackingId: barcode,
          modeOfDelivery: modeOfDelivery // Include mode of delivery in update
        });
      } else {
        await updateTransactionStatus(selectedOrder.id, newStatus);
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? isVendor
              ? { 
                  ...order, 
                  status: newStatus, 
                  trackingId: barcode,
                  modeOfDelivery: modeOfDelivery 
                }
              : { ...order, transactionStatus: newStatus }
            : order
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV function - Updated to include Mode of Delivery
  // Updated exportToCSV function in OrderManagement component
// Updated exportToCSV function with proper product names, sizes, and flags
const exportToCSV = async () => {
  setLoading(true);

  try {
    // Define all headers including the new fields
    const headers = [
      "S.No",
      "USID",
      "Student Name",
      "Parent Name",
      "Gender",
      "Class",
      "Section",
      "House",
      "Phone Number",
      "Email",
      "Order ID",
      "Application Code",
      "Product Name",
      "Size",
      "Size Flag",
      "Quantity",
      "Total Price",
      "Transition Status",
      "Order Date",
      "Mode of Delivery",
      "Billing Address",
      "Shipping Address",
      "Address Flag",
    ];

    let rows = [];

    // Fetch all products and sizes first
    const productIds = [];
    const studentProductIds = {};
    
    // Collect all product IDs and student-product mappings
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.bundle && item.bundle.bundleProducts) {
          item.bundle.bundleProducts.forEach(product => {
            if (product.productId && !productIds.includes(product.productId)) {
              productIds.push(product.productId);
            }
            if (item.student?.id) {
              if (!studentProductIds[item.student.id]) {
                studentProductIds[item.student.id] = [];
              }
              studentProductIds[item.student.id].push(product.productId);
            }
          });
        }
      });
    });

    // Fetch all products and sizes in bulk
    const products = await getProductsByIds(productIds);
    const sizes = await getSizesInBulk(studentProductIds);

    // Process each order to extract all required data
    filteredOrders.forEach((order, orderIndex) => {
      order.items.forEach(item => {
        const student = item.student || {};
        const parent = order.parent || {};
        
        if (item.bundle && item.bundle.bundleProducts) {
          item.bundle.bundleProducts.forEach(bundleProduct => {
            // Get product details
            const product = products[bundleProduct.productId] || {};
            
            // Get size information
            let size = '';
            let sizeFlag = 'No';
            if (student.id && sizes[student.id] && sizes[student.id][bundleProduct.productId]) {
              size = sizes[student.id][bundleProduct.productId];
              // Check if size was customized (you'll need to implement this logic based on your data)
              // This is just an example - adjust according to your actual size customization detection
              sizeFlag = bundleProduct.size && bundleProduct.size !== product.defaultSize ? 'Yes' : 'No';
            }

            // Calculate address flag
            const billingAddress = student.address || '';
            const shippingAddress = order.shippingAddress || student.address || '';
            const addressFlag = billingAddress && shippingAddress && 
                              billingAddress === shippingAddress ? 'No' : 'Yes';

            rows.push([
              orderIndex + 1, // S.No
              student.usid || '',
              student.studentName || '',  
              parent.parentName || '',
              student.gender || '',
              student.class || '',
              student.section || '',
              student.house || '',
              order.id || '',
              order.payments[0]?.applicationCode || '',
              product.name || bundleProduct.productName || '', 
              parent.phoneNumber || '',
              parent.email || '',
              size || bundleProduct.size || '',
              sizeFlag,
              bundleProduct.quantity || '',
              order.totalPrice || '',
              isVendor ? order.status : order.transactionStatus || '',
              new Date(order.createdAt).toLocaleDateString() || '',
              order.modeOfDelivery || 'Not specified',
              billingAddress,
              shippingAddress,
              addressFlag,
            ]);
          });
        }
      });
    });

    // If no data, show warning and exit
    if (rows.length === 0) {
      toast.warning("No orders found to export");
      setLoading(false);
      return;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach(row => {
      // Escape any commas within fields
      const escapedRow = row.map(field => {
        const str = String(field || '');
        return str.includes(',') ? `"${str}"` : str;
      });

      csvContent += escapedRow.join(",") + "\n";
    });

    // Create a downloadable link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Order_Details_With_All_Fields.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting data:", error);
    toast.error("Failed to export data");
  } finally {
    setLoading(false);
  }
};

  // Updated printOrderSlip to include Mode of Delivery
  const printOrderSlip = async (order) => {
    setLoading(true);
    try {      
      const student = order.items[0]?.student || {};
      
      const productIds = [];
      const studentProductIds = {};
      
      if (student.id) {
        studentProductIds[student.id] = [];
      }
      
      order.items.forEach(item => {
        if (item.bundle && item.bundle.bundleProducts) {
          item.bundle.bundleProducts.forEach(product => {
            if (product.productId && !productIds.includes(product.productId)) {
              productIds.push(product.productId);
              
              if (student.id) {
                studentProductIds[student.id].push(product.productId);
              }
            }
          });
        }
      });
      
      // Fetch product and size data
      const products = await getProductsByIds(productIds);
      const sizes = student.id ? await getSizesInBulk(studentProductIds) : {};

      // Create a temporary container for our HTML template
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      document.body.appendChild(tempDiv);

      // Build the product rows HTML
      let productRowsHtml = '';
      const productRows = [];
      let rowCounter = 0;
      
      // Add actual product rows
      order.items.forEach(item => {
        if (item.bundle && item.bundle.bundleProducts) {
          item.bundle.bundleProducts.forEach(product => {
            const productObj = products[product.productId] || {};
            const size = student.id && sizes[student.id] ? sizes[student.id][product.productId] || '' : '';
            
            productRows.push({
              name: productObj.name || product.productName || '',
              size: size,
              quantity: product.quantity || '1'
            });
          });
        }
      });
      
      // Create rows HTML
      productRows.forEach(product => {
        productRowsHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${product.name}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${product.size}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${product.quantity}</td>
          </tr>
        `;
      });
      
      // Set the full HTML template with Mode of Delivery
      tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; font-size: 18px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
            <tr>
              <td style="padding: 8px; border: 1px solid black; width: 50%; text-align: center;">
                <strong>Student Name : ${student.studentName || ''}</strong>
              </td>
              <td style="padding: 8px; border: 1px solid black; width: 50%; text-align: center;">
                <strong>Student Id : ${student.usid || ''}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">
                <strong>Gender : ${student.gender || ''}</strong>
              </td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">
                <strong>Grade & Sec : ${student.class || ''}${student.section ? '-' + student.section : ''}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">
                <strong>House : ${student.house || ''}</strong>
              </td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">
                <strong>Order Id : ${order.id}</strong>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 8px; border: 1px solid black; text-align: center;">
                <strong>Mode of Delivery : ${order.modeOfDelivery || 'Not specified'}</strong>
              </td>
            </tr>
          </table>
          
          <table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin-top: 5px;">
            <tr style="background-color: yellow;">
              <th style="padding: 8px; border: 1px solid black; width: 60%; text-align: center;">Product</th>
              <th style="padding: 8px; border: 1px solid black; width: 20%; text-align: center;">Size</th>
              <th style="padding: 8px; border: 1px solid black; width: 20%; text-align: center;">Quantity</th>
            </tr>
            ${productRowsHtml}
          </table>
        </div>
      `;
      
      // Use html2canvas to convert our template to an image
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Create PDF with the image
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Order_Slip_${order.id}.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate order slip PDF");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      <h2>Order Management</h2>
      <div className="row">
        <div className="col-md-4 mt-4">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search by Name or Order ID or Application code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Date Filter */}
        <div className="col-md-6">
          <label>Filter by Date:</label>
          <div className="d-flex">
            <input
              type="date"
              className="form-control me-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              className="form-control ms-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-3 col-md-2">
          <label>Filter by Status:</label>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="FAILED">Failed</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </Form.Select>
        </div>
      </div>

      {/* Export Button */}
      <div className="mb-3 float-end">
        <Button variant="success" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>
      <div className="w-100 overflow-scroll">
        <table className="table table-bordered table-striped mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Application Code</th>
              <th>Parent Name</th>
              <th>Contact Number</th>
              <th>Total Price</th>
              <th>{isVendor ? "Delivery Status" : "Transaction Status"}</th>
              <th>Mode of Delivery</th> {/* New column */}
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.payments[0]?.applicationCode ?? "--"}</td>
                  <td>{order.parent?.parentName}</td>
                  <td>{order.parent?.phoneNumber}</td>
                  <td>{order.totalPrice}</td>
                  <td className="text-capitalize">{isVendor ? order.status : order.transactionStatus}</td>
                  <td>{order.modeOfDelivery || 'Not specified'}</td> {/* New column data */}
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="d-flex justify-content-center">
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => onView(order)}
                    >
                      <em className="bi bi-eye" />
                    </button>
                    <button
                      className="btn btn-info btn-sm text-white"
                      onClick={() => printOrderSlip(order)}
                      title="Print Order Slip"
                    >
                      <em className="bi bi-printer" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center"> {/* Updated colspan */}
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setBarcode("");
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p>
                <strong>Order ID:</strong> {selectedOrder.id}
              </p>
              <p>
                <strong>Total Price:</strong> {selectedOrder.totalPrice}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
              <hr />
              <h5>Parent Details</h5>
              <p>
                <strong>Name:</strong> {selectedOrder.parent.parentName}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.parent.phoneNumber}
              </p>
              <p>
                <strong>Address:</strong> {selectedOrder.parent.address}
              </p>
              <p>
                <strong>Campus:</strong> {selectedOrder.parent.campus}
              </p>
              <hr />

              {/* order items*/}
              <h5>Order Items</h5>
              <div className="w-100 overflow-scroll">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>USID</th>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.student?.usid ?? "--"}</td>
                        <td>{item.student?.studentName ?? "--"}</td>
                        <td>{item.student?.class ?? "--"}</td>
                        <td>{item.student?.section ?? "--"}</td>
                        <td>{item.bundle?.name ?? "--"}</td>
                        <td>{item.quantity ?? "--"}</td>
                        <td>{item.bundle?.totalPrice ?? "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr />

              <h5>Payment Info</h5>
              <p>
                <strong>Application Code:</strong>{" "}
                {selectedOrder.payments[0]?.applicationCode ?? "--"}
              </p>
              <p>
                <strong>Bank Reference ID:</strong>{" "}
                {selectedOrder.payments[0]?.externalReference ?? "--"}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.payments[0]?.status}
              </p>
              <p>
                <strong>Transaction Timestamp:</strong>{" "}
                {selectedOrder.payments[0]?.raw?.transaction_timestamp
                  ? new Date(
                    selectedOrder.payments[0]?.raw?.transaction_timestamp
                  ).toLocaleString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })
                  : "--"}
              </p>
              {/* Status Update */}
              <hr />
              <h5>Update Status</h5>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mb-3"
              >
                {isVendor ? (
                  <>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </>
                ) : (
                  <>
                    <option value="FAILED">Failed</option>
                    <option value="PAID">Paid</option>
                  </>
                )}
              </Form.Select>

              {/* Mode of Delivery Selector */}
              {isVendor && (
                <div className="mt-3">
                  <h5>Mode of Delivery</h5>
                  <Form.Select
                    value={modeOfDelivery}
                    onChange={(e) => setModeOfDelivery(e.target.value)}
                  >
                    <option value="">Select Delivery Mode</option>
                    {deliveryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              )}

              <div className="mt-3">
                <h5>Scan Barcode</h5>
                <div className="d-flex align-items-center mb-2">
                  {isVendor ? (
                    <>
                      <input 
                        type="text" 
                        className="form-control me-2"
                        placeholder="Scan barcode here" 
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        ref={barcodeInputRef}
                      />
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          if (barcodeInputRef.current) {
                            barcodeInputRef.current.focus();
                          }
                        }}
                      >
                        <i className="bi bi-upc-scan"></i> Scan
                      </Button>
                    </>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={barcode}
                      disabled
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagement;