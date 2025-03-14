import React, { useState, useEffect } from "react";
import {supabase} from "../utils/supabaseClient";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from("groups").select("*");
      if (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to fetch groups. Please try again later.");
      } else {
        setGroups(data);
      }
      setLoading(false);
    };

    const fetchCommunities = async () => {
      const { data, error } = await supabase.from("communities").select("*");
      if (error) console.error("Error fetching communities:", error);
      else setCommunities(data);
    };

    fetchGroups();
    fetchCommunities();
  }, []);

  const handleJoinGroup = (groupId) => {
    console.log(`Joining group with ID: ${groupId}`);
    alert("Feature coming soon!");
  };

  const openGroupChat = (group) => {
    setSelectedGroup(group);
  };

  const handleMuteGroup = (groupId) => {
    console.log(`Muted group ID: ${groupId}`);
    alert("Muted notifications for this group.");
  };

  const handleLeaveGroup = (groupId) => {
    console.log(`Left group ID: ${groupId}`);
    alert("You have left the group.");
  };

  const handleCreateGroup = async () => {
    setCreatingGroup(true);
    const { data, error } = await supabase.from("groups").insert([newGroup]);
    if (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    } else {
      setGroups([...groups, data[0]]);
      setNewGroup({ name: "", description: "" });
      alert("Group created successfully!");
    }
    setCreatingGroup(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-4">Industry Groups</h2>
      
      {/* Create Group Section */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-100">
        <h3 className="text-xl font-semibold mb-2">Create a New Group</h3>
        <input
          type="text"
          placeholder="Group Name"
          value={newGroup.name}
          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          className="w-full p-2 border rounded-md mb-2"
        />
        <textarea
          placeholder="Group Description"
          value={newGroup.description}
          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
          className="w-full p-2 border rounded-md mb-2"
        ></textarea>
        <button
          onClick={handleCreateGroup}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={creatingGroup}
        >
          {creatingGroup ? "Creating..." : "Create Group"}
        </button>
      </div>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded-md"
      />

      {/* Groups List */}
      <h3 className="text-xl font-semibold mt-6">Groups</h3>
      {groups.length === 0 ? (
        <p className="text-center text-gray-500">No groups available.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li key={group.id} className="border p-4 rounded-lg shadow-md bg-white">
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <p className="text-gray-700">{group.description || "No description available."}</p>
              <div className="mt-2 flex space-x-2">
                <button onClick={() => handleJoinGroup(group.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Join</button>
                <button onClick={() => openGroupChat(group)} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">Open Chat</button>
                <button onClick={() => handleMuteGroup(group.id)} className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">Mute</button>
                <button onClick={() => handleLeaveGroup(group.id)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">Leave</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {/* Group Chat Window */}
      {selectedGroup && (
        <div className="fixed bottom-0 right-0 bg-white shadow-lg rounded-md p-4 w-80">
          <h3 className="font-semibold text-lg">{selectedGroup.name} Chat</h3>
          <div className="mt-4">
            <p className="text-gray-500">Chat feature coming soon...</p>
          </div>
          <button onClick={() => setSelectedGroup(null)} className="mt-3 px-3 py-1 bg-gray-400 text-white rounded-md">Close</button>
        </div>
      )}
    </div>
  );
};

export default Groups;
