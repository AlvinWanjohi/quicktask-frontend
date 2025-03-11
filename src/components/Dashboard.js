import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Corrected import
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, handleLogout } = useAuth(); // Using the useAuth hook to get user and logout function
  const navigate = useNavigate(); // useNavigate hook for redirecting to login page

  useEffect(() => {
    if (!user) {
      // Redirect to login page if the user is not authenticated
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Welcome, {user?.name || "User"}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/tasks" className="bg-blue-500 text-white p-4 rounded-lg shadow">
          Browse Tasks
        </Link>
        <Link to="/mytasks" className="bg-green-500 text-white p-4 rounded-lg shadow">
          My Posted Tasks
        </Link>
        <Link to="/mybids" className="bg-yellow-500 text-white p-4 rounded-lg shadow">
          My Bids
        </Link>
      </div>
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2 rounded-lg">
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;