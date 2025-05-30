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
  const [barcode, setBarcode] = useState("");
  const barcodeInputRef = React.useRef(null);
  const itemsPerPage = 10;

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
        if (!statusFilter) return true;
        
        const orderStatus = isVendor 
          ? order?.status?.toLowerCase() 
          : order?.transactionStatus?.toLowerCase();
        
        return orderStatus === statusFilter.toLowerCase();
      });
  }, [orders, searchTerm, startDate, endDate, statusFilter, isVendor]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onView = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status); // Set initial status
    setBarcode(order.trackingId || "");
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      if (isVendor) {
        await updateOrderStatus(selectedOrder.id, {status: newStatus, trackingId: barcode});
      } else {
        await updateTransactionStatus(selectedOrder.id, newStatus);
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? isVendor
              ? { ...order, status: newStatus, trackingId: barcode }
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

  // Export to CSV function
  const exportToCSV = async () => {
    setLoading(true);

    try {
      const headers = [
        "S.No",
        "USID",
        "Student Name",
        "Parent Name",
        "Gender",
        "Class",
        "Section",
        "House",
        "Order ID",
        "Application Code",
        "Product Name",
        "Size",
        "Flag for Sizes(Yes for Values entered)",
        "Product Quantity",
        "Bundle Quantity",
        "Total Price",
        "Transaction Status",
        "Order Date",
        "Mode of Delivery",
        "Billing Address",
        "Shipping Address",
        "Flag for Address"
      ];

      let rows = [];

      const productIds = [];
      const studentProductIds = {};
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.bundle && item.bundle.bundleProducts) {
            item.bundle.bundleProducts.forEach(product => {
              if (product.optional === false) {
                if (product.productId && !productIds.includes(product.productId)) {
                  productIds.push(product.productId);
                }
                if (item?.student?.id) {
                  studentProductIds[item.student.id]?.length ? studentProductIds[item.student.id].push(product.productId) : studentProductIds[item.student.id] = [product.productId];
                }
              }
            });
          }
        });
      });

      // If no products, exit early
      if (productIds.length === 0) {
        toast.warning("No products found to export");
        setLoading(false);
        return;
      }
      // Fetch all products by IDs
      const products = await getProductsByIds(productIds);
      const sizes = await getSizesInBulk(studentProductIds);
      let counter = 1;
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          const student = item.student || {};

          if (item.bundle && item.bundle.bundleProducts) {
            item.bundle.bundleProducts.forEach(bundleProduct => {
              if (bundleProduct.optional === false) {
                const product = products[bundleProduct.productId] || {};

                // Get the size from sizes data if available
                let size;
                if (sizes[student.id] && sizes[student.id][bundleProduct.productId]) {
                  size = sizes[student.id][bundleProduct.productId];
                }

                rows.push([
                  counter++,
                  student.usid ? `="${student.usid}"` : '',
                  student.studentName || '',
                  order.parent?.parentName || '',
                  student.gender || '',
                  student.class || '',
                  student.section || '',
                  student.house || '',
                  order.id || '',
                  order.payments.filter(payment => payment.status === "PAID")[0]?.applicationCode || '',
                  product.name || '',
                  size?.size || '',
                  size && size?.createdAt && new Date(size?.createdAt) > new Date('2025-05-26T23:59:59.999Z') ? 'Yes' : 'No',
                  bundleProduct.quantity || '',
                  item.quantity || '',
                  order.totalPrice || '',
                  order.transactionStatus || '',
                  new Date(order.updatedAt).toLocaleDateString() || '',
                  order.shippingMethod || '',
                  student?.address || '',
                  order?.deliveryAddress || '',
                  order?.isAddressEdited ? 'Yes' : 'No'
                ]);
              }
            });
          }
        });
      });

      // Convert data to CSV content
      let csvContent = headers.join(",") + "\n";
      rows.forEach(row => {
        // Escape any commas within fields
        const escapedRow = row.map(field => {
          const str = String(field || '');
          return str.includes(',') ? `"${str}"` : str;
        });

        csvContent += escapedRow.join(",") + "\n";
      });

      // Use Blob API instead of data URI for better handling of large files
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Order_Details.csv");
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };


  const printOrderSlip = async (order) => {
    setLoading(true);
    try {
      const allProductIds = [];
      const studentProductMap = {};
      
      order.items.forEach(item => {
        if (item.bundle && item.bundle.bundleProducts) {
          item.bundle.bundleProducts.forEach(product => {
            if (product.productId) {
              if(!allProductIds.includes(product.productId)) allProductIds.push(product.productId);
              if(studentProductMap[item?.student?.id]?.length){
                studentProductMap[item.student.id].push(product.productId);
              } else{
                studentProductMap[item.student.id] = [product.productId];
              }
            }
          });
        }
      });
      
      // Fetch all products and sizes at once
      const products = await getProductsByIds(allProductIds);
      const sizes = await getSizesInBulk(studentProductMap);
      
      // Create a new PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Generate a page for each item (student)
      for (let itemIndex = 0; itemIndex < order.items.length; itemIndex++) {
        const item = order.items[itemIndex];
        const student = item.student || {};
        
        // Add a new page for each item after the first one
        if (itemIndex > 0) {
          pdf.addPage();
        }
        
        // Create temporary container for HTML template
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.width = '210mm'; // A4 width
        document.body.appendChild(tempDiv);
        
        // Build product rows for this specific item/student
        let productRowsHtml = '';
        const productRows = [];
        
        if (item.bundle && item.bundle.bundleProducts) {
          item.bundle.bundleProducts.forEach(product => {
            // Skip optional products
            if (product.optional === true) return;
            
            const productObj = products[product.productId] || {};
            const size = student.id && sizes[student.id] ? 
              sizes[student.id][product.productId]?.size || '' : '';
            
            productRows.push({
              name: productObj.name || product.productName || '',
              size: size,
              quantity: product.quantity || '1'
            });
          });
        }
        
        // Create rows HTML for this item
        productRows.forEach(product => {
          productRowsHtml += `
            <tr>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${product.name}</td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${product.size}</td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${product.quantity}</td>
            </tr>
          `;
        });
        
      // Set the full HTML template
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
                <td style="padding: 8px; border: 1px solid black; text-align: center;">
                  <strong>Bundle Quantity : ${item.quantity || '1'}</strong>
                </td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">
                  <strong>Mode of Delivery : ${order.shippingMethod || 'School'}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">
                  <strong>Billing Address : ${student.address || ''}, ${order?.parent?.phoneNumber || ''}</strong>
                </td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">
                  <strong>Delivery Address : ${order.deliveryAddress ? `${order.deliveryAddress}, ${order?.parent?.phoneNumber || ''}` : '-'}</strong>
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
        
        try {
          // Convert HTML to canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
          });
          
          // Add canvas to the PDF on the current page
          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        } finally {
          // Clean up the temporary div
          document.body.removeChild(tempDiv);
        }
      }
      
      // Save the multi-page PDF
      pdf.save(`Order_Slip_${order.id}.pdf`);
      
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
              <th>Order Date</th>
              <th>Mode of Delivery</th>
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
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.shippingMethod || '-'}</td>
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
                <td colSpan="6" className="text-center">
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
