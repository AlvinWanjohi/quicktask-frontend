import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";

const Task = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("None");
  const [tasks, setTasks] = useState([]);
  const [bids, setBids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("tasks").select("*");
        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const { data, error } = await supabase.from("bids").select("*");
        if (error) throw error;
        setBids(
          data.reduce((acc, bid) => {
            acc[bid.task_id] = [...(acc[bid.task_id] || []), bid];
            return acc;
          }, {})
        );
      } catch (err) {
        console.error("Error fetching bids:", err.message);
      }
    };
    fetchBids();
  }, []);

  useEffect(() => {
    const taskChannel = supabase
      .channel("tasks")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, (payload) => {
        setTasks((prev) => (prev.some((t) => t.id === payload.new.id) ? prev : [...prev, payload.new]));
      })
      .subscribe();

    const bidChannel = supabase
      .channel("bids")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids" }, (payload) => {
        setBids((prev) => ({
          ...prev,
          [payload.new.task_id]: [...(prev[payload.new.task_id] || []), payload.new],
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(bidChannel);
    };
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) =>
        task.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "All" || task.category === category)
      )
      .sort((a, b) => {
        if (sortOrder === "Low to High") return (a.budget || 0) - (b.budget || 0);
        if (sortOrder === "High to Low") return (b.budget || 0) - (a.budget || 0);
        return 0;
      });
  }, [search, category, sortOrder, tasks]);

  const handleBidSubmit = async (e, taskId, bidAmount, message) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to place a bid.");

    try {
      const { error } = await supabase.from("bids").insert([{ task_id: taskId, user_id: user.id, amount: bidAmount, message }]);
      if (error) throw error;
      setBids((prev) => ({ ...prev, [taskId]: [...(prev[taskId] || []), { task_id: taskId, user_id: user.id, amount: bidAmount, message }] }));
    } catch (err) {
      alert("Error placing bid: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-400 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Available Tasks</h2>

        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="p-2 border rounded w-64 focus:ring-2 focus:ring-blue-400" />
          <select onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" value={category}>
            <option value="All">All Categories</option>
            <option value="Design">Design</option>
            <option value="Programming">Programming</option>
            <option value="Marketing">Marketing</option>
          </select>
          <select onChange={(e) => setSortOrder(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" value={sortOrder}>
            <option value="None">Sort by Budget</option>
            <option value="Low to High">Low to High</option>
            <option value="High to Low">High to Low</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading tasks...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredTasks.length > 0 ? (
          <ul className="space-y-6">
            {filteredTasks.map((task) => (
              <li key={task.id} className="p-4 border rounded shadow-md bg-gray-50 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
                <p className="text-gray-600">Category: <span className="font-medium">{task.category}</span></p>
                <p className="font-bold text-blue-600">${task.budget ?? "N/A"}</p>
                {user && (
                  <form onSubmit={(e) => handleBidSubmit(e, task.id, e.target.bidAmount.value, e.target.message.value)}>
                    <div className="mt-4">
                      <input type="number" name="bidAmount" placeholder="Your bid ($)" className="p-2 border rounded w-32 mr-2" required />
                      <input type="text" name="message" placeholder="Your message" className="p-2 border rounded w-56 mr-2" />
                      <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">Place Bid</button>
                    </div>
                  </form>
                )}
                <Link to={`/tasks/${task.id}`} className="text-blue-500 hover:underline block mt-2">View Details</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 mt-6">No tasks found.</p>
        )}
      </div>
    </div>
  );
};

export default Task;
