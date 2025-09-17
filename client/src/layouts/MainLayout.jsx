import { Outlet, useNavigate } from "react-router";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useEffect } from "react";

export const MainLayout = () => {
  const navigate = useNavigate();
  const access_token = localStorage.getItem("access_token");
  useEffect(() => {
    if (!access_token) {
      return navigate("/login", { replace: true });
    }
  }, [access_token, navigate]);
  return (
      <>
        <Navbar />
        <Outlet />
        <Footer />
      </>
    );
};
