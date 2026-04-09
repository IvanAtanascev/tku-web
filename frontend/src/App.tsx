import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import GameLoop from "./pages/GameLoop";
import Login from "./pages/Login";
import CreateDeck from "./pages/CreateDeck";
import DeckEdit from "./components/DeckEdit";
import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import Register from "./pages/Register";
import LogoutButton from "./components/LogoutButton";
import { useEffect, useState } from "react";

// A quick placeholder component for your dashboard so the home page isn't blank

interface User {
  id: number;
  username: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/users/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  if (isCheckingSession) {
    return <div> loading...</div>;
  }
  return (
    <>
      <BrowserRouter>
        <Toaster />
        <LogoutButton
          logoutCallback={() => {
            setUser(null);
          }}
        />
        <Link to="/">Home</Link>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Dashboard userId={user.id} /> : <Navigate to="/login" />
            }
          />

          <Route path="/play/:deckId" element={<GameLoop />} />

          <Route path="/edit/:deckId" element={<DeckEdit />} />

          <Route path="/login" element={<Login setUser={setUser} />} />

          <Route path="/register" element={<Register />} />

          <Route path="/create/deck" element={<CreateDeck />} />

          <Route
            path="*"
            element={<h2 style={{ padding: "2rem" }}>404 - Page Not Found</h2>}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
