import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);

  const chatRef = useRef(null);

  // 🔥 OPEN VIDEO CALL IN NEW TAB
  const startCall = () => {
    const roomID = [currentUser.id, id].sort().join("_");
    window.open(`/call/${roomID}`, "_blank");
  };

  // fetch user
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/users")
      .then(res => res.json())
      .then(data => {
        const found = data.find(u => u._id === id);
        setUser(found);
      });
  }, [id]);

  // fetch messages
  const fetchMessages = () => {
    fetch(`http://localhost:5000/api/auth/messages/${currentUser.id}/${id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);

        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
        }, 100);
      });
  };

  useEffect(() => {
    socket.emit("join", currentUser.id);

    fetch("http://localhost:5000/api/auth/mark-seen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: id,
        to: currentUser.id,
      }),
    });

    fetchMessages();

    socket.on("receive_message", (data) => {
      if (data.from === id || data.to === id) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => socket.off("receive_message");
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const message = {
      from: currentUser.id,
      to: id,
      text,
    };

    await fetch("http://localhost:5000/api/auth/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    socket.emit("send_message", message);
    setMessages(prev => [...prev, message]);
    setText("");

    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };

  const clearChat = async () => {
    const ok = window.confirm("Clear all messages in this chat?");
    if (!ok) return;
    try {
      const res = await fetch("http://localhost:5000/api/auth/clear-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1: currentUser.id,
          user2: id,
        }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (res.ok) {
        setMessages([]);
        setText("");
        return;
      }

      alert(data.message || "Failed to clear chat");
    } catch {
      alert("Unable to clear chat. Please check server connection.");
    }
  };

  return (
    <div className="h-[calc(100vh-72px)] text-white p-3 md:p-5">
      <div className="max-w-5xl mx-auto h-full glass-card overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-5 md:px-6 py-4 border-b border-gray-800 bg-gray-900/85 backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {user?.name || "Chat"}
            </h2>
            <p className="text-sm text-gray-400 truncate">
              {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="px-3 py-2 rounded-full text-sm border border-red-400/40 text-red-300 hover:bg-red-500/10 transition"
            >
              Clear Chat
            </button>
            <button
              onClick={startCall}
              className="btn-primary px-4 py-2 text-sm"
            >
              Video Call
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-gray-950/45"
        >
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-10">
                No messages yet. Start the conversation.
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.from === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm max-w-[78%] md:max-w-[62%] shadow-md leading-6 ${
                    msg.from === currentUser.id
                      ? "bg-blue-600 text-right rounded-br-md"
                      : "bg-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/85 backdrop-blur-xl">
          <div className="flex gap-3 items-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="modern-input flex-1"
              placeholder="Type a message..."
            />

            <button
              onClick={sendMessage}
              className="btn-primary px-6 py-3"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
