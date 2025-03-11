import React, { useEffect, useState, useContext } from "react";
import supabase from "../utils/supabaseClient";
import { AuthContext } from "../context/AuthContext";

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return; // Ensure user is logged in

    const fetchNotifications = async () => {
      try {
        const { data: taskUpdates, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .order("updated_at", { ascending: false });

        const { data: bidUpdates, error: bidError } = await supabase
          .from("bids")
          .select("*")
          .order("updated_at", { ascending: false });

        const { data: paymentUpdates, error: paymentError } = await supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: postUpdates, error: postError } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (taskError || bidError || paymentError || postError) {
          console.error("Supabase errors:", taskError, bidError, paymentError, postError);
          return;
        }

        const formattedNotifications = [
          ...(taskUpdates || []).map(task => ({
            id: task.id,
            type: "task",
            message: `Task "${task.title}" was ${task.status}`,
            time: task.updated_at,
            read: false,
          })),
          ...(bidUpdates || []).map(bid => ({
            id: bid.id,
            type: "bid",
            message: `Your bid of $${bid.amount} on Task #${bid.task_id} is ${bid.status}`,
            time: bid.updated_at,
            read: false,
          })),
          ...(paymentUpdates || []).map(payment => ({
            id: payment.id,
            type: "payment",
            message: `Payment of $${payment.amount} is ${payment.status}`,
            time: payment.created_at,
            read: false,
          })),
          ...(postUpdates || []).map(post => ({
            id: post.id,
            type: "post",
            message: `New post: "${post.content.substring(0, 50)}..."`,
            time: post.created_at,
            read: false,
          })),
        ];

        formattedNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Supabase real-time updates
    const taskSubscription = supabase
      .channel("tasks")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, fetchNotifications)
      .subscribe();

    const bidSubscription = supabase
      .channel("bids")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids" }, fetchNotifications)
      .subscribe();

    const paymentSubscription = supabase
      .channel("payments")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payments" }, fetchNotifications)
      .subscribe();

    const postSubscription = supabase
      .channel("posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
      supabase.removeChannel(bidSubscription);
      supabase.removeChannel(paymentSubscription);
      supabase.removeChannel(postSubscription);
    };
  }, [user]);

  const markAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Mark All as Read
          </button>
        </div>
        {notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 border rounded ${notification.read ? "bg-gray-200" : "bg-yellow-50"}`}
              >
                <p className="text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">{new Date(notification.time).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
