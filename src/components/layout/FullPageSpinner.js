import React from "react";
import { Loader } from "lucide-react";
import "./FullPageSpinner.css"; // Ensure you create a CSS file for styling

const FullPageSpinner = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="spinner-overlay">
      <Loader className="spinner-icon" size={50} />
    </div>
  );
};

export default FullPageSpinner;
