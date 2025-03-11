import React, { useState } from 'react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-purple-100 text-gray-900"} p-6`}>
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold">Settings</h1>
        <p className="mt-4 text-lg">Manage your account preferences.</p>

        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
          <label className="flex items-center justify-between">
            <span className="text-lg font-bold">Dark Mode</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg transition ${darkMode ? "bg-yellow-400 text-black" : "bg-gray-700 text-white"}`}
            >
              {darkMode ? "Disable" : "Enable"}
            </button>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
