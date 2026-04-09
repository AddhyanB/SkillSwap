import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function Call() {
  const { roomId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [giveExtraPoints, setGiveExtraPoints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const hadRemoteParticipantRef = useRef(false);

  const otherUserId = useMemo(() => {
    if (!roomId || !user?.id) return "";
    const ids = roomId.split("_");
    return ids.find((id) => id !== user.id) || "";
  }, [roomId, user?.id]);

  useEffect(() => {
    const appID = 179043932; // 🔁 replace
    const serverSecret = "566ecd80428fd968a4618c9a657de73e"; // 🔁 replace

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      user.id,
      user.name
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: document.getElementById("video-call"),
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      onUserJoin: (users) => {
        if (Array.isArray(users) && users.some((u) => u.userID !== user.id)) {
          hadRemoteParticipantRef.current = true;
        }
      },
      onUserLeave: (users) => {
        if (
          hadRemoteParticipantRef.current &&
          Array.isArray(users) &&
          users.some((u) => u.userID !== user.id)
        ) {
          setShowFeedbackModal(true);
        }
      },
      onLeaveRoom: () => {
        setShowFeedbackModal(true);
      },
    });
  }, [roomId, user.id, user.name]);

  useEffect(() => {
    if (!otherUserId) return;

    fetch(
      `http://localhost:5000/api/auth/call-feedback-status/${roomId}/${user.id}/${otherUserId}`
    )
      .then((res) => res.json())
      .then((data) => setAlreadySubmitted(Boolean(data?.submitted)))
      .catch(() => {});
  }, [roomId, user.id, otherUserId]);

  const submitFeedback = async () => {
    if (!otherUserId) {
      alert("Unable to identify the other user in this call.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/call-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          from: user.id,
          to: otherUserId,
          rating,
          feedback,
          giveExtraPoints,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to submit feedback");
        return;
      }

      setAlreadySubmitted(true);
      alert(
        `Feedback submitted. ${
          giveExtraPoints ? "30" : "20"
        } points awarded to the other user.`
      );
    } catch {
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-black p-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-800">
        <div id="video-call" className="w-full h-full min-h-[64vh]" />
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-xl border border-gray-700 bg-gray-900 p-4 md:p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">End Call Feedback</h2>
              <button
                className="text-sm text-gray-300 hover:text-white"
                onClick={() => setShowFeedbackModal(false)}
              >
                Close
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              Default points: 20 | Extra points option: +10
            </p>

            <div className="grid md:grid-cols-[140px_1fr_auto] gap-3 items-center">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="modern-input py-2"
                  disabled={alreadySubmitted}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Bad</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-1">Feedback</label>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share quick feedback..."
                  className="modern-input py-2"
                  disabled={alreadySubmitted}
                />
              </div>

              <button
                onClick={submitFeedback}
                disabled={submitting || alreadySubmitted}
                className={`btn-primary px-6 py-2.5 ${
                  alreadySubmitted ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {alreadySubmitted ? "Submitted" : submitting ? "Submitting..." : "Submit"}
              </button>
            </div>

            <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={giveExtraPoints}
                onChange={(e) => setGiveExtraPoints(e.target.checked)}
                disabled={alreadySubmitted}
              />
              Give extra skill points (+10) to this user
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default Call;
