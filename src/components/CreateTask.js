import { useState } from "react";
import { createTask } from "../services/taskService"; 
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const navigate = useNavigate();
  const [task, setTask] = useState({ title: "", description: "", budget: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    
      await createTask(task); 
      navigate("/tasks"); 
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Error creating task:", err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Post a New Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          className="w-full p-2 border rounded mb-3"
          value={task.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Task Description"
          className="w-full p-2 border rounded mb-3"
          value={task.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget ($)"
          className="w-full p-2 border rounded mb-3"
          value={task.budget}
          onChange={handleChange}
          required
        />
        {error && <p className="text-red-500">{error}</p>} {/* Display error message if any */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded"
          disabled={loading} 
        >
          {loading ? "Submitting..." : "Submit Task"}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;
