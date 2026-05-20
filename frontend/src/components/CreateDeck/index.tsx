import { useState, type SyntheticEvent } from "react";
import styles from "./CreateDeck.module.css";

interface CreateDeckProps {
  refreshTrigger?: () => void;
  afterCreateDeckCallback?: (deckId: number) => void;
}

export default function CreateDeck({
  refreshTrigger,
  afterCreateDeckCallback,
}: CreateDeckProps) {
  const [deckName, setDeckName] = useState<string>("");
  const [deckDescription, setDeckDeckdescription] = useState<string>("");

  const handleCreateDeck = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: deckName, description: deckDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "creating deck failed");
      }

      setDeckName("");
      setDeckDeckdescription("");

      if (refreshTrigger) refreshTrigger();
      if (afterCreateDeckCallback) afterCreateDeckCallback(data.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleCreateDeck} className={styles.form}>
        <input
          type="text"
          placeholder="Deck name"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Deck description"
          value={deckDescription}
          onChange={(e) => setDeckDeckdescription(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit">Create Deck</button>
      </form>
    </div>
  );
}
