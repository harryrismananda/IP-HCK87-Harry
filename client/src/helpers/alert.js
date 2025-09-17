import Swal from 'sweetalert2'

export const showError = (err) => {
  console.log(err);
  let message = 'Something went wrong!'
  if (err.response.data.message) {
    message = err.response.data.message
  }
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
  })
} 
export const showSuccess = () => {

  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: 'Operation completed successfully.',
  })
} 

export const successLogin = () => {
  Swal.fire({
    icon: 'success',
    title: 'Login Successful',
    text: 'You have successfully logged in.',
  })
}

export const successRegister = () => {
  Swal.fire({
    icon: 'success',
    title: 'Registration Successful',
    text: 'You have successfully registered. Please login.',
  })
}