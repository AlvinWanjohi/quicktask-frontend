import React, { useEffect, useState, useContext } from "react";
import {supabase} from "../utils/supabaseClient";
import { AuthContext } from "../context/AuthContext";

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10; // Number of notifications per page
  const maxDisplayLength = 150; // Maximum length for notification messages

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error("Error fetching notifications:", error);
          return;
        }

        // Count total unread notifications
        const { count, error: countError } = await supabase
          .from("notifications")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .eq("read", false);

        if (countError) {
          console.error("Error counting unread notifications:", countError);
        } else {
          setUnreadCount(count || 0);
        }

        // Process notifications to truncate long messages
        const processedData = (data || []).map(notification => ({
          ...notification,
          displayMessage: notification.message.length > maxDisplayLength
            ? `${notification.message.substring(0, maxDisplayLength)}...`
            : notification.message
        }));

        setNotifications(processedData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Supabase real-time updates for notifications
    const subscription = supabase
      .channel("notifications")
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "notifications",
        filter: `user_id=eq.${user.id}`
      }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, page]); // Runs when `user` or `page` changes

  const markAsRead = async () => {
    if (!user || unreadCount === 0) return;
    
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error marking notifications as read:", error);
        return;
      }

      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error updating notifications:", error);
    }
  };

  const markOneAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white shadow-lg p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-500 mt-4">Please log in to view notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Notifications ({unreadCount})</h2>
          <button
            onClick={markAsRead}
            disabled={unreadCount === 0 || loading}
            className={`px-4 py-2 rounded transition duration-300 ${
              unreadCount === 0 || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Mark All as Read
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length > 0 ? (
          <>
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 border rounded ${notification.read ? "bg-gray-100" : "bg-yellow-50"}`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800">{notification.displayMessage}</p>
                      <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={() => markOneAsRead(notification.id)}
                        className="ml-4 text-sm text-blue-500 hover:text-blue-700"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className={`px-3 py-1 rounded ${
                  page === 0 || loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={notifications.length < pageSize || loading}
                className={`px-3 py-1 rounded ${
                  notifications.length < pageSize || loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 py-6 text-center">No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications; 