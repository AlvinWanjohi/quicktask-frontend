import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        navigate('/');
      }
    };
    checkUserSession();
  }, [setUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username, 
        password,
      });

      if (error) throw error;

      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error(err);
    }
  };

  
  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }, 
      });

      if (error) throw error;
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Try again.`);
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Blue Section with Floating UI Elements */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex-col justify-center items-center p-12">
        <h2 className="text-3xl font-bold">Find Your Dream Job</h2>
        <p className="mt-2 text-lg text-center">We bring you Dream Job to You</p>
        <img
          src="/assets/job-ui-mockup.png"
          alt="Job search UI"
          className="mt-6 w-3/4 shadow-lg"
        />
      </div>

      {/* Right Side - White Login Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 md:px-24">
        <h2 className="text-2xl font-bold mb-6">Login to QuickTask</h2>
        <p className="text-sm text-gray-600 mb-4">
          You can sign in with your credentials or use a provider below.
        </p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 w-full text-center">
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="flex space-x-4 w-full mb-6">
          <button 
            className="w-1/2 bg-gray-800 text-white py-2 rounded flex items-center justify-center"
            onClick={() => handleOAuthLogin('apple')}
          >
            <i className="fab fa-apple mr-2"></i> With Apple
          </button>
          <button 
            className="w-1/2 bg-red-500 text-white py-2 rounded flex items-center justify-center"
            onClick={() => handleOAuthLogin('google')}
          >
            <i className="fab fa-google mr-2"></i> With Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium">
              Username/Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between w-full">
            <label className="inline-flex items-center">
              <input type="checkbox" className="mr-2" /> Remember Me
            </label>
            <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
