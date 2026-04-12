import type { Deck } from "../types/Deck";
import styles from "./DisplayDecks.module.css";

interface DisplayDecksProps {
  decks: Deck[];
  favoriteCallback: () => void;
}

export default function DisplayDecks({
  decks,
  favoriteCallback,
}: DisplayDecksProps) {
  const handleFavoriteClick = async (deckId: number) => {
    try {
      const response = await fetch(`/api/decks/favorite/${deckId}`, {
        method: "POST",
        headers: {},
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to favorite decks");
      }

      favoriteCallback();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={styles.grid}>
      {decks.map((deck) => {
        return (
          <div key={deck.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>{deck.name}</h2>
            </div>
            <div className={styles.actions}>
              <button onClick={() => handleFavoriteClick(deck.id)}>
                Add to favorites
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
