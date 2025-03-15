import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaPaperPlane, FaPlus, FaCalendarAlt, FaNewspaper, FaSearch, FaEllipsisH, FaTrash, FaEdit, FaImage, FaFile, FaThumbsUp } from "react-icons/fa";
import {supabase} from "../utils/supabaseClient";

const Messages = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("event");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [reactions, setReactions] = useState({});
  const [readStatus, setReadStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [{ data: users }, { data: groups }, { data: messages }, { data: posts }, { data: reactions }] = await Promise.all([
          supabase.from("users").select("id, name, avatar_url, status"),
          supabase.from("groups").select("id, name, description"),
          supabase.from("messages").select("*").order("created_at", { ascending: true }),
          supabase.from("posts").select("*").order("created_at", { ascending: false }),
          supabase.from("reactions").select("*"),
        ]);

        if (users) setUsers(users);
        if (groups) setGroups(groups);
        if (messages) setMessages(messages);
        if (posts) setPosts(posts);
        
        // Convert reactions to a map for easier access
        const reactionsMap = {};
        reactions?.forEach(reaction => {
          if (!reactionsMap[reaction.message_id]) {
            reactionsMap[reaction.message_id] = [];
          }
          reactionsMap[reaction.message_id].push(reaction);
        });
        setReactions(reactionsMap);
        
        // Initialize read status
        const readStatusMap = {};
        messages?.forEach(msg => {
          if (msg.receiver_id === userId) {
            readStatusMap[msg.id] = msg.read || false;
          }
        });
        setReadStatus(readStatusMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions
    const messageChannel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        // Mark new messages as unread if they're directed to current user
        if (payload.new.receiver_id === userId) {
          setReadStatus(prev => ({ ...prev, [payload.new.id]: false }));
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? payload.new : msg));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => prev.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe();

    const postChannel = supabase
      .channel("posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        setPosts((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    const reactionChannel = supabase
      .channel("reactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, (payload) => {
        fetchReactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(postChannel);
      supabase.removeChannel(reactionChannel);
    };
  }, [userId]);

  const fetchReactions = async () => {
    const { data } = await supabase.from("reactions").select("*");
    const reactionsMap = {};
    data?.forEach(reaction => {
      if (!reactionsMap[reaction.message_id]) {
        reactionsMap[reaction.message_id] = [];
      }
      reactionsMap[reaction.message_id].push(reaction);
    });
    setReactions(reactionsMap);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when conversation is selected
    if (selectedUser || selectedGroup) {
      const markAsRead = async () => {
        const messagesToUpdate = messages.filter(msg => 
          msg.receiver_id === userId && !readStatus[msg.id] &&
          (selectedUser ? msg.sender_id === selectedUser.id : msg.group_id === selectedGroup.id)
        );
        
        if (messagesToUpdate.length > 0) {
          const ids = messagesToUpdate.map(msg => msg.id);
          await supabase.from("messages").update({ read: true }).in("id", ids);
          
          const newReadStatus = { ...readStatus };
          ids.forEach(id => { newReadStatus[id] = true; });
          setReadStatus(newReadStatus);
        }
      };
      markAsRead();
    }
  }, [selectedUser, selectedGroup, messages, userId, readStatus]);

  const sendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || (!selectedUser && !selectedGroup)) return;

    try {
      let attachmentUrls = [];
      
      // Upload attachments if any
      if (attachments.length > 0) {
        attachmentUrls = await Promise.all(
          attachments.map(async (file) => {
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
              .from("attachments")
              .upload(fileName, file);
              
            if (error) throw error;
            
            return {
              name: file.name,
              url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${fileName}`,
              type: file.type
            };
          })
        );
      }

      const newMessage = {
        sender_id: userId,
        receiver_id: selectedUser ? selectedUser.id : null,
        group_id: selectedGroup ? selectedGroup.id : null,
        content: message.trim(),
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
        created_at: new Date().toISOString(),
        read: false,
      };

      if (isEditing && editingMessageId) {
        await supabase.from("messages").update({ content: message }).eq("id", editingMessageId);
        setIsEditing(false);
        setEditingMessageId(null);
      } else {
        await supabase.from("messages").insert([newMessage]);
      }
      
      setMessage("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const editMessage = (msg) => {
    setMessage(msg.content);
    setIsEditing(true);
    setEditingMessageId(msg.id);
  };

  const deleteMessage = async (id) => {
    try {
      await supabase.from("messages").delete().eq("id", id);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      await supabase.from("reactions").insert([{
        user_id: userId,
        message_id: messageId,
        emoji: emoji
      }]);
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const { data, error } = await supabase.from("groups").insert([{ 
        name: newGroupName,
        description: "",
        created_by: userId,
        created_at: new Date().toISOString()
      }]).select();
      
      if (!error) {
        setGroups((prev) => [...prev, ...data]);
        setNewGroupName("");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const postUpdate = async () => {
    if (!postContent.trim()) return;
  
    try {
      const newPost = {
        user_id: userId,
        content: postContent,
        type: postType,
        created_at: new Date().toISOString(),
      };
  
      const { data, error } = await supabase.from("posts").insert([newPost]).select("*");
  
      if (error) throw error;
  
      if (data && data.length > 0) {
        setPosts((prevPosts) => [data[0], ...prevPosts]);
      }
  
      setPostContent("");
    } catch (error) {
      console.error("Error posting update:", error);
    }
  };
  
  
  useEffect(() => {
    const subscription = supabase
      .channel("posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        setPosts((prevPosts) => [payload.new, ...prevPosts]); 
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  

  const filteredMessages = useMemo(() => {
    const filtered = messages.filter(
      (msg) =>
        selectedUser
          ? (msg.sender_id === userId && msg.receiver_id === selectedUser.id) || 
            (msg.sender_id === selectedUser.id && msg.receiver_id === userId)
          : selectedGroup
          ? msg.group_id === selectedGroup.id
          : false
    );
    
    if (searchTerm) {
      return filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [messages, selectedUser, selectedGroup, userId, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users.filter(u => u.id !== userId);
    return users.filter(u => 
      u.id !== userId && 
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, userId]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups;
    return groups.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    return posts.filter(p => 
      p.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const getUnreadCount = (targetId, isGroup = false) => {
    return messages.filter(msg => 
      msg.receiver_id === userId && !readStatus[msg.id] && 
      (isGroup ? msg.group_id === targetId : msg.sender_id === targetId)
    ).length;
  };

  return (
    <div className="flex h-screen max-w-6xl mx-auto bg-gray-50 border rounded-lg shadow-md">
      {/* Sidebar */}
      <div className="w-1/3 border-r p-4 overflow-y-auto bg-white">
        <h2 className="text-lg font-bold mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 pl-8 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-2 top-3 text-gray-400" />
        </div>

        {/* Users List */}
        <h3 className="font-semibold mb-2">Direct Messages</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-3 mb-2 cursor-pointer rounded-lg flex items-center justify-between ${
                selectedUser?.id === user.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
              onClick={() => {
                setSelectedUser(user);
                setSelectedGroup(null);
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span>{user.name}</span>
              </div>
              {getUnreadCount(user.id) > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {getUnreadCount(user.id)}
                </span>
              )}
            </div>
          ))
        )}

        {/* Groups List */}
        <h3 className="font-semibold mt-6 mb-2 flex items-center justify-between">
          <span>Groups</span>
          <FaPlus 
            className="text-blue-500 cursor-pointer" 
            onClick={() => document.getElementById('new-group-form').classList.toggle('hidden')}
          />
        </h3>
        
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`p-3 mb-2 cursor-pointer rounded-lg flex items-center justify-between ${
                selectedGroup?.id === group.id ? "bg-green-500 text-white" : "hover:bg-gray-200"
              }`}
              onClick={() => {
                setSelectedGroup(group);
                setSelectedUser(null);
              }}
            >
              <div>
                <span>{group.name}</span>
                {group.description && (
                  <p className={`text-xs ${selectedGroup?.id === group.id ? "text-white" : "text-gray-500"}`}>
                    {group.description}
                  </p>
                )}
              </div>
              {getUnreadCount(group.id, true) > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {getUnreadCount(group.id, true)}
                </span>
              )}
            </div>
          ))
        )}

        {/* Create Group Form */}
        <div id="new-group-form" className="mt-4 hidden">
          <input
            type="text"
            placeholder="New group name..."
            className="p-2 border rounded w-full mb-2"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button 
            className="w-full bg-green-600 text-white p-2 rounded" 
            onClick={createGroup}
          >
            Create Group
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h2 className="font-bold text-lg">
            {selectedUser ? selectedUser.name : selectedGroup ? `Group: ${selectedGroup.name}` : "Select a conversation"}
          </h2>
          {(selectedUser || selectedGroup) && (
            <div className="relative">
              <FaEllipsisH className="cursor-pointer" />
              {/* Dropdown menu for more options could go here */}
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-16 ${i % 2 === 0 ? 'ml-auto w-2/3' : 'w-2/3'} bg-gray-200 rounded-lg`}></div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>{searchTerm ? "No messages match your search" : "No messages yet"}</p>
              {!searchTerm && <p className="text-sm">Start the conversation!</p>}
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="mb-4">
                <div 
                  className={`p-3 rounded-lg max-w-xs ${
                    msg.sender_id === userId 
                      ? "ml-auto bg-blue-500 text-white" 
                      : "bg-white border"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold">
                      {msg.sender_id === userId 
                        ? "You" 
                        : users.find(u => u.id === msg.sender_id)?.name}
                    </p>
                    <p className="text-xs opacity-75">
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  
                  <p>{msg.content}</p>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center">
                          {attachment.type.startsWith('image') ? (
                            <FaImage className="mr-1" />
                          ) : (
                            <FaFile className="mr-1" />
                          )}
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-sm underline"
                          >
                            {attachment.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Reactions */}
                  {reactions[msg.id] && reactions[msg.id].length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {reactions[msg.id].map((reaction, index) => (
                        <span key={index} className="bg-gray-200 text-black rounded-full px-2 py-0.5 text-xs">
                          {reaction.emoji} {reaction.emoji === '👍' ? reactions[msg.id].filter(r => r.emoji === '👍').length : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Message actions */}
                {msg.sender_id === userId && (
                  <div className="flex justify-end mt-1 space-x-2">
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => editMessage(msg)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-red-500"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
                
                {/* Add reaction button */}
                <div className="flex justify-start mt-1">
                  <button 
                    className="text-xs text-gray-500 hover:text-blue-500"
                    onClick={() => addReaction(msg.id, '👍')}
                  >
                    <FaThumbsUp />
                  </button>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-3 pt-2 bg-gray-100 flex gap-2 flex-wrap">
            {attachments.map((file, index) => (
              <div key={index} className="relative bg-white p-1 rounded border flex items-center">
                <span className="text-xs truncate max-w-xs">{file.name}</span>
                <button 
                  className="ml-1 text-red-500"
                  onClick={() => removeAttachment(index)}
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-center p-3 border-t bg-white">
          <button 
            className="text-gray-500 p-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaImage />
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              multiple
            />
          </button>
          
          <input 
            type="text" 
            className="flex-1 border p-2 rounded-md outline-none mx-2" 
            placeholder={isEditing ? "Edit your message..." : "Type a message..."} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          
          <button 
            onClick={sendMessage} 
            className={`${
              isEditing ? "bg-yellow-600" : "bg-blue-600"
            } text-white p-2 rounded-md`}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {/* Events & Newsletters */}
      <div className="w-1/3 p-4 border-l bg-white overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Events & Newsletters</h2>
        
        <div className="mb-4">
          <textarea 
            className="w-full border p-2 rounded" 
            placeholder="Write something..." 
            rows="4"
            value={postContent} 
            onChange={(e) => setPostContent(e.target.value)} 
          />
          
          <div className="flex gap-2 mb-2">
            <button 
              className={`flex-1 p-2 rounded ${postType === "event" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setPostType("event")}
            >
              <FaCalendarAlt className="mr-2 inline" /> Event
            </button>
            <button 
              className={`flex-1 p-2 rounded ${postType === "newsletter" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setPostType("newsletter")}
            >
              <FaNewspaper className="mr-2 inline" /> Newsletter
            </button>
          </div>
          
          <button 
            className="w-full bg-blue-600 text-white p-2 rounded" 
            onClick={postUpdate}
          >
            Post
          </button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No posts available {searchTerm && "matching your search"}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                      {users.find(u => u.id === post.user_id)?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{users.find(u => u.id === post.user_id)?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    post.type === "event" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}>
                    {post.type === "event" ? "Event" : "Newsletter"}
                  </span>
                </div>
                <p className="whitespace-pre-line">{post.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;