import React, { useEffect, useState, useMemo } from "react";
import FullPageSpinner from "../layout/FullPageSpinner";
import { Modal, Button, Form } from "react-bootstrap";
import { fetchAllOrders, updateOrderStatus, updateTransactionStatus } from "../../actions/product";

const OrderManagement = ({isVendor = false}) => {
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
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      if (isVendor) {
        await updateOrderStatus(selectedOrder.id, newStatus);
      } else {
        await updateTransactionStatus(selectedOrder.id, newStatus);
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? isVendor
              ? { ...order, status: newStatus }
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
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Application code",
      "Parent Name",
      "Contact Number",
      "Total Price",
      "Status",
      "Order Date",
      "Student",
      "Class",
      "Section",
      "Item Name",
      "Item Quantity",
      "Item Price",
    ];

    const rows = filteredOrders.flatMap((order) => {
      // Iterate through the items of each order and flatten the data
      return order.items.map((item) => [
        order.id,
        order?.payments[0]?.applicationCode ?? "--",
        order.parent?.parentName,
        order.parent?.phoneNumber,
        order.totalPrice,
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
        item.student?.studentName,
        item.student?.class,
        item.student?.section,
        item.bundle?.name,
        item.quantity,
        item.bundle?.totalPrice,
      ]);
    });

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    // Create a downloadable link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_orders.csv");
    document.body.appendChild(link);
    link.click();
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
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onView(order)}
                    >
                      <em className="bi bi-eye" />
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
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
