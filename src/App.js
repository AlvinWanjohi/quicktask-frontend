import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import {supabase} from "./utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import MyTasks from "./pages/MyTasks";
import MyBids from "./components/MyBids";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TaskDetail from "./components/TaskDetail"; 
import Bidding from "./components/Bidding";
import CreateTask from "./components/CreateTask";
import UserProfile from "./pages/UserProfile"
import Messages from "./pages/Messages";
import Groups from "./pages/Groups";
import Posts from "./pages/Posts";
import Notifications from "./pages/Notifications";



function Layout({ children }) {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <div className="container mx-auto p-4">{children}</div>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function AppContent() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { user, setUser } = useAuth();

  const notificationCooldown = 5000;
  const lastNotificationTime = useRef(0);

  const showBrowserNotification = (title, body) => {
    const now = Date.now();
    if (now - lastNotificationTime.current < notificationCooldown) return;
    lastNotificationTime.current = now;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/logo192.png" });
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    requestNotificationPermission();

    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, (payload) => {
        setTasks((prev) => [...prev, payload.new]);
        toast.success(`New Task: ${payload.new.title}`);
        showBrowserNotification("New Task Available!", payload.new.title);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, (payload) => {
        setTasks((prev) => prev.map((task) => (task.id === payload.new.id ? payload.new : task)));
        toast.info(`✏️ Task Updated: ${payload.new.title}`);
        showBrowserNotification("Task Updated!", payload.new.title);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks" }, (payload) => {
        setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
        toast.error("Task Removed");
        showBrowserNotification("Task Removed!", "A task was deleted.");
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));
      }
      setAuthLoading(false);
    };

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAuthLoading(false);
    } else {
      checkSession();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
    });

    return () => authListener?.subscription?.unsubscribe();
  }, [setUser]);

  if (authLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Authenticated Pages */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks tasks={tasks} loading={loading} error={error} /></ProtectedRoute>} />
        <Route path="/mytasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
        <Route path="/mybids" element={<ProtectedRoute><MyBids /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* ✅ User Profile Route (Ensured it's included) */}
        <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* Task Details (Component) */}
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <ToastContainer position="top-right" autoClose={5000} />
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
