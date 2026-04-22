import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GameLoop from "./pages/GameLoop";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import DeckEdit from "./components/DeckEdit";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import { useEffect, useState } from "react";

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
        <Nav
          logoutCallback={() => {
            setUser(null);
          }}
        />
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

          <Route
            path="*"
            element={<h2 style={{ padding: "2rem" }}>404 - Page Not Found</h2>}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
