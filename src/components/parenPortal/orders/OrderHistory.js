import React, { useEffect, useState } from "react";
import { fetchOrdersParent } from "../../../actions/product";
import { useSelector } from "react-redux";
import FullPageSpinner from "../../layout/FullPageSpinner";
import { downloadPaymentReceipt } from "../../../utils/pdfGenerator";
import { toast } from "react-toastify";

const OrderHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("Latest");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  useEffect(() => {
    const getLinkedOrders = async () => {
      setLoading(true);
      try {
        if (user) {
          const response = await fetchOrdersParent(user.id);
          if (response.success) {
            setOrders(response.orders);
          }
        } else {
          setOrders([]);
        }
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    getLinkedOrders();
  }, []);

  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    const sortedOrders = [...orders].sort((a, b) => {
      return order === "Latest"
        ? new Date(b.date.split("-").reverse().join("-")) -
            new Date(a.date.split("-").reverse().join("-"))
        : new Date(a.date.split("-").reverse().join("-")) -
            new Date(b.date.split("-").reverse().join("-"));
    });
    setOrders(sortedOrders);
  };

  const handleDownloadReceipt = async (orderId) => {
    try {
      setDownloadingIds(prev => new Set([...prev, orderId]));
      await downloadPaymentReceipt(orderId);
      toast.success("Receipt downloaded successfully!", { position: "top-right" });
    } catch (error) {
      toast.error("Failed to download receipt. Please try again.", { position: "top-right" });
      console.error("Download error:", error);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getBundleNames = (order) => {
    const items = order?.items;
    let bundleName = "";
    if (items?.length) {
      bundleName = items.map((item) => item.bundle?.name).join(", ");
    }
    return bundleName;
  };

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container mt-4 pb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-primary fw-bold">Order History</h5>
        <div className="d-flex">
          {/* Sorting Dropdown */}
          <select
            className="form-select me-2"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="Latest">Latest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Order Table */}
      <table className="table table-bordered text-center">
        <thead className="table-light">
          <tr>
            <th>Order ID</th>
            <th>Items</th>
            <th>Transaction Status</th>
            <th>Delivery Status</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Purchase Date</th>
            <th>Tracking ID</th>
            <th>Payment Receipt</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.slice(0, itemsPerPage).map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{getBundleNames(order)}</td>
                <td>{order.transactionStatus}</td>
                <td>{order.status}</td>
                <td>{order.items?.length}</td>
                <td>{order.totalPrice}</td>
                <td>{order.createdAt?.split("T")[0]}</td>
                <td>
                  <a href={`https://www.dtdc.in/trace.asp`}>{order.trackingId}</a>
                </td>
                <td>
                  {order.transactionStatus === "PAID" ? (
                    <button
                      onClick={() => handleDownloadReceipt(order.id)}
                      disabled={downloadingIds.has(order.id)}
                      className="btn btn-primary btn-sm"
                    >
                      {downloadingIds.has(order.id) ? (
                        <>
                          <i className="bi bi-download me-1"></i>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-1"></i>
                          Download
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center text-muted fw-bold">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Dropdown */}
      <div className="row">
        <div className="col-md-12">
          <div className="d-flex w-25 float-end mt-2">
            <select
              className="form-select"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5 Products Per Page</option>
              <option value={10}>10 Products Per Page</option>
              <option value={20}>20 Products Per Page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
