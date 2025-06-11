import React, { useEffect, useState, useMemo } from "react";
import {
  createStudent,
  deleteStudent,
  fetchALLStudent,
  updateStudentDetail,
  bulkCreateStudents,
  getParentByStudentUsid,
} from "../../actions/student";
import FullPageSpinner from "../layout/FullPageSpinner";
import PopupDialog from "../layout/PopupDialog";
import ParentEditDialog from "../layout/parentEditDialog";
import { reverseTransform, transform } from "../../services/helper";
import ConfirmModal from "../layout/ConfirmModal";
import { toast } from "react-toastify";
import {
  boardingStatusList,
  campusList,
  classList,
  genderList,
  houseList,
  sectionList,
  studentTypeList,
} from "../../utils/constants";
import { utils, read, write } from "xlsx";
import { updateParent } from "../../actions/auth";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [selectedId, setSelectedId] = useState();
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    show: false,
    success: 0,
    failed: 0,
    errors: []
  });

  useEffect(() => {
    const getStudents = async () => {
      setLoading(true);
      try {
        const response = await fetchALLStudent();

        if (Array.isArray(response) && response.length > 0) {
          setStudents(response);
        } else {
          setStudents([]);
        }
      } catch (error) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    getStudents();
  }, []);

  const admissionYears = Array.from({ length: 11 }, (_, i) => {
    const year1 = 2015 + i;
    const year2 = year1 + 1;
    return { key: `${year1}-${year2}`, label: `${year1}-${year2}` };
  });

  const addStudentClick = () => {
    const dropdownData = {
      boardingStatus: boardingStatusList,
      gender: genderList,
      studentType: studentTypeList,
      house: houseList,
      class: classList,
      section: sectionList,
      campus: campusList,
    };

    const data = [
      {
        label: "USID",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "Student Name",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "Student Type",
        value: "",
        editable: true,
        options: dropdownData.studentType,
      },
      {
        label: "Admission Year",
        value: "",
        editable: true,
        options: admissionYears,
      },
      {
        label: "Boarding Status",
        value: "",
        editable: true,
        options: dropdownData.boardingStatus,
      },
      {
        label: "Gender",
        value: "",
        editable: true,
        options: dropdownData.gender,
      },
      {
        label: "Campus",
        value: "",
        editable: true,
        options: dropdownData.campus,
      },
      {
        label: "Class",
        value: "",
        editable: true,
        options: dropdownData.class,
      },
      {
        label: "Section",
        value: "",
        editable: true,
        options: dropdownData.section,
      },
      {
        label: "Address",
        value: "",
        editable: true,
        options: null,
      },
      {
        label: "House",
        value: "",
        editable: true,
        options: dropdownData.house,
      },
      {
        label: "Phone Number",
        value: "",
        editable: true,
        options: null,
        maxLength: 11,
      },
      {
        label: "Parent Name",
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
    ];
    setSelectedId(null);
    setSelectedRow(data);
    setShowPopup(true);
  };

  const onDeleteClick = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const deleteConfirmClick = async () => {
    setLoading(true);
    await deleteStudent(selectedId);
    setShowConfirm(false);
    setLoading(false);
    setStudents(students.filter((student) => student.id !== selectedId));
    setSelectedId(null);
  };

  const onEditStudentClick = (data) => {
    const nonEditableFields = ["usid"];
    const skipKeys = ["id"];
    const dropdownData = [
      {
        boardingStatus: boardingStatusList,
      },
      {
        gender: genderList,
      },
      {
        studentType: studentTypeList,
      },
      { admissionYear: admissionYears },
      { house: houseList },
      { class: classList },
      { section: sectionList },
      { campus: campusList },
    ];
    setSelectedId(data.usid);
    const result = transform(data, skipKeys, nonEditableFields, dropdownData);
    setSelectedRow(result);
    setShowPopup(true);
  };

  const onEditParentClick = async (data) => {
    try {
      setLoading(true);
      const parentInfo = await getParentByStudentUsid(data.usid);
      setLoading(false);
      const nonEditableFields = ["usid", "parentName", "parentId", "role"];
      const skipKeys = ["id"];

      setSelectedId(-1);

      const studentData = {
        parentId: parentInfo.id.toString(),
        parentName: parentInfo.parentName,
        phoneNumber: parentInfo.phoneNumber,
        email: parentInfo.email,
        password: '',
        role: parentInfo.role,
      };

      const result = transform(studentData, skipKeys, nonEditableFields);
      setSelectedRow(result);
      setShowPopup(true);
    } catch (error) {
      console.error("Error in edit student process:", error);
      toast.error("Failed to load student information", { position: "top-right" });
    }
  };

  const handleSave = async (updatedData) => {
    try {
      setLoading(true);
      setSelectedRow(updatedData);
      const apiBody = reverseTransform(selectedRow);
      if (selectedId) {
        const response = await updateStudentDetail(apiBody, selectedId);
        if (response.success) {
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student.id === response.student.id ? response.student : student
            )
          );
        }
      } else {
        const newStudent = await createStudent(apiBody);
        if (newStudent.results[0].success) {
          setStudents([newStudent.results[0].student, ...students]);
        } else {
          toast.error("Error creating student", { position: "top-right" });
        }
      }
    } catch (error) {
      setSelectedId(null);
    } finally {
      setSelectedRow({});
      setShowPopup(false);
      setLoading(false);
    }
  };

  const handleParentSave = async (updatedData) => {
    try {
      setLoading(true);
      const apiBody = reverseTransform(updatedData);
        const parentId = apiBody.parentId;
        if (!parentId) {
          toast.error("Parent ID not found", { position: "top-right" });
          return;
        }
        
        const parentData = {
          id: Number(parentId),
          parentName: apiBody.parentName,
          phoneNumber: apiBody.phoneNumber,
          email: apiBody.email,
          role: apiBody.role || 'parent'
        };
        
        // Only include password if it was changed
        if (apiBody.password && apiBody.password.trim() !== '') {
          parentData.password = apiBody.password;
        }
        
        await updateParent(parentData);
    } catch (error) {
      setSelectedId(null);
    } finally {
      setSelectedRow({});
      setShowPopup(false);
      setLoading(false);
    }
  };

  // ✅ Correcting the filter function
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const nameMatch = student.studentName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const usidMatch = student.usid
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return nameMatch || usidMatch;
    });
  }, [students, searchTerm]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const downloadCSVTemplate = () => {
    // Make sure these headers match exactly with the fields processed in handleBulkUpload
    const headers = [
      "USID",
      "Student Name",
      "Student Type",
      "Admission Year",
      "Boarding Status",
      "Gender",
      "Campus",
      "Class",
      "Section",
      "Address",
      "House",
      "Phone Number",
      "Parent Name",
      "Email",
    ];

    // Create workbook and main sheet
    const wb = utils.book_new();
    const mainSheet = utils.aoa_to_sheet([headers]);
    utils.book_append_sheet(wb, mainSheet, "Student Template");

    // Add reference sheets for dropdown values
    const dropdownData = {
      "Student Type": studentTypeList.map(item => [item.key]),
      "Boarding Status": boardingStatusList.map(item => [item.key]),
      "Gender": genderList.map(item => [item.key]),
      "Campus": campusList.map(item => [item.key]),
      "Class": classList.map(item => [item.key]),
      "Section": sectionList.map(item => [item.key]),
      "House": houseList.map(item => [item.key]),
      "Admission Year": admissionYears.map(item => [item.key]),
    };

    // Generate worksheet for instructions
    const instructionsData = [
      ["Instructions for filling the template:"],
      ["1. Do not modify the headers or sheet structure"],
      ["2. Fill in all required fields for each student"],
      ["3. Refer to the reference sheets for valid dropdown values"],
      ["4. Save the file as Excel (.xlsx) format before uploading"],
      [""],
      ["Required Fields:"],
      ["- USID (must be unique)"],
      ["- Student Name"],
      ["- Class"],
      ["- Section"],
      [""],
      ["For dropdown fields, use only values from the reference sheets"],
    ];
    const instructionsSheet = utils.aoa_to_sheet(instructionsData);
    utils.book_append_sheet(wb, instructionsSheet, "Instructions");

    // Add each dropdown list as a separate sheet
    Object.entries(dropdownData).forEach(([sheetName, values]) => {
      const sheet = utils.aoa_to_sheet(values);
      utils.book_append_sheet(wb, sheet, `${sheetName} Values`);
    });

    // Generate binary and download
    const wbout = write(wb, { bookType: "xlsx", type: "binary" });

    // Convert to blob and create download link
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }

    const blob = new Blob([buf], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_upload_template.xlsx";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });

        // Get the first sheet which contains student data
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const studentsData = utils.sheet_to_json(worksheet);

        // Check if data is valid
        if (!studentsData.length) {
          toast.error("No student data found in file");
          setLoading(false);
          return;
        }

        // Validation setup
        const mandatoryFields = ["USID", "Student Name", "Class", "Section"];
        const errors = [];
        const validStudents = [];
        let hasErrors = false;

        // Helper function to check if value exists in dropdown options
        const isValidDropdownValue = (key, value) => {
          if (!value) return true; // Empty values are handled by mandatory field check

          const dropdownMappings = {
            "Student Type": studentTypeList,
            "Boarding Status": boardingStatusList,
            "Gender": genderList,
            "Campus": campusList,
            "Class": classList,
            "Section": sectionList,
            "House": houseList,
            "Admission Year": admissionYears,
          };

          if (!dropdownMappings[key]) return true;
          return dropdownMappings[key].some(item => item.key === value);
        };

        // Validate each student record
        studentsData.forEach((studentData, index) => {
          const rowNum = index + 2; // +2 because of header row and 0-indexing
          const rowErrors = [];

          // Check mandatory fields
          mandatoryFields.forEach(field => {
            if (!studentData[field] || studentData[field].toString().trim() === '') {
              rowErrors.push(`Missing mandatory field "${field}"`);
            }
          });

          // Check dropdown values
          Object.entries(studentData).forEach(([key, value]) => {
            if (
              ["Student Type", "Boarding Status", "Gender", "Campus",
                "Class", "Section", "House", "Admission Year"].includes(key) &&
              value &&
              !isValidDropdownValue(key, value)
            ) {
              rowErrors.push(`Invalid value "${value}" for "${key}"`);
            }
          });

          if (rowErrors.length > 0) {
            hasErrors = true;
            errors.push(`Row ${rowNum}: ${rowErrors.join(", ")}`);
          } else {
            // Transform data to match API format
            const apiStudentData = {
              usid: studentData['USID']?.toString()?.replace(/['"]/g, '') || '',
              studentName: studentData['Student Name'] || '',
              studentType: studentData['Student Type'] || '',
              admissionYear: studentData['Admission Year'] || '',
              boardingStatus: studentData['Boarding Status'] || '',
              gender: studentData['Gender'] || '',
              campus: studentData['Campus'] || '',
              class: studentData['Class'] || '',
              section: studentData['Section'] || '',
              address: studentData['Address'] || '',
              house: studentData['House'] || '',
              phoneNumber: studentData['Phone Number'] || '',
              parentName: studentData['Parent Name'] || '',
              email: studentData['Email'] || '',
            };
            validStudents.push(apiStudentData);
          }
        });

        // If there are validation errors, show them and stop
        if (hasErrors) {
          setUploadStatus({
            show: true,
            success: 0,
            failed: studentsData.length,
            errors
          });
          setLoading(false);
          return;
        }

        // If validation passes, proceed with bulk upload
        try {
          const bulkData = {
            students: validStudents
          };

          const response = await bulkCreateStudents(bulkData);

          // Extract detailed errors from response
          const apiErrors = [];
          if (response.results && Array.isArray(response.results)) {
            response.results.forEach((result, index) => {
              if (!result.success) {
                // Find the corresponding student data
                const studentData = validStudents[index];
                const studentId = studentData?.usid || `Row ${index + 1}`;
                apiErrors.push(`${studentId}: ${result.error}`);
              }
            });
          }

          // Always refresh student list after operation (even if some failed)
          if (response.created > 0) {
            const updatedStudents = await fetchALLStudent();
            if (Array.isArray(updatedStudents) && updatedStudents.length > 0) {
              setStudents(updatedStudents);
            }
          }

          // Show all errors, including API errors
          setUploadStatus({
            show: true,
            success: response.created || 0,
            failed: response.failed || 0,
            errors: apiErrors.length > 0 ? apiErrors : [response?.message || "Bulk upload failed"]
          });
        } catch (error) {
          // API error
          setUploadStatus({
            show: true,
            success: 0,
            failed: validStudents.length,
            errors: [error.message || "Error during bulk upload"]
          });
        }

        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error(`Error uploading file: ${error.message}`);
      setLoading(false);
    }

    // Clear the file input
    event.target.value = null;
  };

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container py-4">
      <h2>Student Management</h2>
      <div className="d-flex gap-2 mb-3 justify-content-end">
        <input
          type="file"
          id="bulkUpload"
          className="d-none"
          accept=".xlsx, .xls"
          onChange={handleBulkUpload}
        />
        <button
          className="btn btn-secondary"
          onClick={() => document.getElementById('bulkUpload').click()}
        >
          Bulk Upload
        </button>
        <button
          className="btn btn-primary"
          onClick={downloadCSVTemplate}
        >
          Download Template
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            addStudentClick();
          }}
        >
          Add Student
        </button>
      </div>

      {uploadStatus.show && (
        <div className={`alert ${uploadStatus.failed > 0 ? 'alert-warning' : 'alert-success'} mt-3`}>
          <h5>Upload Results</h5>
          <p>Successfully added: {uploadStatus.success} students</p>
          {uploadStatus.failed > 0 && (
            <>
              <p>Failed to add: {uploadStatus.failed} students</p>
              <div className="mt-2">
                <p><strong>Errors:</strong></p>
                <ul className="error-list" style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {uploadStatus.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <button
            className="btn btn-sm btn-secondary mt-2"
            onClick={() => setUploadStatus({ ...uploadStatus, show: false })}
          >
            Dismiss
          </button>
        </div>
      )}

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="w-100 overflow-x-auto">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>USID</th>
              <th>Name</th>
              <th>Grade</th>
              <th>Section</th>
              <th>House</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <tr key={student.usid}>
                  <td>{student.usid}</td>
                  <td>{student.studentName}</td>
                  <td>{student.class}</td>
                  <td>{student.section}</td>
                  <td>{student.house}</td>
                  <td>{student.gender}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onEditStudentClick(student)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onEditParentClick(student)}
                      >
                        <i className="bi bi-people"></i>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeleteClick(student.id)}
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
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Controls */}
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
        selectedId === -1 ? (
          <ParentEditDialog
            data={selectedRow}
            onSave={handleParentSave}
            onCancel={() => setShowPopup(false)}
            header={"Edit Parent Information"}
          />
        ) : (
          <PopupDialog
            data={selectedRow}
            onSave={handleSave}
            onCancel={() => setShowPopup(false)}
            header={selectedId ? "Edit Student" : "Add Student"}
          />
        )
      )}
      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={deleteConfirmClick}
        message="Are you sure you want to delete this student?"
      />
    </div>
  );
};

export default StudentManagement;
