import { toast } from "react-toastify";
import { get, post, patch, del } from "../services/api";

export const fetchAllAdmins = async () => {
  try {
    const res = await get("/admins");
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const createAdminVendor = async ({
  name,
  email,
  phoneNumber,
  password,
  role,
}) => {
  try {
    const res = await post("/admins", {
      name,
      email,
      phoneNumber,
      password,
      role,
    });
    toast.success("User created successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateAdminVendor = async (
  { name, email, phoneNumber, password, role, imageUrl },
  id
) => {
  try {
    const res = await patch(`/admins/${id}`, {
      name,
      email,
      phoneNumber,
      password,
      role,
      imageUrl,
    });
    toast.success("Data updated successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const deleteAdminVendor = async (id) => {
  try {
    const res = await del(`/admins/${id}`);
    toast.success("User deleted successfully!", { position: "top-right" });
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const fetchAllVendors = async () => {
  try {
    const res = await get("/admins/vendors");
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};
