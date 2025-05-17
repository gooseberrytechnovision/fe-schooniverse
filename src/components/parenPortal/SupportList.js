import React, { useEffect, useState, useMemo } from "react";
import { fetchParentQueries } from "../../actions/support";
import { useSelector } from "react-redux";
import FullPageSpinner from "../layout/FullPageSpinner";

const SupportList = ({ refreshTrigger }) => {
  const { user } = useSelector((state) => state.auth);
  const [queries, setQueries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const queriesPerPage = 10;

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const response = await fetchParentQueries(user.id);
      setQueries(response);
    } catch (error) {
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [refreshTrigger]);

  const filteredQueries = useMemo(() => {
    return queries.filter(
      (query) =>
        query?.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query?.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [queries, searchTerm]);

  const totalPages = Math.ceil(filteredQueries.length / queriesPerPage);
  const displayedQueries = filteredQueries.slice(
    (currentPage - 1) * queriesPerPage,
    currentPage * queriesPerPage
  );
  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="py-4">
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
              <th>User</th>
              <th>USID</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Query Type</th>
              <th>Status</th>
              <th>Attachment</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {displayedQueries.length > 0 ? (
              displayedQueries.map((query) => (
                <tr key={query.id}>
                  <td>{query.parent_name}</td>
                  <td>{query.student_usid}</td>
                  <td>{query.student_name}</td>
                  <td>{query.student_class}</td>
                  <td>{query.student_section}</td>
                  <td className="text-capitalize">{query.query_type}</td>
                  <td className="text-capitalize">{query.status}</td>
                  <td>
                    {query?.details?.file_path && (
                      <img src={query?.details?.file_path} width={70} />
                    )}
                  </td>
                  <td>{query?.details?.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
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
    </div>
  );
};

export default SupportList;
