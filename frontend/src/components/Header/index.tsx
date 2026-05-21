import { useLocation } from "react-router-dom";
import styles from "./Header.module.css"

export default function Header() {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname === "/") return "My Decks";
    if (pathname === "/login") return "Login";
    if (pathname === "/users") return "User Management";
    if (pathname === "/register") return "Create Account";
    if (pathname === "/decks/create") return "Create Deck"
    if (pathname === "/decks/import") return "Import Deck"
    if (pathname === "/decks/all") return "All Decks"
    if (pathname === "/settings") return "Settings"

    if (pathname.startsWith("/play")) return "Study Session";
    if (pathname.startsWith("/edit")) return "Deck Editor";

    return "Workspace";
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <div className={styles.headerMain}>
      <h1>{currentTitle}</h1>
    </div>
  );
}
