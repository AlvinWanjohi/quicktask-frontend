import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Import auth context
import supabase from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom"; // For redirection

const MyTasks = () => {
  const { user, loading } = useAuth(); // Get user state
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch tasks only when user is available
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id); // Fetch only tasks for the logged-in user

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data);
      }
    } catch (err) {
      console.error("Fetch tasks failed:", err);
    }
    setTasksLoading(false);
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task.");
    } else {
      setTasks(tasks.filter((task) => task.id !== id));
      setModalOpen(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Checking authentication...</p>;
  if (tasksLoading) return <p className="text-center text-gray-500">Loading tasks...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">My Tasks</h1>
        <p className="mt-4 text-lg text-gray-700">Manage your posted tasks efficiently.</p>

        {tasks.length === 0 ? (
          <p className="text-gray-600 mt-6">No tasks found.</p>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
                <h3 className="text-xl font-semibold">{task.name}</h3>
                <p className="text-gray-600 mt-2">Bids Received: <span className="text-indigo-600 font-bold">{task.bids}</span></p>
                <p className="text-sm text-gray-500 mt-2">Deadline: {task.deadline || "No deadline"}</p>
                <p className={`mt-2 font-semibold ${task.status === "Completed" ? "text-green-600" : "text-blue-600"}`}>
                  {task.status || "Open"}
                </p>
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setModalOpen(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg font-semibold text-gray-800">
              Are you sure you want to delete <span className="text-red-600">"{selectedTask.name}"</span>?
            </p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setModalOpen(false)} className="mr-2 bg-gray-400 px-4 py-2 rounded">Cancel</button>
              <button onClick={() => deleteTask(selectedTask.id)} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
