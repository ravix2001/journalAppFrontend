import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Base API URL
  const API_BASE_URL = "https://journalapp-latest.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username,
        password,
        email,
      });
      setMessage(response.data.message || "Signup successful! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Signup failed. Please try again.";
      setError(errMsg);
    }
  };

  return (
    <div className="card shadow p-4" style={{ minWidth: 350, maxWidth: 400, width: "100%", margin: "10vh auto" }}>
      <h2 className="mb-4 text-center fw-bold">Sign Up</h2>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {message && <div className="alert alert-success py-2">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3 text-start">
          <label className="form-label px-1">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="mb-3 text-start">
          <label className="form-label px-1">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="mb-4 text-start">
          <label className="form-label px-1">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="btn btn-success w-100 fw-bold">
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center">
          Already have an account? <a href="/login">Log In</a>
        </p>
    </div>
  );
};

export default SignupForm;