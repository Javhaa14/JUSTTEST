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
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "relative",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#0078fe",
          color: "#fff",
          border: "none",
          fontSize: 28,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          cursor: "pointer"
        }}
      >
        💬
        {notifCount > 0 && !open && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "red",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 8px",
              fontSize: 14,
              fontWeight: "bold"
            }}
          >
            {notifCount}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 0,
            width: 370,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: 500
          }}
        >
          <div style={{
            background: "#0078fe",
            color: "#fff",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: "16px 20px",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: 0.5
          }}>
            Messenger
          </div>
          <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
            <input
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", marginBottom: 0, padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#f5f6fa" }}>
            {messages.map((msg) => {
              const isSelf = msg.username === username;
              return (
                <div
                  key={msg._id}
                  style={{
                    display: "flex",
                    justifyContent: isSelf ? "flex-end" : "flex-start",
                    marginBottom: 10
                  }}
                >
                  <div
                    style={{
                      background: isSelf ? "#0078fe" : "#e4e6eb",
                      color: isSelf ? "#fff" : "#222",
                      borderRadius: 18,
                      borderBottomRightRadius: isSelf ? 4 : 18,
                      borderBottomLeftRadius: isSelf ? 18 : 4,
                      padding: "8px 14px",
                      maxWidth: "70%",
                      position: "relative"
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{msg.username}</span>
                    <div style={{ fontSize: 15 }}>{msg.content}</div>
                    {isSelf && (
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: -28,
                          background: "none",
                          border: "none",
                          color: "#888",
                          fontSize: 16,
                          cursor: "pointer"
                        }}
                        title="Delete"
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
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #eee",
              padding: 12,
              background: "#fff"
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: "none",
                borderRadius: 20,
                background: "#f0f2f5",
                padding: "10px 16px",
                fontSize: 15,
                outline: "none"
              }}
            />
            <button
              type="submit"
              style={{
                marginLeft: 8,
                background: "#0078fe",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer"
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
