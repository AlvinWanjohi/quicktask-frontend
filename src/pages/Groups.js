import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
  
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

  
    const fetchGroups = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("groups").select("*");
      if (error) console.error("Error fetching groups:", error);
      else setGroups(data);
      setLoading(false);
    };

    fetchUser();
    fetchGroups();
  }, []);

  
  useEffect(() => {
    if (!user) return;
    
    const fetchUserGroups = async () => {
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (error) console.error("Error fetching user groups:", error);
      else setUserGroups(data.map((g) => g.group_id));
    };

    fetchUserGroups();
  }, [user]);

  
  const handleJoinGroup = async (groupId) => {
    if (!user) {
      alert("You need to be logged in to join a group.");
      return;
    }

    if (userGroups.includes(groupId)) {
      alert("You have already joined this group.");
      return;
    }

    try {
    
      const { data: existingMember, error: checkError } = await supabase
        .from("group_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("group_id", groupId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingMember) {
        alert("You have already joined this group.");
        return;
      }

    
      const { error: insertError } = await supabase
        .from("group_members")
        .insert([{ user_id: user.id, group_id: groupId }]);

      if (insertError) throw insertError;

    
      setUserGroups([...userGroups, groupId]);
      alert("Successfully joined the group!");
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join the group. Please try again.");
    }
  };

  const handleCreateGroup = async () => {
    if (!user) {
      alert("You must be logged in to create a group.");
      return;
    }

    setCreatingGroup(true);
    const { data, error } = await supabase
      .from("groups")
      .insert([{ name: newGroup.name, description: newGroup.description, created_by: user.id }])
      .select();

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
      {loading ? (
        <p className="text-center text-gray-500">Loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="text-center text-gray-500">No groups available.</p>
      ) : (
        <ul className="space-y-4">
          {groups
            .filter((group) => group.name.toLowerCase().includes(search.toLowerCase()))
            .map((group) => (
              <li key={group.id} className="border p-4 rounded-lg shadow-md bg-white">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-gray-700">{group.description || "No description available."}</p>
                <div className="mt-2 flex space-x-2">
                  {userGroups.includes(group.id) ? (
                    <span className="px-3 py-1 bg-gray-500 text-white rounded-md">
                      Joined
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Join
                    </button>
                  )}
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
          <button
            onClick={() => setSelectedGroup(null)}
            className="mt-3 px-3 py-1 bg-gray-400 text-white rounded-md"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Groups;
