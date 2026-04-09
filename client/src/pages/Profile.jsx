import { useEffect, useMemo, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, "0");
const toDateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const intensityClass = (count, maxCount) => {
  if (count <= 0) return "bg-gray-800 border border-gray-700/70";

  const ratio = count / Math.max(maxCount, 1);
  if (ratio < 0.34) return "bg-emerald-900/80 border border-emerald-700/60";
  if (ratio < 0.67) return "bg-emerald-700/85 border border-emerald-500/70";
  return "bg-emerald-500/95 border border-emerald-300/80";
};

function Profile() {
  const [profile, setProfile] = useState({
    skillsOffered: "",
    skillsWanted: "",
  });
  const [saved, setSaved] = useState(false);
  const [activity, setActivity] = useState({
    days: [],
    currentStreak: 0,
    longestStreak: 0,
    totalContributions: 0,
  });
  const [dashboard, setDashboard] = useState({
    rank: null,
    skillPoints: 0,
    connections: 0,
    pendingRequests: 0,
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/auth/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;

        setProfile({
          skillsOffered: (data.skillsOffered || []).join(", "),
          skillsWanted: (data.skillsWanted || []).join(", "),
        });
        setSaved(true);
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/auth/activity/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.days)) return;
        setActivity(data);
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      fetch(`http://localhost:5000/api/auth/requests/${userId}`).then((r) => r.json()),
      fetch(`http://localhost:5000/api/auth/chat-users/${userId}`).then((r) => r.json()),
      fetch("http://localhost:5000/api/auth/leaderboard").then((r) => r.json()),
    ])
      .then(([requests, chatUsers, leaderboard]) => {
        const pending = Array.isArray(requests?.received)
          ? requests.received.filter((r) => r.status === "pending").length
          : 0;
        const connections = Array.isArray(chatUsers) ? chatUsers.length : 0;
        const row = Array.isArray(leaderboard)
          ? leaderboard.find((u) => String(u.id) === String(userId))
          : null;

        setDashboard({
          rank: row?.rank ?? null,
          skillPoints: Number(row?.skillPoints || currentUser?.skillPoints || 0),
          connections,
          pendingRequests: pending,
        });
      })
      .catch(() => {});
  }, [userId]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!userId) return;

    await fetch("http://localhost:5000/api/auth/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        skillsOffered: profile.skillsOffered
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        skillsWanted: profile.skillsWanted
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });

    setSaved(true);
    alert("Profile saved");
  };

  const offeredSkills = useMemo(
    () => profile.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean),
    [profile.skillsOffered]
  );
  const wantedSkills = useMemo(
    () => profile.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean),
    [profile.skillsWanted]
  );

  const defaultDays = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 181); // ~26 weeks

    return Array.from({ length: 182 }, (_, i) => {
      const d = new Date(start.getTime() + i * DAY_MS);
      return { date: toDateKey(d), count: 0 };
    });
  }, []);

  const daysData = activity.days.length > 0 ? activity.days : defaultDays;

  const maxCount = daysData.reduce((max, d) => Math.max(max, d.count || 0), 0);
  const firstDate = daysData[0]
    ? new Date(`${daysData[0].date}T00:00:00`)
    : null;
  const leadingBlanks = firstDate ? firstDate.getDay() : 0;
  const heatmapCells = [...new Array(leadingBlanks).fill(null), ...daysData];

  const stats = [
    {
      label: "Skill Points",
      value: dashboard.skillPoints,
      tone: "text-blue-300",
    },
    {
      label: "Leaderboard Rank",
      value: dashboard.rank ? `#${dashboard.rank}` : "Unranked",
      tone: "text-amber-300",
    },
    {
      label: "Connections",
      value: dashboard.connections,
      tone: "text-emerald-300",
    },
    {
      label: "Pending Requests",
      value: dashboard.pendingRequests,
      tone: "text-rose-300",
    },
  ];

  return (
    <div className="h-full overflow-y-auto text-white">
      <div className="page-shell">
        <div className="text-center mb-8 anim-fade-up">
          <h1 className="page-title">Profile Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Track your skill progress, activity streak, and profile details.
          </p>
        </div>

        <div className="glass-card p-6 md:p-7 mb-8 anim-fade-up anim-delay-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600/85 flex items-center justify-center text-lg font-bold">
                {(currentUser?.name || "U").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-2xl font-semibold">{currentUser?.name}</p>
                <p className="text-sm text-gray-400">{currentUser?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="stat-tile rounded-xl border border-gray-700/80 bg-gray-900/50 px-4 py-3 min-w-[130px]"
                >
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className={`text-lg font-semibold mt-1 ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-7 md:p-8 space-y-6 anim-fade-up anim-delay-2">
              <h2 className="text-xl font-semibold">Edit Profile</h2>

              <div>
                <label className="text-sm text-gray-300">Skills Offered</label>
                <input
                  type="text"
                  name="skillsOffered"
                  value={profile.skillsOffered}
                  onChange={handleChange}
                  placeholder="e.g. React, Java, Photoshop"
                  className="modern-input mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300">Skills Wanted</label>
                <input
                  type="text"
                  name="skillsWanted"
                  value={profile.skillsWanted}
                  onChange={handleChange}
                  placeholder="e.g. Node.js, UI Design"
                  className="modern-input mt-2"
                />
              </div>

              <button onClick={handleSave} className="btn-primary w-full py-3">
                {saved ? "Update Profile" : "Save Profile"}
              </button>
            </div>

            <div className="glass-card p-6 anim-fade-up anim-delay-3">
              <h3 className="text-lg font-semibold mb-4">Skill Snapshot</h3>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Offered ({offeredSkills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {offeredSkills.length > 0 ? (
                    offeredSkills.map((s) => (
                      <span
                        key={`offered-${s}`}
                        className="px-2.5 py-1 rounded-full text-xs bg-blue-500/15 border border-blue-400/40 text-blue-200"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No skills added yet</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Wanted ({wantedSkills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {wantedSkills.length > 0 ? (
                    wantedSkills.map((s) => (
                      <span
                        key={`wanted-${s}`}
                        className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/15 border border-emerald-400/40 text-emerald-200"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-card p-7 md:p-8 h-full anim-fade-up anim-delay-4">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-semibold">Contribution Heatmap</h2>
                  <p className="text-sm text-gray-400">
                    Your last 26 weeks of activity (LeetCode style)
                  </p>
                </div>

                <div className="flex items-center gap-5 text-sm">
                  <div>
                    <p className="text-gray-400">Current Streak</p>
                    <p className="font-semibold text-lg text-blue-300">
                      {activity.currentStreak} day{activity.currentStreak === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Longest Streak</p>
                    <p className="font-semibold text-lg text-blue-300">
                      {activity.longestStreak} day{activity.longestStreak === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="font-semibold text-lg text-blue-300">
                      {activity.totalContributions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-[10px] text-gray-500 pt-1 hidden md:flex md:flex-col md:justify-between h-[112px]">
                  <span>Sun</span>
                  <span>Tue</span>
                  <span>Thu</span>
                  <span>Sat</span>
                </div>

                <div className="overflow-x-auto w-full">
                  <div className="grid grid-rows-7 grid-flow-col auto-cols-max gap-1 w-max">
                    {heatmapCells.map((day, idx) => (
                      <div
                        key={idx}
                        className={`heat-cell w-3.5 h-3.5 rounded-[3px] ${
                          day ? intensityClass(day.count, maxCount) : "bg-transparent"
                        }`}
                        style={{ animationDelay: `${Math.min(idx * 0.004, 0.42)}s` }}
                        title={
                          day
                            ? `${day.date} • ${day.count} contribution${
                                day.count === 1 ? "" : "s"
                              }`
                            : ""
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
                <span>Less</span>
                <span className="w-3.5 h-3.5 rounded-[3px] bg-gray-800 border border-gray-700/70" />
                <span className="w-3.5 h-3.5 rounded-[3px] bg-emerald-900/80 border border-emerald-700/60" />
                <span className="w-3.5 h-3.5 rounded-[3px] bg-emerald-700/85 border border-emerald-500/70" />
                <span className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500/95 border border-emerald-300/80" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
