import { useNavigate } from "react-router";
import { AuthForm } from "../components/AuthForm"
import { showError, successRegister } from "../helpers/alert"
import http from "../helpers/http"



export const RegisterPage = () => {
  const navigate = useNavigate();
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
