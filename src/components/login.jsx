import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./login.css";

const API_URL = "https://gojourneyyy-0hwx.onrender.com";

export default function Login({ onShowRegister }) {
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

      const res = await fetch(`${API_URL}/login`, {
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

      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
      };

      localStorage.setItem("gj_user", JSON.stringify(userData));

      alert("✅ Login successful");

      const dest = location.state?.from || "/profile";
      navigate(dest);

    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend server.");
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

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          New user?{" "}
          <span
            className="link-text"
            onClick={() => {
              if (typeof onShowRegister === "function") {
                onShowRegister();
              } else {
                navigate("/signup");
              }
            }}
          >
            Click here
          </span>
        </p>
      </div>
    </div>
  );
}
      // save user details to localStorage so profile page can read them
      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone || ''
      };
      localStorage.setItem('gj_user', JSON.stringify(userData));

      alert("Login successful ✅");
      console.log("Logged user:", userData);

      // redirect to where the user intended to go (or default to profile)
      let dest = location.state?.from || '/profile';
      // if 'from' was passed as an object with pathname & state, use navigate accordingly
      if (typeof dest === 'object' && dest !== null) {
        navigate(dest);
      } else {
        navigate(dest);
      }

    } catch (err) {
      console.error(err);
      setError("❌ Backend server not running");
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

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          New user?{" "}
          <span
            className="link-text"
            onClick={() => {
              if (typeof onShowRegister === 'function') return onShowRegister();
              navigate('/signup');
            }}
          >
            Click here
          </span>
        </p>
      </div>
    </div>
  );
}
