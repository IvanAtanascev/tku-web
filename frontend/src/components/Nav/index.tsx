import { Link } from "react-router-dom";
import LogoutButton from "./components/LogoutButton";
import styles from "./Nav.module.css";
import type { User } from "../../types/User";
import { useState, type JSX } from "react";
import MyDecksIcon from "@/assets/icons/home-heart-line.svg?react";
import AllDecksIcon from "@/assets/icons/file-search-line.svg?react";
import CreateDeckIcon from "@/assets/icons/add-box-line.svg?react";
import ImportDeckIcon from "@/assets/icons/contacts-book-upload-line.svg?react";
import UserListIcon from "@/assets/icons/file-user-line.svg?react";
import FoldIcon from "@/assets/icons/menu-fold-line.svg?react";
import UnfoldIcon from "@/assets/icons/menu-unfold-line.svg?react"

interface NormalUserProps {
  logoutCallback: () => void;
  isExpanded: boolean;
}

interface AdminUserPorps {
  isExpanded: boolean;
}

interface NavProps {
  user: User | null;
  logoutCallback: () => void;
}

function NormalUserButtons({
  logoutCallback,
  isExpanded,
}: NormalUserProps): JSX.Element {
  return (
    <>
      <Link style={{ textDecoration: "none" }} to="/">
        <button className={styles.navButton}>
          <MyDecksIcon className={styles.menuIcon} />
          <div className={`${styles.menuText} ${!isExpanded ? styles.collapsed : null}`}>My Decks</div>
        </button>
      </Link>
      <Link style={{ textDecoration: "none" }} to="/decks/all">
        <button className={styles.navButton}>
          <AllDecksIcon className={styles.menuIcon} />
          <div className={`${styles.menuText} ${!isExpanded ? styles.collapsed : null}`}>All Decks</div>
        </button>
      </Link>
      {/*<Link to="/settings">
        <button className={styles.navButton}>Settings</button>
        </Link>*/}
      <Link style={{ textDecoration: "none" }} to="/decks/create">
        <button className={styles.navButton}>
          <CreateDeckIcon className={styles.menuIcon} />
          <div className={`${styles.menuText} ${!isExpanded ? styles.collapsed : null}`}>Create Deck</div>
        </button>
      </Link>
      <Link style={{ textDecoration: "none" }} to="/decks/import">
        <button className={styles.navButton}>
          <ImportDeckIcon className={styles.menuIcon} />
          <div className={`${styles.menuText} ${!isExpanded ? styles.collapsed : null}`}>Import Deck</div>
        </button>
      </Link>
      <LogoutButton logoutCallback={logoutCallback} isExpanded={isExpanded} />
    </>
  );
}

function AdminUserButtons({ isExpanded }: AdminUserPorps): JSX.Element {
  return (
    <>
      <Link style={{ textDecoration: "none" }} to="/users">
        <button className={styles.navButton}>
          <UserListIcon className={styles.menuIcon} />
          <div className={`${styles.menuText} ${!isExpanded ? styles.collapsed : null}`}>User List</div>
        </button>
      </Link>
    </>
  );
}

export default function Nav({ logoutCallback, user }: NavProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const handleNavWidthToggle = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div
      className={`${styles.navigationContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}
    >
      <button className={styles.navButton} onClick={handleNavWidthToggle}>
        {isExpanded ? <FoldIcon className={styles.menuIcon} /> : <UnfoldIcon className={styles.menuIcon} />}
      </button>
      {user === null ? (
        <Link to="/register">
          <button className={styles.navButton}>Make an account</button>
        </Link>
      ) : user.role === "ADMIN" ? (
        <AdminUserButtons isExpanded={isExpanded} />
      ) : null}
      {user === null ? null : (
        <NormalUserButtons
          isExpanded={isExpanded}
          logoutCallback={logoutCallback}
        />
      )}
    </div>
  );
}
