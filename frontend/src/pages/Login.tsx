import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  role: string;
}

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
    <div
      style={{ maxWidth: "400px", margin: "4rem auto", textAlign: "center" }}
    >
      <h2>log in to your account</h2>

      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#4CAF50",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          log in
        </button>
      </form>
    </div>
  );
}
