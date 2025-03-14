import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Bookmark, Briefcase, MapPin, Search, Users, Clock, Globe, PlusCircle, Filter, ArrowUpDown, Calendar, DollarSign, Bell } from "lucide-react";
import { toast } from "react-hot-toast";

const Task = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [location, setLocation] = useState("");
  const [sortOrder, setSortOrder] = useState("None");
  const [tasks, setTasks] = useState([]);
  const [bids, setBids] = useState({});
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [page, setPage] = useState(1);
  const tasksPerPage = 5;

  const [newTask, setNewTask] = useState({
    name: "",
    category: "Design",
    job_type: "Full-time",
    location: "",
    budget: "",
    description: "",
    deadline: "",
  });

  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);

  
  const categories = ["Design", "Programming", "Marketing", "Writing", "Admin", "Customer Service", "Data Entry", "Other"];
  
  
  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote", "Freelance", "Internship"];

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchSavedJobs();
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError("Failed to load jobs. Please try again.");
      toast.error(`Failed to load jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchSavedJobs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("task_id")
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      setSavedJobs(new Set(data.map(item => item.task_id)));
    } catch (err) {
      console.error("Error fetching saved jobs:", err.message);
    }
  };

  useEffect(() => {
    if (tasks.length === 0) return; 
  
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
  }, [tasks]);
  

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) =>
        task.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "All" || task.category === category) &&
        (jobType === "All" || task.job_type === jobType) &&
        (location === "" || task.location.toLowerCase().includes(location.toLowerCase())) &&
        (!myTasksOnly || task.user_id === user?.id)
      )
      .sort((a, b) => {
        if (sortOrder === "Low to High") return (a.budget || 0) - (b.budget || 0);
        if (sortOrder === "High to Low") return (b.budget || 0) - (a.budget || 0);
        if (sortOrder === "Newest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === "Oldest") return new Date(a.created_at) - new Date(b.created_at);
        return 0;
      });
  }, [search, category, jobType, location, sortOrder, tasks, myTasksOnly, user]);
  

  // Pagination
  const paginatedTasks = useMemo(() => {
    const startIndex = (page - 1) * tasksPerPage;
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage);
  }, [filteredTasks, page]);

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handleSaveJob = async (taskId) => {
    if (!user) {
      toast.error("Please log in to save jobs");
      return;
    }
  
    try {
      if (savedJobs.has(taskId)) {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", user.id)
          .eq("task_id", taskId);
        
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
  
        toast.success("Job removed from saved jobs");
      } else {
        await supabase
          .from("saved_jobs")
          .insert([{ user_id: user.id, task_id: taskId }]);
  
        setSavedJobs(prev => new Set([...prev, taskId])); 
        toast.success("Job saved successfully");
      }
    } catch (err) {
      console.error("Error saving/unsaving job:", err);
      toast.error("Failed to update saved jobs");
    }
  };
  

  const handlePostTask = async (e) => {
    e.preventDefault();
    setPosting(true);
    setPostError(null);
  
    if (!user) {
      setPostError("You must be logged in to post a task.");
      setPosting(false);
      toast.error("Login required");
      return;
    }
  
    try {
      const { data, error } = await supabase.from("tasks").insert([
        {
          name: newTask.name,
          category: newTask.category,
          job_type: newTask.job_type,
          location: newTask.location,
          budget: newTask.budget ? parseFloat(newTask.budget) : null,
          description: newTask.description,
          deadline: newTask.deadline || null,
          user_id: user.id,
          created_at: new Date().toISOString(),
        },
      ]).select();
  
      if (error) throw error;
  
      setTasks([...tasks, ...data]);
      setShowPostForm(false);
      toast.success("Task posted successfully!");
  
      
      setNewTask({ 
        name: "", 
        category: "", 
        job_type: "", 
        location: "", 
        budget: "",
        description: "",
        deadline: "" 
      });
  
    } catch (err) {
      setPostError("Failed to post task. Try again.");
      toast.error("Failed to post task");
    } finally {
      setPosting(false);
    }
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString();
  };

  const calculateTimeLeft = (deadline) => {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeLeft = deadlineDate - now;
    
    if (timeLeft <= 0) return "Expired";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`;
    
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''} left`;
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setJobType("All");
    setLocation("");
    setSortOrder("None");
    setMyTasksOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Find Your Next Opportunity</h2>

        {/* Search Bar and Toggle Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 pl-10 border rounded w-full"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
          >
            <Filter className="h-5 w-5 mr-2" /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button 
            onClick={() => setShowPostForm(!showPostForm)} 
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> {showPostForm ? "Hide Form" : "Post Task"}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="All">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Any location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="None">No Sorting</option>
                  <option value="Low to High">Budget: Low to High</option>
                  <option value="High to Low">Budget: High to Low</option>
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="myTasksOnly"
                  checked={myTasksOnly}
                  onChange={(e) => setMyTasksOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="myTasksOnly" className="ml-2 block text-sm text-gray-700">
                  Show my tasks only
                </label>
              </div>
              <button 
                onClick={resetFilters} 
                className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Post a Task Form */}
        {showPostForm && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center">
              <PlusCircle className="h-6 w-6 mr-2" /> Post a Task
            </h3>
            {postError && <p className="text-red-500 mb-3">{postError}</p>}
            <form onSubmit={handlePostTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="p-2 border rounded"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={newTask.job_type}
                onChange={(e) => setNewTask({ ...newTask, job_type: e.target.value })}
                className="p-2 border rounded"
              >
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Location"
                value={newTask.location}
                onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Budget ($)"
                value={newTask.budget}
                onChange={(e) => setNewTask({ ...newTask, budget: e.target.value })}
                className="p-2 border rounded"
              />
              <div className="md:col-span-2">
                <textarea
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="p-2 border rounded w-full h-20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="flex items-center">
                <button type="submit" disabled={posting} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {posting ? "Posting..." : "Post Task"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowPostForm(false)} 
                  className="ml-2 p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task Stats */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex flex-wrap justify-between items-center">
          <p className="text-gray-600">
            Found <span className="font-semibold">{filteredTasks.length}</span> tasks
          </p>
          <div className="flex items-center">
            <p className="text-sm text-gray-500 mr-4">
              Page {page} of {totalPages || 1}
            </p>
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-1 rounded ${page === 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className={`p-1 ml-2 rounded ${page >= totalPages ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Task Listings */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : paginatedTasks.length > 0 ? (
          <ul className="space-y-6">
            {paginatedTasks.map((task) => (
              <li key={task.id} className="p-4 border rounded shadow-md bg-white hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{task.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Briefcase className="h-3 w-3 mr-1" /> {task.job_type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Globe className="h-3 w-3 mr-1" /> {task.category}
                      </span>
                      {task.location && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <MapPin className="h-3 w-3 mr-1" /> {task.location}
                        </span>
                      )}
                      {task.deadline && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Calendar className="h-3 w-3 mr-1" /> {formatDate(task.deadline)}
                        </span>
                      )}
                      {task.deadline && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          calculateTimeLeft(task.deadline) === "Expired" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          <Clock className="h-3 w-3 mr-1" /> {calculateTimeLeft(task.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleSaveJob(task.id)} className="text-gray-500 hover:text-blue-500">
                    <Bookmark className={`h-6 w-6 ${savedJobs.has(task.id) ? "fill-current text-blue-500" : ""}`} />
                  </button>
                </div>
                
                {task.description && (
                  <p className="text-gray-600 mt-3 line-clamp-2">{task.description}</p>
                )}
                
                <div className="mt-3 flex flex-wrap justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {task.budget && (
                      <p className="text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-500" /> {task.budget.toLocaleString()}
                      </p>
                    )}
                    {bids[task.id] && (
                      <p className="text-gray-600 flex items-center">
                        <Users className="h-4 w-4 mr-1 text-blue-500" /> {bids[task.id].length} bids
                      </p>
                    )}
                  </div>
                  <Link 
                    to={`/tasks/${task.id}`} 
                    className="text-blue-500 hover:underline inline-flex items-center"
                  >
                    View Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 mb-2">No tasks found matching your criteria.</p>
            <button onClick={resetFilters} className="text-blue-500 hover:underline">Reset filters</button>
          </div>
        )}

        {/* Pagination */}
        {filteredTasks.length > tasksPerPage && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${page === 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                First
              </button>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${page === 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Previous
              </button>
              <span className="px-4 py-1">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className={`px-3 py-1 rounded ${page >= totalPages ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className={`px-3 py-1 rounded ${page >= totalPages ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Last
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Task;