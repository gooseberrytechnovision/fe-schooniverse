import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProfilePage.css";
import {
  PersonFill,
  TelephoneFill,
  GeoAltFill,
  Building,
  PencilFill,
} from "react-bootstrap-icons";
import profileImg from "../../images/profilepic.jpg";
import PopupDialog from "../layout/PopupDialog";
import { useDispatch, useSelector } from "react-redux";
import FullPageSpinner from "../layout/FullPageSpinner";
import { loadAdminUser, updateProfile } from "../../actions/auth";
import { reverseTransform, transform } from "../../services/helper";
import { ROLES, SUPORT_ATTACHMENT_URL } from "../../utils/constants";
import { Mail } from "lucide-react";
import { updateAdminVendor } from "../../actions/admin";
import axios from "axios";

const ProfilePage = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState();
  const [internalLoading, setInternalLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(
    user.imageUrl && user.imageUrl.trim() !== "" ? user.imageUrl : null
  );
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handleSave = async (updatedData) => {
    setInternalLoading(true);
    setFormData(updatedData);
    const apiBody = reverseTransform(formData);
    if (user.role === ROLES.PARENT) {
      await dispatch(updateProfile({ ...user, ...apiBody }));
    } else {
      await updateAdminVendor({ ...user, ...apiBody }, user.id);
      dispatch(loadAdminUser());
    }
    setShowPopup(false);
    setInternalLoading(false);
  };

  const openDialog = () => {
    if (!user || typeof user !== "object") return [];

    const nonEditableFields = ["role", "campus"];
    const skipKeys = [
      "id",
      "students",
      "role",
      "gender",
      "studentData",
      "password",
      "otp",
      "otpExpiresAt",
      "isOtpVerified",
      "imageUrl",
    ];

    let result = transform(user, skipKeys, nonEditableFields);
    result = [
      ...result,
      {
        label: "Password",
        value: "",
        editable: true,
        options: null,
      },
    ];
    setFormData(result);
    setShowPopup(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");
      setInternalLoading(true);
      try {
        const uploadResponse = await axios.post(
          SUPORT_ATTACHMENT_URL,
          formData
        );

        const uploadedImageUrl = uploadResponse.data.secure_url;
        setProfilePic(uploadedImageUrl);
        if (user.role === ROLES.PARENT) {
          dispatch(updateProfile({ ...user, imageUrl: uploadedImageUrl }));
        } else {
          await updateAdminVendor(
            { ...user, imageUrl: uploadedImageUrl },
            user.id
          );
          dispatch(loadAdminUser());
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (!user)
    return <div className="text-center mt-5 text-danger">User not found!</div>;

  return loading || internalLoading ? (
    <FullPageSpinner loading={loading || internalLoading} />
  ) : (
    <div className="container profile-container">
      <div className="text-center position-relative">
        <img
          src={profilePic ?? profileImg}
          alt="Profile"
          className="profile-image mx-auto"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <PencilFill
          className="edit-icon"
          onClick={triggerFileInput}
          title="Change Profile Picture"
        />
      </div>
      <hr />
      <h5 className="text-primary">Personal Details:</h5>

      <div className="profile-card">
        <div className="profile-row">
          <PersonFill className="icon" /> <strong>Full Name:</strong>{" "}
          <span>{user.parentName ?? user.name}</span>
        </div>
        <div className="profile-row">
          <TelephoneFill className="icon" /> <strong>Mobile:</strong>{" "}
          <span>{user.phoneNumber}</span>
        </div>
        {user.role === ROLES.PARENT && (
          <>
            <div className="profile-row">
              <Building className="icon" /> <strong>Campus:</strong>{" "}
              <span>{user.campus}</span>
            </div>
            <div className="profile-row">
              <GeoAltFill className="icon" /> <strong>Address:</strong>{" "}
              <span>{user.address}</span>
            </div>
          </>
        )}
        {(user.role === ROLES.ADMIN || user.role === ROLES.VENDOR) && (
          <>
            <div className="profile-row">
              <Mail className="icon" /> <strong>Email:</strong>{" "}
              <span>{user.email}</span>
            </div>
          </>
        )}
      </div>

      <div className="text-center mt-4 mx-auto">
        <button
          className="btn btn-primary update-btn w-100"
          onClick={openDialog}
        >
          Update
        </button>
      </div>
      {showPopup && (
        <PopupDialog
          data={formData}
          onSave={handleSave}
          onCancel={() => setShowPopup(false)}
          header={"Edit Profile"}
        />
      )}
    </div>
  );
};

export default ProfilePage;
