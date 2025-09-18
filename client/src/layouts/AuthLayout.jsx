import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export const AuthLayout = () => {
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");
  useEffect(() => {
    if (access_token) {
      return navigate("/", { replace: true });
    }
  }, []);
  return (
    <>
      <Outlet />
    </>
  );
};
