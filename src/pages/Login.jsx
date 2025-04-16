import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "react-hot-toast";
import "./custom.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";

export const Login = () => {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      dispatch(signInFailure("Please enter all fields!"));
      return toast.error("Please enter all fields!");
    }
    if(formData.email.split('@')[1] !== process.env.REACT_APP_ALLOWED_EMAIL_DOMAIN) {
      dispatch(signInFailure("Please enter a valid college email address!"));
      return toast.error(`Please enter a email address ending with ${process.env.REACT_APP_ALLOWED_EMAIL_DOMAIN}`);
    }

    formData.email = formData.email.toLowerCase();
    
    try {
      dispatch(signInStart());
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(signInFailure(data.message));
        return toast.error(data.message);
      }
      if(res.ok) {
        dispatch(signInSuccess(data.data.user));
        toast.success(data.message);
        navigate("/");
      }
    } catch (err) {
      dispatch(signInFailure("Something went wrong, please try again."));
      return toast.error("Something went wrong, please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen px-10">

      <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Login</h2>
        </div>
        <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input onChange={handleChange} id="email" placeholder="1234567890@mitwpu.edu.in" />
          </div>
          <div>
            <Input onChange={handleChange} id="password" placeholder="password" type="password" />
          </div>
          <div>
            <Button type='submit' className="w-full bg-[#bd1e59] text-white" disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Login'}
            </Button>
          </div>
        </form>
        <div>
          <h1 className="text-gray-700 text-center my-3 text-sm">OR</h1>
          <OAuth />
        </div>
        <p className="mt-6 text-xs text-gray-700 text-center">
          Forgot Password? <Link to='/password-reset' className="text-blue-600 hover:underline cursor-pointer">Click here</Link>
        </p>
        <p className="mt-6 text-xs text-gray-500">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
        <div className='relative flex justify-center text-sm pt-5'>
          <span className="px-2 bg-white text-gray-500">Don't Have an account?</span>
          <Link to='/signup' className='text-blue-500'>
            Sign Up here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
