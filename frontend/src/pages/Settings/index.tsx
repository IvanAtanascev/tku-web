import type { UserSettings } from "@/types/UserSettings";
import React, { useEffect, useState } from "react";
import styles from "./Settings.module.css";

export default function Settings() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleGetUserSettings = async () => {
    try {
      const response = await fetch(`/api/users/settings`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to get user settings");
      }

      const data = await response.json();
      const settings: UserSettings = data;
      setUserSettings(settings);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnChangeSettings = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    option: "language" | "theme",
  ) => {
    try {
      const response = await fetch(`/api/users/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uiLang: option === "language" ? e.target.value : userSettings?.uiLang,
          theme: option === "theme" ? e.target.value : userSettings?.theme,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "updating settings failed");
      }
      await handleGetUserSettings();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetUserSettings();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="pageContainer">
      <div className={styles.settingsContainer}>
        <div className={styles.itemContainer}>
          <label className={styles.settingsLabel} htmlFor="language">
            <h2>Language</h2>
          </label>
            <select
              className={styles.settingsSelect}
              id="language"
              value={userSettings?.uiLang}
              onChange={(e) => {
                handleOnChangeSettings(e, "language");
              }}
            >
              <option value={"czech"}>Čeština</option>
              <option value={"english"}>English</option>
            </select>
        </div>
        <div className={styles.itemContainer}>
          <label className={styles.settingsLabel} htmlFor="theme">
            <h2>Theme</h2>
          </label>
            <select
              className={styles.settingsSelect}
              id="theme"
              value={userSettings?.theme}
              onChange={(e) => {
                handleOnChangeSettings(e, "theme");
              }}
            >
              <option value={"light"}>Light</option>
              <option value={"dark"}>Dark</option>
            </select>
        </div>
      </div>
    </div>
  );
}
