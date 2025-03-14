import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaComments,
  FaBell,
  FaUserCircle,
  FaSearch,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext"; 
import {supabase} from "../utils/supabaseClient";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  if (!AuthContext) {
    console.error("AuthContext is not defined. Ensure it is properly imported.");
  }

  // Fetch unread notifications
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id")
        .eq("read", false)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching unread notifications:", error);
      } else {
        setUnreadCount(data.length);
      }
    };

    fetchUnreadNotifications();

    const subscription = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, fetchUnreadNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const markAllAsRead = async () => {
    if (!user) return;
    setUnreadCount(0);
    await supabase.from("notifications").update({ read: true }).eq("read", false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  const allFeatures = ["Home", "My Network", "Jobs", "Messaging", "Notifications", "Profile", "Settings"];
  const featureRoutes = {
    Home: "/",
    "My Network": "/posts",
    Jobs: "/tasks",
    Messaging: "/messages",
    Notifications: "/notifications",
    Profile: user ? `/profile/${user.id}` : "/profile",
    Settings: "/settings",
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      setSearchResults(allFeatures.filter((feature) => feature.toLowerCase().includes(query.toLowerCase())));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (feature) => {
    navigate(featureRoutes[feature]);
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="p-3 bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Left - Logo & Search */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-blue-600 text-2xl font-bold">
            QuickTask🐇
          </Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-3 py-2 border rounded-full bg-gray-100 focus:outline-none w-64"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
            {searchResults.length > 0 && (
              <div className="absolute w-full bg-white border rounded-md shadow-lg mt-1">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(result)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {result}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Navigation Icons */}
        <div className="flex space-x-10 text-gray-600 items-center">
          {[
            { name: "Home", route: "/", icon: <FaHome size={22} /> },
            { name: "Posts", route: "/posts", icon: <FaUsers size={22} /> },
            { name: "Jobs", route: "/tasks", icon: <FaBriefcase size={22} /> },
            { name: "Messages", route: "/messages", icon: <FaComments size={22} /> },
          ].map(({ name, route, icon }) => (
            <button key={name} onClick={() => navigate(route)} className="flex flex-col items-center hover:text-blue-600">
              {icon}
              <span className="text-xs">{name}</span>
            </button>
          ))}

          {/* Notifications */}
          <button
            onClick={() => {
              navigate("/notifications");
              markAllAsRead();
            }}
            className="relative flex flex-col items-center hover:text-blue-600"
          >
            <FaBell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
            <span className="text-xs">Notifications</span>
          </button>
        </div>

        {/* Right - Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex flex-col items-center hover:text-blue-600">
            <FaUserCircle size={24} />
            <span className="text-xs">Me</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden border">
              <button
                onClick={() => navigate(`/profile/${user?.id}`)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaUserCircle className="mr-2" /> Profile
              </button>
              <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
                <FaCog className="mr-2" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
