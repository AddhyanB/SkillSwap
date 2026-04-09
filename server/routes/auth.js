const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Request = require("../models/Request");
const Message = require("../models/Message");
const CallFeedback = require("../models/CallFeedback");

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EXCHANGE_POINTS = 20;
const EXTRA_POINTS = 10;
const pad = (n) => String(n).padStart(2, "0");
const toDateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

async function markUserActivity(userId, points = 1) {
  if (!userId) return;

  const todayKey = toDateKey(new Date());

  await User.updateOne(
    { _id: userId },
    { $inc: { [`activityLog.${todayKey}`]: points } }
  );
}

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      skillsOffered: [],
      skillsWanted: [],
      skillPoints: 0,
    });

    await user.save();

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillPoints: user.skillPoints || 0,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= PROFILE =================
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.json({
      skillsOffered: user.skillsOffered || [],
      skillsWanted: user.skillsWanted || [],
    });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

router.post("/profile", async (req, res) => {
  try {
    const { userId, skillsOffered, skillsWanted } = req.body;

    await User.findByIdAndUpdate(userId, {
      skillsOffered,
      skillsWanted,
    });

    res.json({ message: "Profile updated" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// ================= USERS =================
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// ================= LEADERBOARD =================
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find(
      {},
      "name email skillsOffered skillsWanted skillPoints"
    ).sort({ skillPoints: -1, name: 1 });

    const leaderboard = users.map((u, idx) => {
      const safeName =
        (u.name && String(u.name).trim()) ||
        (u.email && String(u.email).split("@")[0]) ||
        "User";
      return {
        rank: idx + 1,
        id: u._id,
        name: safeName,
        email: u.email,
        skillPoints: Number(u.skillPoints || 0),
        skillsOffered: u.skillsOffered || [],
        skillsWanted: u.skillsWanted || [],
      };
    });

    // Stable sort by name for tied points.
    leaderboard.sort((a, b) => {
      if (b.skillPoints !== a.skillPoints) return b.skillPoints - a.skillPoints;
      const aName = String(a.name || "").toLowerCase();
      const bName = String(b.name || "").toLowerCase();
      return aName.localeCompare(bName);
    });

    leaderboard.forEach((u, i) => {
      u.rank = i + 1;
    });

    res.json(leaderboard);
  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// ================= REQUESTS =================

// SEND REQUEST (FIXED 🔥)
router.post("/send-request", async (req, res) => {
  try {
    const { from, to } = req.body;

    const existing = await Request.findOne({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    });

    if (existing) {
      // ✅ already connected
      if (existing.status === "accepted") {
        return res.json({ message: "Already connected" });
      }

      // ✅ already pending
      if (existing.status === "pending") {
        return res.json({ message: "Request already pending" });
      }

      // 🔥 FIX: if declined → update direction
      if (existing.status === "declined") {
        existing.from = from;
        existing.to = to;
        existing.status = "pending";

        await existing.save();

        return res.json({ message: "Request sent again" });
      }
    }

    const request = new Request({ from, to });
    await request.save();

    res.json({ message: "Request sent" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// GET REQUESTS
router.get("/requests/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sent = await Request.find({ from: userId })
      .populate("to", "name email");

    const received = await Request.find({ to: userId })
      .populate("from", "name email");

    res.json({ sent, received });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// UPDATE REQUEST
router.post("/update-request", async (req, res) => {
  try {
    const { requestId, status } = req.body;

    await Request.findByIdAndUpdate(requestId, { status });

    res.json({ message: "Request updated" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// ================= CHAT USERS =================
router.get("/chat-users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const requests = await Request.find({
      status: "accepted",
      $or: [{ from: userId }, { to: userId }],
    })
      .populate("from", "name email")
      .populate("to", "name email");

    const usersMap = new Map();

    requests.forEach((r) => {
      const other =
        r.from._id.toString() === userId ? r.to : r.from;

      usersMap.set(other._id.toString(), other);
    });

    res.json(Array.from(usersMap.values()));

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// ================= MESSAGES =================

// SEND MESSAGE
router.post("/send-message", async (req, res) => {
  try {
    const { from, to, text } = req.body;

    const message = new Message({ from, to, text });
    await message.save();

    res.json({ message: "Sent" });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// GET MESSAGES
router.get("/messages/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

async function clearChatHandler(req, res) {
  try {
    const { user1, user2, from, to } = req.body;
    const a = user1 || from;
    const b = user2 || to;

    if (!a || !b) {
      return res.status(400).json({ message: "Both users are required" });
    }

    await Message.deleteMany({
      $or: [
        { from: a, to: b },
        { from: b, to: a },
      ],
    });

    res.json({ message: "Chat cleared" });
  } catch {
    res.status(500).json({ message: "Error" });
  }
}

// CLEAR CHAT BETWEEN TWO USERS
router.post("/clear-chat", clearChatHandler);
router.post("/delete-chat", clearChatHandler);

// ================= NOTIFICATIONS =================

// TOTAL UNREAD
router.get("/unread/:userId", async (req, res) => {
  const count = await Message.countDocuments({
    to: req.params.userId,
    seen: false,
  });

  res.json({ count });
});

// PER USER UNREAD
router.get("/unread-user/:me/:other", async (req, res) => {
  const { me, other } = req.params;

  const count = await Message.countDocuments({
    from: other,
    to: me,
    seen: false,
  });

  res.json({ count });
});

// MARK AS SEEN
router.post("/mark-seen", async (req, res) => {
  const { from, to } = req.body;

  await Message.updateMany(
    { from, to, seen: false },
    { seen: true }
  );

  res.json({ message: "Seen updated" });
});

// ================= CALL FEEDBACK / POINTS =================
router.get("/call-feedback-status/:roomId/:from/:to", async (req, res) => {
  try {
    const { roomId, from, to } = req.params;

    const existing = await CallFeedback.findOne({ roomId, from, to });
    res.json({ submitted: Boolean(existing) });
  } catch {
    res.status(500).json({ message: "Error" });
  }
});

router.post("/call-feedback", async (req, res) => {
  try {
    const {
      roomId,
      from,
      to,
      rating,
      feedback,
      giveExtraPoints,
    } = req.body;

    if (!roomId || !from || !to) {
      return res.status(400).json({ message: "roomId, from and to are required" });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const already = await CallFeedback.findOne({ roomId, from, to });
    if (already) {
      return res.status(400).json({ message: "Feedback already submitted for this call" });
    }

    const pointsAwarded =
      DEFAULT_EXCHANGE_POINTS + (giveExtraPoints ? EXTRA_POINTS : 0);

    await CallFeedback.create({
      roomId,
      from,
      to,
      rating: parsedRating,
      feedback: String(feedback || "").trim(),
      giveExtraPoints: Boolean(giveExtraPoints),
      pointsAwarded,
    });

    await Promise.all([
      User.updateOne({ _id: to }, { $inc: { skillPoints: pointsAwarded } }),
      markUserActivity(to, 1),
    ]);

    res.json({
      message: "Feedback submitted",
      pointsAwarded,
    });
  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// ================= ACTIVITY / HEATMAP =================
router.get("/activity/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("activityLog");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const mergedLog = user.activityLog ? Object.fromEntries(user.activityLog) : {};

    const today = startOfDay(new Date());
    const rangeDays = 182; // ~26 weeks like LeetCode compact view
    const start = new Date(today);
    start.setDate(start.getDate() - (rangeDays - 1));

    const days = [];
    let totalContributions = 0;

    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(start.getTime() + i * DAY_MS);
      const key = toDateKey(d);
      const count = Number(mergedLog[key] || 0);
      days.push({ date: key, count });
      totalContributions += count;
    }

    const activeKeys = Object.keys(mergedLog)
      .filter((k) => Number(mergedLog[k]) > 0)
      .sort();

    let longestStreak = 0;
    let running = 0;
    let prevDate = null;

    for (const key of activeKeys) {
      const [y, m, day] = key.split("-").map(Number);
      const d = startOfDay(new Date(y, m - 1, day));

      if (!prevDate) {
        running = 1;
      } else {
        const diff = (d.getTime() - prevDate.getTime()) / DAY_MS;
        running = diff === 1 ? running + 1 : 1;
      }

      if (running > longestStreak) longestStreak = running;
      prevDate = d;
    }

    let currentStreak = 0;
    const cursor = new Date(today);

    while (true) {
      const key = toDateKey(cursor);
      const count = Number(mergedLog[key] || 0);
      if (count <= 0) break;
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    res.json({
      days,
      currentStreak,
      longestStreak,
      totalContributions,
    });
  } catch {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
