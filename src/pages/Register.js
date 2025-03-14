import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (error) throw error;

      setUser(data.user);
      localStorage.setItem('token', data.session?.access_token || '');

      navigate('/');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7eb] flex flex-col justify-center">
      {/* Main Container */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Section (Form + Heading) */}
        <div className="w-full md:w-1/2 p-8">
          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            Your #1 job site for <span className="text-yellow-600">$100K+ jobs</span>
          </h1>
          <p className="mt-2 text-gray-600">Gain Access, Get Noticed, Get Hired.</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mt-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-yellow-300"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-yellow-300"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-yellow-300"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-yellow-300"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md font-semibold text-white ${
                loading ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Access'}
            </button>
          </form>

          {/* Social Sign-up Buttons */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <button
              onClick={() => console.log('Google Sign-in')} // Replace with actual function
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">🔒</span> Google
            </button>
            <button
              onClick={() => console.log('Apple Sign-in')} // Replace with actual function
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">🍎</span> Apple
            </button>
          </div>

          {/* Already a member */}
          <p className="mt-4 text-center text-sm text-gray-700">
            Already a member?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Right Section (Image) */}
        <div className="hidden md:block md:w-1/2">
          <img src={HERO_IMAGE_URL} alt="Hero" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Register;
