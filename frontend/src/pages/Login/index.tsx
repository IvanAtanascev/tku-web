import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "../../types/User";
import styles from "./Login.module.css";

interface LoginProps {
  setUser: (user: User) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "login failed");
      }

      setUser(data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="pageContainer">
      <div className={styles.loginContainer}>
        <h2>log in to your account</h2>

        <form className={styles.loginFields} onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div style={{ color: "red" }}>{error}</div>}

          <button type="submit">log in</button>
        </form>

        <div className={styles.cto}>
          <p>Don't have an account?</p>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
