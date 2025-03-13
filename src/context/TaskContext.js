import { createContext, useState, useEffect } from "react";
import { getTasks } from "../services/taskService"; 
import { useAuth } from "../context/AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth(); // Retrieve the logged-in user

  // Only fetch tasks when the user is logged in
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const data = await getTasks(); 
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
