import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Requests() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/requests/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSent(data.sent);
        setReceived(data.received);
      });
  }, []);

  const updateRequest = async (id, status) => {
    await fetch("http://localhost:5000/api/auth/update-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId: id, status }),
    });

    window.location.reload();
  };

  const formatStatus = (s) =>
    s.charAt(0).toUpperCase() + s.slice(1);

  // 🔥 SORT FUNCTION (NEW)
  const sortByLatest = (arr) =>
    [...arr].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt);
      const timeB = new Date(b.updatedAt || b.createdAt);
      return timeB - timeA;
    });

  return (
    <div className="h-full overflow-y-auto text-white">
      <div className="page-shell">

        <h1 className="page-title mb-2">Requests</h1>
        <p className="text-gray-300 mb-8">
          Manage incoming and outgoing skill exchange requests.
        </p>

        <div className="grid md:grid-cols-2 gap-8">

          {/* RECEIVED */}
          <div>
            <h2 className="text-lg mb-4 text-gray-300">Received</h2>

            {received.length === 0 && (
              <p className="text-gray-500 text-sm">No received requests</p>
            )}

            {sortByLatest(received).map((r) => (
              <div
                key={r._id}
                className="glass-card p-5 mb-4"
              >
                <p className="text-sm text-gray-400">
                  From: {r.from?.name}
                </p>

                <p className="text-xs text-gray-500 mb-2">
                  {r.from?.email}
                </p>

                <p className="text-sm mb-2">
                  Status:{" "}
                  <span
                    className={
                      r.status === "accepted"
                        ? "text-emerald-400"
                        : r.status === "declined"
                          ? "text-red-400"
                          : "text-amber-400"
                    }
                  >
                    {formatStatus(r.status)}
                  </span>
                </p>

                {r.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateRequest(r._id, "accepted")}
                      className="px-4 py-1.5 rounded-full text-sm bg-emerald-600 hover:bg-emerald-500 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => updateRequest(r._id, "declined")}
                      className="px-4 py-1.5 rounded-full text-sm bg-red-600 hover:bg-red-500 transition"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {r.status === "accepted" && (
                  <button
                    onClick={() => navigate(`/chat/${r.from._id}`)}
                    className="mt-4 btn-primary px-4 py-2 text-sm"
                  >
                    Chat
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* SENT */}
          <div>
            <h2 className="text-lg mb-4 text-gray-300">Sent</h2>

            {sent.length === 0 && (
              <p className="text-gray-500 text-sm">No sent requests</p>
            )}

            {sortByLatest(sent).map((r) => (
              <div
                key={r._id}
                className="glass-card p-5 mb-4"
              >
                <p className="text-sm text-gray-400">
                  To: {r.to?.name}
                </p>

                <p className="text-xs text-gray-500 mb-2">
                  {r.to?.email}
                </p>

                <p className="text-sm mb-2">
                  Status:{" "}
                  <span
                    className={
                      r.status === "accepted"
                        ? "text-emerald-400"
                        : r.status === "declined"
                          ? "text-red-400"
                          : "text-amber-400"
                    }
                  >
                    {formatStatus(r.status)}
                  </span>
                </p>

                {r.status === "accepted" && (
                  <button
                    onClick={() => navigate(`/chat/${r.to._id}`)}
                    className="mt-4 btn-primary px-4 py-2 text-sm"
                  >
                    Chat
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Requests;
