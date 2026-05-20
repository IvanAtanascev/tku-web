import type React from "react";
import styles from "./ImportDeck.module.css";
import toast from "react-hot-toast";

export default function ImportDeck() {
  const handleImportDeck = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const importString = formData.get("importcsv") as string;

    const payload: any = {};
    if (importString) payload.importString = importString;

    if (Object.keys(payload).length === 0) return;

    try {
      const response = await fetch(`/api/decks/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("failed to import deck");
      }

      toast.success("Deck imported!");
    } catch (error) {
      toast.error("Something went wrong!");
      console.log(error);
    }
  };

  return (
    <div className="pageContainer">
      <form className={styles.importForm} onSubmit={handleImportDeck}>
      <textarea name="importcsv" placeholder="CSV formatted deck..." />
      <button type="submit">Import deck</button>
    </form>
    </div>
  );
}
