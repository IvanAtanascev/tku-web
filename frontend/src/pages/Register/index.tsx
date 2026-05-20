import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "login failed");
      }
      navigate("/login");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="pageContainer">
      <div className={styles.registerContainer}>
        <h2>Register</h2>
        <form onSubmit={handleRegister} className={styles.registerFields}>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>

        <div className={styles.cto}>
          <p>Already have an account?</p>
          <Link to="/login">
            <button>Log In</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
