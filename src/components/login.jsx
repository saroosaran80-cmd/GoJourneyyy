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

    } catch (err) {  // ✅ Inga thaan '}' add panniruken!
      console.error(err);
      setError("❌ Backend server not reachable");
    } finally {
      setLoading(false);
    }
  };

