import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    // 🔥 VALIDATION
    if (!form.email.trim() || !form.password.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        // reload fix
        window.location.href = "/discover";
      } else {
        alert(data.message);
      }

    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md glass-card p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-300 mb-2 text-center">
          SkillSwap
        </p>
        <h2 className="text-3xl font-semibold mb-2 text-center tracking-tight">
          Welcome back
        </h2>
        <p className="text-gray-300 text-sm text-center mb-7">
          Continue your skill exchange journey.
        </p>

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          className="modern-input mb-4"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="modern-input mb-6"
        />

        <button onClick={handleLogin} className="btn-primary w-full py-3">
          Log in
        </button>

        <p className="text-sm text-gray-400 mt-5 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
