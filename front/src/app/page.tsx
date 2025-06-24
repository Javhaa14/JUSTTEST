"use client"
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
  const [open, setOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const usernameRef = useRef("");
  const openRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    // Fetch initial messages
    fetch(`${SOCKET_URL}/messages`)
      .then((res) => res.json())
      .then((data: Message[]) => setMessages(data));

    // Connect to socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on("chat message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      if (!openRef.current && msg.username !== usernameRef.current) setNotifCount((c) => c + 1);
    });
    socketRef.current.on("delete message", (id: string) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    });
    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset notification count when chat is opened
  useEffect(() => {
    if (open) setNotifCount(0);
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username.trim()) return;
    const msg = { username, content: input };
    socketRef.current?.emit("chat message", msg);
    setInput("");
  };

  const deleteMessage = (id: string) => {
    socketRef.current?.emit("delete message", id);
    fetch(`${SOCKET_URL}/messages/${id}`, { method: "DELETE" });
  };

return (
  <div className="fixed bottom-6 right-6 z-[1000] text-black">
    <button
      onClick={() => setOpen((o) => !o)}
      className="relative w-15 h-15 rounded-full bg-blue-600 text-white text-2xl shadow-md hover:bg-blue-700 focus:outline-none"
    >
      💬
      {notifCount > 0 && !open && (
        <span className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 text-sm font-bold">
          {notifCount}
        </span>
      )}
    </button>

    {open && (
      <div className="absolute bottom-20 right-0 w-[370px] bg-white border border-gray-300 rounded-2xl shadow-xl flex flex-col h-[500px]">
        <div className="bg-blue-600 text-white rounded-t-2xl px-5 py-4 font-semibold text-lg">
          Messenger
        </div>
        <div className="px-4 py-4 border-b border-gray-200">
          <input
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-100 space-y-2">
          {messages.map((msg) => {
            const isSelf = msg.username === username;
            return (
              <div key={msg._id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative px-4 py-2 max-w-[70%] rounded-xl ${
                    isSelf
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-200 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <span className="font-medium">{msg.username}</span>
                  <div className="text-sm">{msg.content}</div>
                  {isSelf && (
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      title="Delete"
                      className="absolute -right-6 top-1 text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={sendMessage}
          className="flex items-center border-t border-gray-200 px-4 py-3 bg-white"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    )}
  </div>
);

}
