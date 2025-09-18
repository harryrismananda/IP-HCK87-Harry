import { useEffect, useState } from "react";
import http from "../helpers/http";
import { showError, successLogin } from "../helpers/alert";


export const AuthForm = (props) => {
  
  const { type, handleSubmit, navigate } = props;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const handleCredentialResponse = async (response) => {
      try {
        const {data} = await http({
          method: 'POST',
          url: '/google-login',
          data: {
            googleToken: response.credential
          }
        })
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user_data));
        successLogin()
        navigate('/')
      } catch (error) {
        // console.log(error);
        showError(error)
      }
    }

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-button"),
        { theme: "outline", size: "large" }
      );
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-6 sm:p-8">
            {/* Logo/Brand Section with Welcome Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
                BiblioLex
              </h1>
              <h2 className="text-lg sm:text-xl font-semibold text-base-content mb-2">
                {type === "login" ? "Welcome Back!" : "Join Us Today"}
              </h2>
              <p className="text-base-content/60 text-sm">
                {type === "login" 
                  ? "Continue your AI-powered learning journey" 
                  : "Start your AI-powered language learning adventure"
                }
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(formData)
            }} className="space-y-4">
              {type === "register" && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    className="input input-bordered w-full focus:input-primary"
                    required
                    onChange={handleChange}
                    value={formData.fullName}
                  />
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full focus:input-primary"
                  required
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full focus:input-primary"
                  required
                  onChange={handleChange}
                  value={formData.password}
                />
                {type === "login" && (
                  <label className="label">
                    <span className="label-text-alt">
                      <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-6 text-white font-medium"
              >
                {type === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* OAuth Section */}
            <div className="divider my-6">OR</div>
            <div className="flex justify-center" id="google-button"></div>
            {/* <button className="btn btn-outline w-full gap-2 hover:bg-base-50" id="google-button">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-base-content">Continue with Google</span>
            </button> */}

            {/* Switch Form Type */}
            <div className="text-center mt-6">
              <p className="text-base-content/60 text-sm">
                {type === "login" 
                  ? "Don't have an account? " 
                  : "Already have an account? "
                }
                <a 
                  href={type === "login" ? "/register" : "/login"} 
                  className="link link-primary font-medium"
                >
                  {type === "login" ? "Sign up" : "Sign in"}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-base-content/40 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
