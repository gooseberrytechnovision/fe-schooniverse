import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { submitSupportQuery } from "../../actions/support";
import { toast } from "react-toastify";
import axios from "axios";
import SupportList from "./SupportList";
import FullPageSpinner from "../layout/FullPageSpinner";
import { SUPORT_ATTACHMENT_URL } from "../../utils/constants";

const SupportForm = () => {
  const { user } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
    parentName: user.parentName,
    studentId: "",
    queryType: "",
    description: "",
    file_path: "",
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];

      if (selectedFile.size > 2 * 1024 * 1024) {
        setMessage("File size should not exceed 2MB.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setMessage("");
    },
  });

  const uploadToServer = async () => {
    if (!file) {
      setMessage("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    setUploading(true);

    try {
      const uploadResponse = await axios.post(SUPORT_ATTACHMENT_URL, formData);

      const uploadedImageUrl = uploadResponse.data.secure_url; // Get image URL
      if (uploadedImageUrl) {
        setFormData((prev) => ({ ...prev, file_path: uploadedImageUrl }));
      }
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeUploaded = () => {
    setFile(null);
    setMessage("");
    setFormData({ ...formData, file_path: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await submitSupportQuery(formData, user);

    if (response) {
      toast.success("Query submitted successfully!", { position: "top-right" });
      setRefreshKey((prevKey) => prevKey + 1);
    }
    setLoading(false);
    setFormData({
      parentName: user.parentName,
      studentId: "",
      queryType: "",
      description: "",
      file_path: "",
    });
    setFile(null);
  };

  return loading ? (
    <FullPageSpinner loading={loading} />
  ) : (
    <div className="container my-5">
      <h3 className="text-primary">Submit Query</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Parent Name</label>
          <input
            type="text"
            className="form-control"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Student USID</label>
          <input
            type="text"
            className="form-control"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Query Type</label>
          <select
            className="form-select"
            name="queryType"
            value={formData.queryType}
            onChange={handleChange}
            required
          >
            <option value="">Select Query Type</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="financial">Financial</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">
            Upload File (JPG, PNG, PDF, max 2MB)
          </label>
          <div className="row mx-0">
            <div
              {...getRootProps()}
              className="dropzone border rounded p-3 text-center d-flex align-items-center justify-content-center col-md-12"
              style={{
                border: "2px dashed #007bff",
                background: "#f8f9fa",
                cursor: "pointer",
                minHeight: "120px",
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-center">
                  <p className="mb-1 text-success">
                    <strong>{file.name}</strong>
                  </p>
                  <small className="text-muted">
                    {(file.size / 1024).toFixed(2)} KB
                  </small>
                </div>
              ) : (
                <p className="text-muted">
                  📂 Drag & drop a file here, or{" "}
                  <span className="text-primary">click to select</span>
                </p>
              )}
            </div>
            {file && (
              <div className="mt-2 d-flex gap-2 ps-0 align-items-center flex-nowrap">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={uploadToServer}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeUploaded()}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {uploading && (
            <p className="text-warning mt-2">
              ⏳ Uploading file, please wait...
            </p>
          )}
          {message && (
            <p
              className={`mt-2 ${
                formData.file_path ? "d-none" : "text-danger"
              }`}
            >
              {message}
            </p>
          )}
          {formData.file_path && (
            <p className="text-success">✅ File uploaded successfully!</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className={`btn btn-success`}
            disabled={uploading}
          >
            Submit Query
          </button>
        </div>
      </form>

      <SupportList key={refreshKey} />
    </div>
  );
};

export default SupportForm;
