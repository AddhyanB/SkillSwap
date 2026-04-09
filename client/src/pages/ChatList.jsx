import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ChatList() {
  const [users, setUsers] = useState([]);
  const [unread, setUnread] = useState({});
  const [lastMessage, setLastMessage] = useState({});

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // fetch chat users
  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/chat-users/${currentUser.id}`)
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  // fetch unread counts
  useEffect(() => {
    users.forEach(u => {
      fetch(`http://localhost:5000/api/auth/unread-user/${currentUser.id}/${u._id}`)
        .then(res => res.json())
        .then(data => {
          setUnread(prev => ({
            ...prev,
            [u._id]: data.count
          }));
        });
    });
  }, [users]);

  // 🔥 fetch last message time (NEW)
  useEffect(() => {
    users.forEach(u => {
      fetch(`http://localhost:5000/api/auth/messages/${currentUser.id}/${u._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const last = data[data.length - 1];

            setLastMessage(prev => ({
              ...prev,
              [u._id]: new Date(last.createdAt).getTime()
            }));
          }
        });
    });
  }, [users]);

  return (
    <div className="h-full overflow-y-auto text-white">
      <div className="page-shell max-w-5xl">

        <h1 className="page-title mb-2">Chats</h1>
        <p className="text-gray-300 mb-8">
          Continue active conversations with your skill partners.
        </p>

        {users.length === 0 && (
          <p className="text-gray-500">No chats yet</p>
        )}

        <div className="space-y-4">

          {[...users]
            .sort((a, b) => {
              const timeA = lastMessage[a._id] || 0;
              const timeB = lastMessage[b._id] || 0;
              return timeB - timeA;
            })
            .map((u) => (
              <div
                key={u._id}
                onClick={() => navigate(`/chat/${u._id}`)}
                className="glass-card p-5 cursor-pointer flex justify-between items-center hover:scale-[1.01] transition"
              >

                <div>
                  <p className="font-semibold text-lg">{u.name}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                </div>

                {unread[u._id] > 0 && (
                  <span className="bg-blue-500 w-7 h-7 flex items-center justify-center rounded-full text-white text-xs font-semibold shadow-md shadow-blue-600/40">
                    {unread[u._id]}
                  </span>
                )}

              </div>
            ))}

        </div>

      </div>
    </div>
  );
}

export default ChatList;
