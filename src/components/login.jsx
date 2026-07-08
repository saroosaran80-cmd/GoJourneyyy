import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./login.css";

const API = "https://gojourneyyy-0hwx.onrender.com";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem(
        "gj_user",
        JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        })
      );

      alert("✅ Login Successful");

      const dest = location.state?.from || "/profile";
      navigate(dest);

    } catch (err) {
      console.error(err);
      setError("❌ Backend server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          New user?{" "}
          <span
            className="link-text"
            onClick={() => navigate("/signup")}
          >
            Click here
          </span>
        </p>
      </div>
    </div>
  );
}
