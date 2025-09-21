import { useNavigate } from "react-router"
import { AuthForm } from "../components/AuthForm"
import http from "../helpers/http"
import { showError, successLogin } from "../helpers/alert";


export const LoginPage = () => {
  const navigate = useNavigate();
  const handleSubmit = async (data) => {
    try {
      const response = await http({
        method: 'post',
        url: '/login',
        data
      })
      const { access_token, user_data } = response.data
      console.log(response);
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user_data', JSON.stringify(user_data))
      successLogin()
      navigate('/')
    } catch (error) {
      showError(error)
    }
  }
  return (
    <>
      <AuthForm type="login" handleSubmit={handleSubmit} navigate={navigate} />
    </>
  )
}
