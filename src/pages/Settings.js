import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  // Expanded state management
  const [darkMode, setDarkMode] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState("english");
  const [fontSize, setFontSize] = useState("medium");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const navigate = useNavigate();
  const { user, updateUserPreferences } = useAuth();

  // Load user preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setDarkMode(preferences.darkMode ?? false);
      setProfileVisibility(preferences.profileVisibility ?? "public");
      setEmailNotifications(preferences.emailNotifications ?? true);
      setPushNotifications(preferences.pushNotifications ?? true);
      setLanguage(preferences.language ?? "english");
      setFontSize(preferences.fontSize ?? "medium");
    }
  }, []);

  // Track changes to mark as unsaved
  useEffect(() => {
    setUnsavedChanges(true);
  }, [darkMode, profileVisibility, emailNotifications, pushNotifications, language, fontSize]);

  // Save all settings
  const saveSettings = () => {
    const preferences = {
      darkMode,
      profileVisibility,
      emailNotifications,
      pushNotifications,
      language,
      fontSize
    };
    
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    
    if (updateUserPreferences) {
      updateUserPreferences(preferences);
    }
    
    setUnsavedChanges(false);
    setLastSaved(new Date().toLocaleTimeString());
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setDarkMode(false);
    setProfileVisibility("public");
    setEmailNotifications(true);
    setPushNotifications(true);
    setLanguage("english");
    setFontSize("medium");
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} p-6 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold">Settings</h1>
          <div className="flex gap-2">
            {unsavedChanges && (
              <span className="text-orange-500 text-sm mt-1">Unsaved changes</span>
            )}
            <button 
              onClick={resetToDefaults}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Reset
            </button>
            <button 
              onClick={saveSettings}
              disabled={!unsavedChanges}
              className={`px-4 py-2 ${unsavedChanges ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300"} text-white rounded-lg`}
            >
              Save Changes
            </button>
          </div>
        </div>
        <p className="mt-2 text-lg">Manage your account preferences.</p>
        {lastSaved && <p className="text-sm text-gray-500">Last saved: {lastSaved}</p>}

        {/* Account Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">Account Preferences</h2>
          <div className="flex gap-4 mt-3">
            <button 
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => navigate("/security")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
            >
              Security Settings
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">Privacy Settings</h2>
          <label className="block mt-3">
            <span className="text-lg font-bold">Profile Visibility</span>
            <select 
              value={profileVisibility} 
              onChange={(e) => setProfileVisibility(e.target.value)}
              className="mt-2 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="public">Public</option>
              <option value="connections">Connections Only</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label className="flex items-center justify-between mt-4">
            <span className="text-lg font-bold">Activity Status</span>
            <input 
              type="checkbox" 
              checked={true}
              onChange={() => {}}
              className="w-5 h-5"
            />
          </label>
        </div>

        {/* Notification Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <label className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold">Email Notifications</span>
            <input 
              type="checkbox" 
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold">Push Notifications</span>
            <input 
              type="checkbox" 
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
              className="w-5 h-5"
            />
          </label>
        </div>

        {/* Appearance */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">Appearance</h2>
          <label className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold">Dark Mode</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg transition ${darkMode ? "bg-yellow-400 text-black" : "bg-gray-700 text-white"}`}
            >
              {darkMode ? "Disable" : "Enable"}
            </button>
          </label>
          
          <label className="block mt-4">
            <span className="text-lg font-bold">Font Size</span>
            <select 
              value={fontSize} 
              onChange={(e) => setFontSize(e.target.value)}
              className="mt-2 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
        </div>

        {/* Language Settings */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">Language</h2>
          <label className="block mt-3">
            <span className="text-lg font-bold">Display Language</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-2 block w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
            </select>
          </label>
        </div>

        {/* Data Management */}
        <div className="mt-6 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">Data Management</h2>
          <div className="mt-3 space-y-2">
            <button className="text-blue-600 hover:underline">Download Your Data</button>
            <div className="block">
              <button className="text-red-600 hover:underline">Delete Account</button>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;