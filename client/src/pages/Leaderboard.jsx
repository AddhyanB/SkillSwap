import { useEffect, useState } from "react";

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaders(Array.isArray(data) ? data : []))
      .catch(() => setLeaders([]));
  }, []);

  return (
    <div className="h-full overflow-y-auto text-white">
      <div className="page-shell">
        <h1 className="page-title mb-2">Leaderboard</h1>
        <p className="text-gray-300 mb-8">
          Rankings based on total skill points.
        </p>

        {leaders.length === 0 && (
          <div className="glass-card p-6">
            <p className="text-gray-400">No leaderboard data yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {leaders.map((user) => (
            <div
              key={user.id}
              className="glass-card p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600/80 flex items-center justify-center font-bold">
                  #{user.rank}
                </div>

                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-blue-300 text-sm">Skill Points</p>
                <p className="text-2xl font-bold">{user.skillPoints}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
