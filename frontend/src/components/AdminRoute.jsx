import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const AdminRoute = ({ children }) => {

  const { user } = useContext(ShopContext);

  // Not logged in
  if (!user)
    return <Navigate to="/login" />;

  // Not admin
  if (user.role !== "admin")
    return <Navigate to="/" />;

  // Admin allowed
  return children;
};

export default AdminRoute;