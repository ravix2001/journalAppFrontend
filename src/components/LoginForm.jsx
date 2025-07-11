import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigate , Link } from "react-router-dom";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  // Base API URL
  const API_BASE_URL = "https://journalapp-latest.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        {
          username,
          password,
        }
      );
      const { token, role } = response.data;

      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      navigate("/dashboard");

      // // 🚨 This is the redirect based on role
      // if (role === "ROLE_ADMIN") {
      //   navigate("/admin");
      // } else {
      //   navigate("/dashboard");
      // }

    } catch (error) {
      console.error("Authentication failed:", error);
      setToken(null);
      localStorage.removeItem("token");
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      className="card shadow p-4 mx-auto"
      style={{ minWidth: 350, maxWidth: 400, width: "100%", marginTop: "10vh" }}
    >
      <h2 className="mb-4 text-center fw-bold">Log In</h2>
      {errorMessage && (
        <div className="alert alert-danger py-2">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3 text-start">
          <label className="form-label px-1">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoFocus
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
        <button type="submit" className="btn btn-primary w-100 fw-bold">
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
