import { Navigate, Outlet, } from "react-router";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";


export const MainLayout = () => {
  
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
   return <Navigate to="/login" />;
  }
  
  
  return (
      <>
        <Navbar />
        <Outlet />
        <Footer />
      </>
    );
};
