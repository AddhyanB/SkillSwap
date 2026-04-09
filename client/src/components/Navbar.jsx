import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [reqCount, setReqCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  const fetchNotifications = () => {
    if (!user) return;

    // 🔔 Requests
    fetch(`http://localhost:5000/api/auth/requests/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const pending = data.received.filter(r => r.status === "pending");
        setReqCount(pending.length);
      });

    // 🔔 Chats
    fetch(`http://localhost:5000/api/auth/unread/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setChatCount(data.count);
      });
  };

  useEffect(() => {
    fetchNotifications(); // initial

    // 🔥 auto refresh every 3 sec
    const interval = setInterval(fetchNotifications, 3000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const navClass = ({ isActive }) =>
    `nav-link relative transition ${
      isActive ? "text-blue-400" : ""
    }`;

  return (
    <div className="nav-surface h-[72px] border-b border-gray-800/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">

      {/* LOGO */}
      <div
        onClick={() => navigate("/")}
        className="text-2xl md:text-3xl font-extrabold cursor-pointer tracking-tight select-none leading-none"
      >
        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-300 bg-clip-text text-transparent">
          Skill
        </span>
        <span className="text-white">Swap</span>
      </div>

      {/* NAV */}
      <div className="flex items-center gap-5 text-sm">
        <NavLink to="/" className={navClass}>
          Home
        </NavLink>

        <NavLink to="/discover" className={navClass}>
          Discover
        </NavLink>

        {/* REQUESTS */}
        <div className="relative">
          <NavLink to="/requests" className={navClass}>
            Requests
          </NavLink>

          {reqCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-blue-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow-md shadow-blue-600/30">
              {reqCount}
            </span>
          )}
        </div>

        {/* CHATS */}
        <div className="relative">
          <NavLink to="/chats" className={navClass}>
            Chats
          </NavLink>

          {chatCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-blue-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow-md shadow-blue-600/30">
              {chatCount}
            </span>
          )}
        </div>

        <NavLink to="/leaderboard" className={navClass}>
          Leaderboard
        </NavLink>

        <NavLink to="/profile" className={navClass}>
          Profile
        </NavLink>

        <ThemeToggle className="!px-3 !py-1.5 rounded-full border-gray-600/80 bg-gray-800/70 hover:bg-gray-700/80" />

        <button
          onClick={logout}
          className="bg-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-500 transition shadow-md shadow-blue-700/30"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Navbar;
