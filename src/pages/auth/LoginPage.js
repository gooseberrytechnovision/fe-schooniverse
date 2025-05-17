import React from "react";
import ParentLogin from "../../components/auth/ParentLogin";

const LoginPage = () => {
  const handleLoginSuccess = () => {
    // Redirect to dashboard or home page after login
  };

  return (
    <div>
      <ParentLogin onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
