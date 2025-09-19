import { useNavigate } from "react-router";
import { AuthForm } from "../components/AuthForm"
import { showError, successRegister } from "../helpers/alert"
import http from "../helpers/http"
import { useEffect } from "react";

export const RegisterPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Additional safety check - redirect if already authenticated
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (data) => {
    try {
      await http({
        method: 'post',
        url: '/register',
        data
      })
      successRegister()
      navigate('/login')
    } catch (error) {
      showError(error)
    }
  }
  
  return (
    <>
      <AuthForm type="register" handleSubmit={handleSubmit} navigate={navigate} />
    </>
  )
}
