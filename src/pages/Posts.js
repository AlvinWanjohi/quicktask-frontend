import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../utils/supabaseClient";

const Posts = () => {
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [bids, setBids] = useState([]);
  const [tasks, setTasks] = useState({});
  const [bidAmount, setBidAmount] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: connectionRequests } = await supabase.from("connection_requests").select("*");
      const { data: suggestedUsers } = await supabase.from("users").select("*").limit(5);
      const { data: invites } = await supabase.from("sent_invites").select("*");
      const { data: followedGroups } = await supabase.from("groups").select("*");
      const { data: upcomingEvents } = await supabase.from("events").select("*");
      const { data: userBids } = await supabase.from("bids").select("*");
      const { data: taskList } = await supabase.from("tasks").select("id, title");

      const taskMap = {};
      if (taskList) {
        taskList.forEach((task) => {
          taskMap[task.id] = task.title;
        });
      }

      setRequests(connectionRequests || []);
      setSuggestions(suggestedUsers || []);
      setSentInvites(invites || []);
      setGroups(followedGroups || []);
      setEvents(upcomingEvents || []);
      setBids(userBids || []);
      setTasks(taskMap);
    };

    fetchData();
  }, []);

  const handlePlaceBid = async (taskId) => {
    console.log("Task ID:", taskId); 
  
    if (!bidAmount) return alert("Please enter a bid amount.");
    if (!taskId) return alert("Please enter a valid Task ID.");
  
    const parsedTaskId = parseInt(taskId, 10);
    if (isNaN(parsedTaskId)) return alert("Invalid Task ID format.");
  
    const { data, error } = await supabase
      .from("bids")
      .insert([{ task_id: parsedTaskId, amount: bidAmount, status: "Pending" }])
      .select();
  
    if (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid.");
      return;
    }
  
    if (!data || data.length === 0) {
      console.error("No data returned after bid insertion");
      alert("Bid placed, but no data was returned.");
      return;
    }
  
    alert("Bid placed successfully!");
    setBids([...bids, data[0]]);
    setBidAmount("");
    setSelectedTaskId(null);
  };
    

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">My Network</h2>

        {/* Connection Requests */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Connection Requests</h3>
          {requests.length > 0 ? (
            <ul>
              {requests.map((request) => (
                <li key={request.id} className="p-4 border rounded mb-2 bg-gray-50">
                  {request.name} wants to connect
                  <div className="mt-2">
                    <button className="mr-2 bg-blue-500 text-white px-3 py-1 rounded">Accept</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No new connection requests.</p>
          )}
        </section>

        {/* My Bids */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">My Bids</h3>
          {bids.length > 0 ? (
            <ul>
              {bids.map((bid) => (
                <li key={bid.id} className="p-4 border rounded mb-2 bg-gray-50">
                  Bid on <strong>{tasks[bid.task_id] || `Task ${bid.task_id}`}</strong> - ${bid.amount}
                </li>
              ))}
            </ul>
          ) : (
            <p>No bids placed yet.</p>
          )}
        </section>

        {/* Place a Bid */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Place a Bid</h3>
          <input
            type="text"
            placeholder="Enter Task ID"
            value={selectedTaskId || ""}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="number"
            placeholder="Enter Bid Amount ($)"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
          <button onClick={() => handlePlaceBid(selectedTaskId)} className="bg-green-500 text-white px-4 py-2 rounded">
            Submit Bid
          </button>
        </section>

        {/* Followed Groups & Pages */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Followed Groups & Pages</h3>
          {groups.length > 0 ? (
            <ul>
              {groups.map((group) => (
                <li key={group.id} className="p-4 border rounded mb-2 bg-gray-50">{group.name}</li>
              ))}
            </ul>
          ) : (
            <p>You're not following any groups.</p>
          )}
        </section>

        {/* Events & Newsletters */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Events & Newsletters</h3>
          {events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <li key={event.id} className="p-4 border rounded mb-2 bg-gray-50">
                  {event.name} - {event.date}
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Posts;
