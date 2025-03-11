import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaReply, FaTimes } from "react-icons/fa";
import supabase from "../utils/supabaseClient";

const Messages = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) console.error("Error fetching messages:", error);
      else setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMessage = {
      user_id: userId,
      content: message,
      reply_to: replyingTo ? replyingTo.id : null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("messages").insert([newMessage]);

    if (error) console.error("Error sending message:", error);
    else {
      setMessage("");
      setReplyingTo(null);
    }
  };

  const handleUserSelection = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-100 border rounded-lg shadow-lg">
      <div className="p-4 bg-blue-600 text-white text-center font-bold text-lg">Chat</div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages
          .filter((msg) => selectedUser === null || msg.user_id === selectedUser)
          .map((msg) => (
            <div
              key={msg.id}
              className={`p-3 mb-2 max-w-xs break-words rounded-lg ${
                msg.user_id === userId ? "ml-auto bg-blue-500 text-white" : "bg-white"
              }`}
            >
              {msg.reply_to && (
                <p className="text-xs italic text-gray-700 border-l-4 pl-2 mb-1">
                  Replying to: {messages.find((m) => m.id === msg.reply_to)?.content}
                </p>
              )}
              <p>{msg.content}</p>
              <p className="text-xs text-gray-400 text-right">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
              <button
                onClick={() => setReplyingTo(msg)}
                className="text-xs text-gray-500 flex items-center mt-1"
              >
                <FaReply className="mr-1" /> Reply
              </button>
              <button
                onClick={() => handleUserSelection(msg.user_id)}
                className="text-xs text-blue-500 ml-2"
              >
                View Messages
              </button>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="p-2 bg-gray-200 flex justify-between items-center">
          <p className="text-sm italic">Replying to: {replyingTo.content}</p>
          <button onClick={() => setReplyingTo(null)} className="text-sm text-red-600">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="flex items-center p-3 border-t bg-white">
        <input
          type="text"
          className="flex-1 border p-2 rounded-md outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-600 text-white p-2 rounded-md">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Messages;