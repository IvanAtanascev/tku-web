import { Link } from "react-router-dom";
import type { Deck } from "../types/Deck";
import styles from "./DisplayFavoriteDecks.module.css";

interface DisplayFavoriteDecksProps {
  decks: Deck[];
  userId: number;
  unfavoriteCallback: () => void;
}

export default function DisplayFavoriteDecks({
  decks,
  userId,
  unfavoriteCallback,
}: DisplayFavoriteDecksProps) {
  const handleUnfavoriteClick = async (deckId: number) => {
    try {
      const response = await fetch(`/api/decks/favorite/${deckId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "unfavoriting deck failed");
      }
      unfavoriteCallback();
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
              <h2>{`${deck.name}`}</h2>
            </div>
            <div className={styles.actions}>
              <Link to={`/play/${deck.id}`}>
                <button>Play</button>
              </Link>
              {deck.authorId === userId ? (
                <Link to={`/edit/${deck.id}`}>
                  <button>Edit deck</button>
                </Link>
              ) : null}
              <button
                onClick={() => {
                  handleUnfavoriteClick(deck.id);
                }}
              >
                Unfavorite
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
