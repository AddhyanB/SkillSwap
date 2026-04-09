import { useEffect, useState } from "react";

function Discover() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  // 🔍 FILTER USERS BASED ON SEARCH
  const filteredUsers = users.filter((user) => {
    if (user._id === currentUser.id) return false;

    const skills = (user.skillsOffered || []).join(" ").toLowerCase();
    return skills.includes(search.toLowerCase());
  });

  return (
    <div className="h-full overflow-y-auto text-white">
      <div className="page-shell">
        <h1 className="page-title mb-2">Discover Users</h1>
        <p className="text-gray-300 mb-7">
          Find people whose offered skills align with your learning goals.
        </p>

        {/* 🔍 SEARCH BAR */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by skills (e.g. React, Java)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="modern-input"
          />
        </div>

        {/* EMPTY STATE */}
        {filteredUsers.length === 0 && (
          <p className="text-gray-500">No users found</p>
        )}

        {/* USERS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => {
            const offered = user.skillsOffered || [];
            const wanted = currentUser.skillsWanted || [];

            const match = offered.some((skill) =>
              wanted.includes(skill)
            );

            return (
              <div
                key={user._id}
                className="glass-card p-5 hover:scale-[1.015] transition"
              >
                <h2 className="text-xl font-semibold">{user.name}</h2>

                <p className="text-gray-400 text-sm mb-3">
                  {user.email}
                </p>

                <div className="mb-2">
                  <p className="text-gray-400 text-xs">Offers</p>
                  <p className="text-sm">{offered.join(", ") || "None"}</p>
                </div>

                <div className="mb-2">
                  <p className="text-gray-400 text-xs">Wants</p>
                  <p className="text-sm">
                    {(user.skillsWanted || []).join(", ") || "None"}
                  </p>
                </div>

                {match && (
                  <div className="mt-2 text-blue-400 text-sm">
                    Match available
                  </div>
                )}

                <button
                  className="mt-4 w-full btn-primary py-2.5"
                  onClick={async () => {
                    const res = await fetch(
                      "http://localhost:5000/api/auth/send-request",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          from: currentUser.id,
                          to: user._id,
                        }),
                      }
                    );
                    const data = await res.json();
                    alert(data.message);
                  }}
                >
                  Request
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Discover;
