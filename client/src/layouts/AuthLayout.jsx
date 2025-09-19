
import { Outlet,  Navigate } from "react-router";

export const AuthLayout = () => {

  
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    return <Navigate to="/"  />
  }
  

  return (
    <>
      <Outlet />
    </>
  );
};