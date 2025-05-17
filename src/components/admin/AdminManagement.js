import React, { useEffect, useState, useMemo } from "react";
import FullPageSpinner from "../layout/FullPageSpinner";
import PopupDialog from "../layout/PopupDialog";
import ConfirmModal from "../layout/ConfirmModal";
import {
  fetchAllAdmins,
  createAdminVendor,
  updateAdminVendor,
  deleteAdminVendor,
  fetchAllVendors,
} from "../../actions/admin";
import { reverseTransform, transform } from "../../services/helper";
import { toast } from "react-toastify";
import { ROLES } from "../../utils/constants";

const AdminManagement = ({ vendor }) => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const getAdmins = async () => {
      setLoading(true);
      try {
        const response = await fetchAllAdmins();
        if (response.success) {
          setAdmins(Array.isArray(response?.admins) ? response?.admins : []);
        } else {
          setAdmins([]);
        }
      } catch (error) {
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    const getVendors = async () => {
      setLoading(true);
      try {
        const response = await fetchAllVendors();
        if (response.success) {
          setAdmins(Array.isArray(response?.vendors) ? response?.vendors : []);
        } else {
          setAdmins([]);
        }
      } catch (error) {
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
    if (vendor) {
      getVendors();
    } else {
      getAdmins();
    }
  }, [vendor]);

  const onEditAdminClick = (admin) => {
    setSelectedId(admin.id);
    let dropdownData = [];
    if (vendor) {
      dropdownData = [
        {
          role: [{ key: "vendor", label: "Vendor" }],
        },
      ];
    } else {
      dropdownData = [
        {
          role: [
            { key: "admin", label: "Admin" },
            { key: "vendor", label: "Vendor" },
          ],
        },
      ];
    }
    let result = transform(
      admin,
      ["id", "password", "createdAt", "updatedAt", "imageUrl"],
      [],
      dropdownData
    );
    result = [
      ...result,
      {
        label: "Password",
        value: "",
        editable: true,
        options: null,
      },
    ];
    setSelectedRow(result);
    setShowPopup(true);
  };

  const onDeleteAdminClick = (id, role) => {
    let deletionAllowed = true;
    if (role === ROLES.ADMIN) {
      const checkAdminsOnly = admins.filter(
        (admin) => admin.role === ROLES.ADMIN
      );
      deletionAllowed = checkAdminsOnly.length > 1;
    }

    if (deletionAllowed) {
      setSelectedId(id);
      setShowConfirm(true);
    } else {
      toast.error("At least one admin should be present!", {
        position: "top-right",
      });
    }
  };

  const deleteConfirmClick = async () => {
    setLoading(true);
    await deleteAdminVendor(selectedId);
    setShowConfirm(false);
    setLoading(false);
    setAdmins(admins.filter((admin) => admin.id !== selectedId));
  };

  const handleSave = async (updatedData) => {
    setSelectedRow({ ...selectedRow, updatedData });
    setLoading(true);
    const apiBody = reverseTransform(updatedData);
    if (selectedId) {
      await updateAdminVendor(apiBody, selectedId);
      const response = await fetchAllAdmins();
      setAdmins(Array.isArray(response.admins) ? response.admins : []);
    } else {
      const newAdmin = await createAdminVendor(apiBody);
      setAdmins([...admins, newAdmin]);
    }
    setShowPopup(false);
    setLoading(false);
  };

  const addAdmin = () => {
    let dropdownData = [];
    if (vendor) {
      dropdownData = [
        {
          key: "vendor",
          label: "Vendor",
        },
      ];
    } else {
      dropdownData = [
        {
          key: "admin",
          label: "Admin",
        },
        {
          key: "vendor",
          label: "Vendor",
        },
      ];
    }
    const data = [
      {
        label: "Name",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "Email",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "Password",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "Role",
        value: "",
        editable: true,
        options: dropdownData,
      },
      {
        label: "Phone Number",
        value: "",
        editable: true,
        options: null,
      },
    ];
    setSelectedId(null);
    setSelectedRow(data);
    setShowPopup(true);
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) =>
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      <h2>Member Management</h2>
      <button
        className="btn btn-success mb-3 float-end"
        onClick={() => {
          addAdmin();
        }}
      >
        Add Member
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
            <th>Name</th>
            <th>Email</th>
            <th>Contact Number</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAdmins.length > 0 ? (
            paginatedAdmins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.phoneNumber}</td>
                <td className="text-capitalize">{admin.role}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => onEditAdminClick(admin)}
                    >
                      <em className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteAdminClick(admin.id, admin.role)}
                    >
                      <em className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No member found.
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
          header={selectedId ? "Edit Member" : "Add Member"}
        />
      )}

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={deleteConfirmClick}
        message="Are you sure you want to delete this member?"
      />
    </div>
  );
};

export default AdminManagement;
