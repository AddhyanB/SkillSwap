import { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async () => {
    // 🔥 VALIDATION
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    if (form.password.length < 4) {
      alert("Password must be at least 4 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful");

        // redirect to login
        window.location.href = "/login";
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
          Join SkillSwap
        </p>
        <h2 className="text-3xl font-semibold mb-2 text-center tracking-tight">
          Create your account
        </h2>
        <p className="text-gray-300 text-sm text-center mb-7">
          Set up your profile and start exchanging skills.
        </p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="modern-input mb-4"
        />

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

        <button onClick={handleSignup} className="btn-primary w-full py-3">
          Create Account
        </button>

        <p className="text-sm text-gray-400 mt-5 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
