"use client";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Change if backend runs elsewhere

type Message = {
  _id: string;
  username: string;
  content: string;
  createdAt?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userNotifs, setUserNotifs] = useState<{ [user: string]: number }>({});
  const socketRef = useRef<Socket | null>(null);
  const usernameRef = useRef("");
  const openRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper to generate a unique room id for two users
  function getRoomId(user1: string, user2: string) {
    return [user1, user2].sort().join("--");
  }

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!loggedIn) return;
    // Connect to socket
    socketRef.current = io(SOCKET_URL);
    // Announce online
    socketRef.current.emit("user online", username);
    // Listen for online users
    socketRef.current.on("online users", (users: string[]) => {
      setOnlineUsers(users.filter((u) => u !== username));
    });
    // Listen for private messages
    socketRef.current.on("private message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      // If not in the room, increment notif for sender
      if (!openRef.current || !selectedUser || msg.username !== selectedUser) {
        setUserNotifs((prev) => ({
          ...prev,
          [msg.username]: (prev[msg.username] || 0) + 1,
        }));
      }
    });
    // Listen for delete message
    socketRef.current.on("delete message", (id: string) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    });
    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, username, selectedUser]);

  // Join room and fetch messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !socketRef.current) return;
    const room = getRoomId(username, selectedUser);
    setRoomId(room);
    setMessages([]); // clear previous messages
    socketRef.current.emit("join room", room);
    // Optionally, fetch previous messages for this room from backend (not implemented here)
    // Reset notif count for this user
    setUserNotifs((prev) => ({ ...prev, [selectedUser]: 0 }));
  }, [selectedUser, username]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username.trim() || !roomId) return;
    const msg = { username, content: input };
    socketRef.current?.emit("private message", { roomId, msg });
    setInput("");
  };

  const deleteMessage = (id: string) => {
    socketRef.current?.emit("delete message", id);
    // Optionally, also delete from backend
    fetch(`${SOCKET_URL}/messages/${id}`, { method: "DELETE" });
  };

  // Handle login/register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password required");
      return;
    }
    try {
      const res = await fetch(`${SOCKET_URL}/${loginMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unknown error");
        return;
      }
      setLoggedIn(true);
    } catch (err) {
      setError("Network error");
    }
  };

  if (!loggedIn) {
    return (
      <div className="fixed bottom-6 right-6 z-[1000] text-black w-[370px] bg-white border border-gray-300 rounded-2xl shadow-xl p-8">
        <div className="text-lg font-semibold mb-4">
          {loginMode === "login" ? "Login" : "Register"} to Messenger
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
            {loginMode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          {loginMode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setLoginMode("register")}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setLoginMode("login")}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1000] text-black">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-15 h-15 rounded-full bg-blue-600 text-white text-2xl shadow-md hover:bg-blue-700 focus:outline-none">
        💬
      </button>

      {open && (
        <div className="absolute bottom-20 right-0 w-[370px] bg-white border border-gray-300 rounded-2xl shadow-xl flex flex-col h-[500px]">
          <div className="bg-blue-600 text-white rounded-t-2xl px-5 py-4 font-semibold text-lg">
            Messenger
          </div>
          <div className="px-4 py-2 border-b border-gray-200 flex gap-2 overflow-x-auto">
            {onlineUsers.length === 0 && (
              <span className="text-gray-400">No users online</span>
            )}
            {onlineUsers.map((user) => (
              <button
                key={user}
                onClick={() => setSelectedUser(user)}
                className={`relative px-3 py-1 rounded-full border ${
                  selectedUser === user
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-300"
                } text-sm font-medium`}>
                {user}
                {userNotifs[user] > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs font-bold">
                    {userNotifs[user]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-100 space-y-2">
            {selectedUser ? (
              messages.map((msg) => {
                const isSelf = msg.username === username;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isSelf ? "justify-end" : "justify-start"
                    }`}>
                    <div
                      className={`relative px-4 py-2 max-w-[70%] rounded-xl ${
                        isSelf
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-200 text-gray-900 rounded-bl-md"
                      }`}>
                      <span className="font-medium">{msg.username}</span>
                      <div className="text-sm">{msg.content}</div>
                      {isSelf && (
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          title="Delete"
                          className="absolute -right-6 top-1 text-gray-400 hover:text-red-500">
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-400 text-center mt-10">
                Select a user to start chatting
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {selectedUser && (
            <form
              onSubmit={sendMessage}
              className="flex items-center border-t border-gray-200 px-4 py-3 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
