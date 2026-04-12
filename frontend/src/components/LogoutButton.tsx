import { useNavigate } from "react-router-dom";
import styles from "./Nav.module.css"
import toast from "react-hot-toast";

interface LogoutButtonProps {
  logoutCallback: () => void;
}

export default function LogoutButton({ logoutCallback }: LogoutButtonProps) {
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
    <button
      className={styles.navButton}
      onClick={handleLogout}
    >
      log out
    </button>
  );
}
