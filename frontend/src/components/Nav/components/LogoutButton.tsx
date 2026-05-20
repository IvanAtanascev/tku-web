import { useNavigate } from "react-router-dom";
import styles from "../Nav.module.css";
import toast from "react-hot-toast";
import LogoutIcon from "@/assets/icons/logout-box-line.svg?react";

interface LogoutButtonProps {
  logoutCallback: () => void;
  isExpanded: boolean;
}

export default function LogoutButton({
  logoutCallback,
  isExpanded,
}: LogoutButtonProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      logoutCallback();
      toast.success("logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("failed to logout", error);
      toast.error("something went wrong");
    }
  };

  return (
    <button className={styles.navButton} onClick={handleLogout}>
      <LogoutIcon className={styles.menuIcon} />
          <div className={`${styles.menuText} ${!isExpanded ? styles.collapsed : null}`}>Log out</div>
    </button>
  );
}
