import React, { useEffect, useState, useMemo } from "react";
import FullPageSpinner from "../layout/FullPageSpinner";
import { Modal, Button, Form } from "react-bootstrap";
import { fetchAllQueries, updateFeedbackStatus } from "../../actions/support";

const SupportQueries = () => {
  const [queries, setQueries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const queriesPerPage = 10;

  useEffect(() => {
    const fetchQueries = async () => {
      setLoading(true);
      try {
        const response = await fetchAllQueries();
        setQueries(Array.isArray(response) ? response : []);
      } catch (error) {
        setQueries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const filteredQueries = useMemo(() => {
    return queries.filter(
      (query) =>
        query.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [queries, searchTerm]);

  const totalPages = Math.ceil(filteredQueries.length / queriesPerPage);
  const displayedQueries = filteredQueries.slice(
    (currentPage - 1) * queriesPerPage,
    currentPage * queriesPerPage
  );

  const onView = (query) => {
    setSelectedQuery(query);
    setNewStatus(query.status);
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedQuery) return;
    setLoading(true);
    try {
      await updateFeedbackStatus(selectedQuery.id, {
        ...selectedQuery,
        status: newStatus,
      });
      setQueries((prevQueries) =>
        prevQueries.map((query) =>
          query.id === selectedQuery.id
            ? { ...query, status: newStatus }
            : query
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      <h2>Support Queries</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search queries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="w-100 overflow-x-auto">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>USID</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Query Type</th>
              <th>Status</th>
              <th>Attachment</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedQueries.length > 0 ? (
              displayedQueries.map((query) => (
                <tr key={query.id}>
                  <td>{query.id}</td>
                  <td>{query.student_usid}</td>
                  <td>{query.student_name}</td>
                  <td>{query.student_class}</td>
                  <td>{query.student_section}</td>
                  <td className="text-capitalize">{query.query_type}</td>
                  <td className="text-capitalize">{query.status}</td>
                  <td>
                    {query.details?.file_path && (
                      <img src={query.details?.file_path} width={70} />
                    )}
                  </td>
                  <td>{query.details?.description}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onView(query)}
                    >
                      <em className="bi bi-eye" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No queries found.
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

      {/* Query Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Query Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuery && (
            <div>
              <p>
                <strong>Query ID:</strong> {selectedQuery.id}
              </p>
              <p>
                <strong>User:</strong> {selectedQuery.parent_name}
              </p>
              <p>
                <strong>USID:</strong> {selectedQuery.student_usid}
              </p>
              <p>
                <strong>Student Name:</strong> {selectedQuery.student_name}
              </p>
              <p>
                <strong>Class:</strong> {selectedQuery.student_class}
              </p>
              <p>
                <strong>Section:</strong> {selectedQuery.student_section}
              </p>
              <p>
                <strong>Query Type:</strong> {selectedQuery.query_type}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedQuery.details?.description}
              </p>
              {selectedQuery.details?.file_path && (
                <>
                  <p>
                    <strong>Attachment:</strong>{" "}
                    <img
                      src={selectedQuery.details?.file_path}
                      alt={selectedQuery.query_type}
                    />
                  </p>
                </>
              )}
              <hr />
              <h5>Update Status</h5>
              <Form.Select
                value={newStatus || selectedQuery?.status || "pending"}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="progress">Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
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

export default SupportQueries;
