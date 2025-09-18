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
export const showSuccess = (message = 'Operation completed successfully.') => {
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
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

export const successEnrollment = (languageName) => {
  Swal.fire({
    icon: 'success',
    title: 'Enrollment Successful!',
    text: `Welcome to your ${languageName} learning journey. You can now access all courses for this language.`,
    confirmButtonText: 'Start Learning'
  })
}

export const successProfilePicture = (message) => {
  Swal.fire({
    icon: 'success',
    title: 'Profile Picture Updated!',
    text: message || 'Your profile picture has been updated successfully.',
    timer: 2000,
    showConfirmButton: false
  })
}