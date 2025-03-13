import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { Search, Bell, Calendar, UserPlus, CheckCircle } from "lucide-react";

const Posts = () => {
  // State management
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user profile
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        const userId = userData.user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        setUserProfile(profile);
        
        // Parallel data fetching
        const [
          connectionRequestsResponse,
          suggestedUsersResponse,
          followedGroupsResponse,
          userGroupsResponse,
          upcomingEventsResponse,
          newslettersResponse,
          availableTasksResponse,
          notificationsResponse
        ] = await Promise.all([
          supabase.from("connection_requests").select("*").eq("recipient_id", userId),
          supabase.from("users").select("*").neq("id", userId).limit(5),
          supabase.from("groups").select("*"),
          supabase.from("group_members").select("group_id").eq("user_id", userId),
          supabase.from("events").select("*").gte("date", new Date().toISOString()),
          supabase.from("newsletters").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("tasks").select("*").eq("status", "open"),
          supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10)
        ]);

        setRequests(connectionRequestsResponse.data || []);
        setSuggestions(suggestedUsersResponse.data || []);
        setGroups(followedGroupsResponse.data || []);
        setJoinedGroups(userGroupsResponse.data?.map((g) => g.group_id) || []);
        setEvents(upcomingEventsResponse.data || []);
        setNewsletters(newslettersResponse.data || []);
        setTasks(availableTasksResponse.data || []);
        setNotifications(notificationsResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Handle connection request actions
  const handleConnectionRequest = async (requestId, action) => {
    try {
      if (action === "accept") {
        await supabase.from("connections").insert([
          { user_id: userProfile.id, connected_user_id: requests.find(r => r.id === requestId).sender_id }
        ]);
      }
      
      await supabase.from("connection_requests").delete().eq("id", requestId);
      setRequests(prev => prev.filter(request => request.id !== requestId));
      
      if (action === "accept") {
        await supabase.from("notifications").insert([{
          user_id: requests.find(r => r.id === requestId).sender_id,
          type: "connection_accepted",
          content: `${userProfile.name} accepted your connection request`,
          read: false
        }]);
      }
    } catch (err) {
      console.error(`Error ${action} request:`, err);
      alert(`Failed to ${action} request. Please try again.`);
    }
  };

  // Handle applying for a task
  const handleApplyForTask = async (taskId) => {
    try {
      const { error } = await supabase.from("task_applications").insert([{ 
        task_id: taskId,
        user_id: userProfile.id,
        status: "pending",
        applied_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      alert("You have successfully applied for this task!");
      
      // Notify task creator
      const { data: taskData } = await supabase
        .from("tasks")
        .select("created_by, title")
        .eq("id", taskId)
        .single();
        
      if (taskData) {
        await supabase.from("notifications").insert([{
          user_id: taskData.created_by,
          type: "task_application",
          content: `${userProfile.name} applied for your task: ${taskData.title}`,
          read: false
        }]);
      }
    } catch (error) {
      console.error("Error applying for task:", error);
      alert("Error applying for the task. Please try again.");
    }
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId) => {
    try {
      const { error } = await supabase.from("group_members").insert([{
        group_id: groupId,
        user_id: userProfile.id,
        joined_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      setJoinedGroups(prev => [...prev, groupId]);
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join group. Please try again.");
    }
  };

  // Handle RSVPing to an event
  const handleRSVP = async (eventId) => {
    try {
      const { error } = await supabase.from("event_attendees").insert([{
        event_id: eventId,
        user_id: userProfile.id,
        status: "attending",
        rsvp_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      alert("You've successfully RSVP'd to this event!");
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      alert("Failed to RSVP. Please try again.");
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userProfile.id)
        .eq("read", false);
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Filter content based on search query
  const getFilteredContent = (items) => {
    return items.filter(item => 
      Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const filteredTasks = getFilteredContent(tasks);
  const filteredGroups = getFilteredContent(groups);
  const filteredEvents = getFilteredContent(events);
  const filteredSuggestions = getFilteredContent(suggestions);
  const filteredNewsletters = getFilteredContent(newsletters);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with search bar and notifications */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Social Platform</h1>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
                onClick={markAllNotificationsAsRead}
              >
                <Bell size={24} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User profile */}
            {userProfile && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-2">
                  {userProfile.name.charAt(0)}
                </div>
                <span className="font-medium">{userProfile.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto py-6 px-4">
        {/* Tab navigation */}
        <div className="flex border-b mb-6">
          <button 
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium ${activeTab === "all" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab("connections")}
            className={`px-4 py-2 font-medium ${activeTab === "connections" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          >
            Connections
          </button>
          <button 
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 font-medium ${activeTab === "tasks" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          >
            Tasks
          </button>
          <button 
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 font-medium ${activeTab === "groups" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          >
            Groups
          </button>
          <button 
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 font-medium ${activeTab === "events" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          >
            Events
          </button>
        </div>

        {/* Content grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main feed (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Button */}
            <div className="bg-white shadow-lg rounded-lg p-4">
              <button 
                onClick={() => navigate("/create-post")}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
              >
                <span className="mr-2">Create New Post</span>
              </button>
            </div>

            {/* Notifications panel */}
            {notifications.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Recent Notifications</h2>
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <ul className="divide-y">
                  {notifications.slice(0, 3).map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`py-3 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <p className="text-sm">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Connection Requests */}
            {(activeTab === "all" || activeTab === "connections") && requests.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <UserPlus size={20} className="mr-2 text-blue-500" />
                  Connection Requests
                </h2>
                <ul className="space-y-3">
                  {requests.map((request) => (
                    <li key={request.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold mr-3">
                            {request.sender_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-medium">{request.sender_name || "Unknown User"}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleConnectionRequest(request.id, "accept")}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleConnectionRequest(request.id, "decline")}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 transition"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Available Tasks */}
            {(activeTab === "all" || activeTab === "tasks") && filteredTasks.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <CheckCircle size={20} className="mr-2 text-blue-500" />
                  Available Tasks
                </h2>
                <ul className="space-y-3">
                  {filteredTasks.map((task) => (
                    <li key={task.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold text-lg">{task.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          {task.deadline && (
                            <p className="text-sm text-red-500 mt-1">
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleApplyForTask(task.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition h-10"
                        >
                          Apply
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upcoming Events */}
            {(activeTab === "all" || activeTab === "events") && filteredEvents.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Calendar size={20} className="mr-2 text-blue-500" />
                  Upcoming Events
                </h2>
                <ul className="space-y-3">
                  {filteredEvents.map((event) => (
                    <li key={event.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="md:flex justify-between">
                        <div>
                          <p className="font-semibold text-lg">{event.name}</p>
                          <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Date: {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRSVP(event.id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-3 md:mt-0"
                        >
                          RSVP
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Newsletters */}
            {(activeTab === "all" || activeTab === "newsletters") && filteredNewsletters.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4">Latest Newsletters</h2>
                <ul className="space-y-3">
                  {filteredNewsletters.map((newsletter) => (
                    <li key={newsletter.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                      <h3 className="font-semibold text-lg">{newsletter.title}</h3>
                      <p className="text-gray-700 line-clamp-3">{newsletter.content}</p>
                      <a 
                        href={newsletter.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline text-sm font-medium mt-2 inline-block"
                      >
                        Read Full Newsletter →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar (1/3 width on desktop) */}
          <div className="space-y-6">
            {/* User Profile Summary */}
            {userProfile && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {userProfile.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold mt-2">{userProfile.name}</h2>
                  <p className="text-gray-600">{userProfile.title || "Member"}</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition"
                >
                  View Profile
                </button>
              </div>
            )}

            {/* Suggested Users */}
            {filteredSuggestions.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4">People You May Know</h2>
                <ul className="space-y-3">
                  {filteredSuggestions.map((user) => (
                    <li key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                          {user.name.charAt(0)}
                        </div>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <button className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                        <UserPlus size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Groups */}
            {filteredGroups.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4">Groups</h2>
                <ul className="space-y-3">
                  {filteredGroups.map((group) => (
                    <li key={group.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-gray-500">{group.member_count || 0} members</p>
                        </div>
                        {joinedGroups.includes(group.id) ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Joined
                          </span>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(group.id)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Posts;