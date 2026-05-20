import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GameLoop from "./pages/GameLoop";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import DeckEdit from "./components/DeckEdit";
import { Toaster } from "react-hot-toast";
import Register from "./pages/Register";
import { useEffect, useState } from "react";
import UserListDashboard from "./pages/UserListDashboard";
import { ConfirmProvider } from "./components/ConfirmContext";
import type { User } from "@/types/User";
import Header from "./components/Header";
import MyDecks from "./pages/MyDecks";
import AllDecks from "./pages/AllDecks";
import Settings from "./pages/Settings";
import CreateNewDeck from "./pages/CreateNewDeck";
import ImportDeck from "./pages/ImportDeck";

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
        <ConfirmProvider>
          {user && (
            <Nav
              user={user}
              logoutCallback={() => {
                setUser(null);
              }}
            />
          )}
          <div className="rest-container">
            <Header user={user} />
            <div className="content-container">
              <Routes>
                <Route
                  path="/"
                  element={
                    user ? <MyDecks user={user} /> : <Navigate to="/login" />
                  }
                />
                {user ? (
                  user.role === "ADMIN" ? (
                    <Route path="/users" element={<UserListDashboard />} />
                  ) : null
                ) : null}
                <Route path="/play/:deckId" element={<GameLoop />} />

                <Route path="/edit/:deckId" element={<DeckEdit />} />

                <Route path="/login" element={<Login setUser={setUser} />} />

                <Route path="/register" element={<Register />} />

                {user ? (
                  <>
                    <Route path="/decks/create" element={<CreateNewDeck />} />
                    <Route
                      path="/decks/all"
                      element={<AllDecks user={user} />}
                    />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/decks/import" element={<ImportDeck />} />
                  </>
                ) : null}
              </Routes>
            </div>
          </div>
        </ConfirmProvider>
      </BrowserRouter>
    </>
  );
}
