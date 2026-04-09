require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const demoUsers = [
    {
      name: "Aarav Sharma",
      email: "aarav.demo@skillswap.app",
      skillPoints: 980,
      skillsOffered: ["React", "Node.js"],
      skillsWanted: ["UI Design"],
    },
    {
      name: "Priya Verma",
      email: "priya.demo@skillswap.app",
      skillPoints: 920,
      skillsOffered: ["Python", "Data Analysis"],
      skillsWanted: ["Public Speaking"],
    },
    {
      name: "Rohan Mehta",
      email: "rohan.demo@skillswap.app",
      skillPoints: 870,
      skillsOffered: ["Java", "Spring"],
      skillsWanted: ["System Design"],
    },
    {
      name: "Neha Kapoor",
      email: "neha.demo@skillswap.app",
      skillPoints: 830,
      skillsOffered: ["Figma", "UX Research"],
      skillsWanted: ["Frontend"],
    },
    {
      name: "Ishaan Gupta",
      email: "ishaan.demo@skillswap.app",
      skillPoints: 790,
      skillsOffered: ["DevOps", "Docker"],
      skillsWanted: ["Kubernetes"],
    },
  ];

  for (const user of demoUsers) {
    await User.updateOne(
      { email: user.email },
      {
        $set: {
          name: user.name,
          skillPoints: user.skillPoints,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
        },
        $setOnInsert: {
          password: "demo-not-login",
        },
      },
      { upsert: true }
    );
  }

  const top = await User.find({}, "name email skillPoints")
    .sort({ skillPoints: -1 })
    .limit(10);

  console.log("Leaderboard seed complete. Top users:");
  top.forEach((u, idx) => {
    console.log(`${idx + 1}. ${u.name} (${u.email}) - ${u.skillPoints || 0}`);
  });

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
