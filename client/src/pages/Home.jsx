import { Link } from "react-router-dom";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen text-white">
      <section className="page-shell pt-20 pb-12 text-center">
        <p className="inline-flex px-3 py-1 rounded-full text-xs tracking-[0.16em] uppercase border border-blue-500/30 bg-blue-500/10 text-blue-300">
          Skill exchange community
        </p>

        <h1 className="mt-6 text-5xl md:text-7xl font-semibold leading-[1.06] tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            Learn.
          </span>{" "}
          Teach.
          <br />
          Connect.
        </h1>

        <p className="text-gray-300 text-lg max-w-2xl mx-auto mt-6 leading-8">
          SkillSwap helps you trade real skills with real people. Offer what
          you know, discover what you want to learn, and collaborate instantly.
        </p>

        <div className="flex justify-center gap-3 mt-10 flex-wrap">
          {user ? (
            <Link to="/discover" className="btn-primary px-7 py-3">
              Get Started
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn-primary px-7 py-3">
                Create Account
              </Link>
              <Link to="/login" className="btn-subtle px-7 py-3">
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="page-shell pt-6 grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Skill Matching",
            desc: "Find people who offer what you need and need what you can teach.",
          },
          {
            title: "Realtime Chat",
            desc: "Discuss goals and sessions instantly before you start learning.",
          },
          {
            title: "Request Workflow",
            desc: "Send, accept, and manage exchanges with simple status tracking.",
          },
        ].map((item) => (
          <div key={item.title} className="glass-card p-6 hover:scale-[1.01] transition">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-300 leading-7">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="page-shell pt-8 pb-20">
        <div className="glass-card p-8 md:p-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { step: "01", title: "Create Profile", desc: "Add what you can teach and what you want to learn." },
              { step: "02", title: "Discover People", desc: "Browse profiles and filter by skills you care about." },
              { step: "03", title: "Start Exchanging", desc: "Chat, plan sessions, and connect through video calls." },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-gray-700/80 p-5 bg-gray-900/50">
                <p className="text-blue-300 text-sm tracking-[0.2em]">{item.step}</p>
                <h4 className="font-semibold text-lg mt-2">{item.title}</h4>
                <p className="text-gray-300 text-sm mt-2 leading-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
