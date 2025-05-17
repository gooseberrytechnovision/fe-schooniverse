import { toast } from "react-toastify";
import { get, post, put } from "../services/api";

export const submitSupportQuery = async (formData, user) => {
  try {
    const postBody = {
      description: formData.description,
      student_usid: formData.studentId,
      query_type: formData.queryType,
      parent_name: formData.parentName,
      file_path: formData.file_path,
      parent_id: user.id,
    };
    const res = await post("/feedback", postBody);
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const fetchParentQueries = async (parentId) => {
  try {
    const res = await get(`/feedback/parent/${parentId}`);
    return res.data;
  } catch (error) {
    toast.error(
      error.message || "Something went wrong. Please try again later.",
      { position: "top-right" }
    );
    return error;
  }
};

export const fetchAllQueries = async () => {
  try {
    const res = await get("/feedback");
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};

export const updateFeedbackStatus = async (id, body) => {
  try {
    const res = await put(`/feedback/${id}`, body);
    return res.data;
  } catch (error) {
    toast.error(error.message, { position: "top-right" });
    return error;
  }
};
