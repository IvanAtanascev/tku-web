import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import styles from "./Nav.module.css"

interface NavProps {
  logoutCallback: () => void;
}
export default function Nav({ logoutCallback }: NavProps) {
  return (
    <div className={styles.navigationContainer}>
      <Link to="/">
        <button className={styles.navButton}>Home</button>
      </Link>
      <LogoutButton logoutCallback={logoutCallback} />
    </div>
  );
}
