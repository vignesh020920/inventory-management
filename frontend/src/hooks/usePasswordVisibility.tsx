import { useState } from "react";

// Custom hook for password visibility
const usePasswordVisibility = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleCurrentPassword = () =>
    setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return {
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    toggleCurrentPassword,
    toggleNewPassword,
    toggleConfirmPassword,
  };
};

export default usePasswordVisibility;
