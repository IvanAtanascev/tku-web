import { createContext, useContext, useState, type ReactNode } from "react";
import styles from "./ConfirmAlert.module.css";

type ConfirmContextType = {
  confirm: (message: string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (msg: string): Promise<boolean> => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver({ resolve });
    });
  };

  const handleConfirm = () => {
    if (resolver) resolver.resolve(true);
    setIsOpen(false);
    setMessage("");
  };

  const handleCancel = () => {
    if (resolver) resolver.resolve(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>{message}</p>
            <div className={styles.buttonGroup}>
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleConfirm} className={styles.dangerBtn}>
                Yes, I'm sure
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context)
    throw new Error("useConfirm must be used within a ConfirmProvider");
  return context.confirm;
};
