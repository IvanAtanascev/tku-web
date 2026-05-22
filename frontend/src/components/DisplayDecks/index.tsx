import type { User } from "@/types/User";
import type { Deck } from "../../types/Deck";
import styles from "../DisplayFavoriteDecks/DisplayFavoriteDecks.module.css";
import { useConfirm } from "../ConfirmContext";
import FavoriteIcon from "@/assets/icons/heart-line.svg?react"
import DeleteIcon from "@/assets/icons/delete-bin-line.svg?react"
import toast from "react-hot-toast";

interface DisplayDecksProps {
  decks: Deck[];
  user: User;
  favoriteCallback: () => void;
}

export default function DisplayDecks({
  decks,
  user,
  favoriteCallback,
}: DisplayDecksProps) {
  const confirm = useConfirm();
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
      toast.success("Added deck to favorites")
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteDeck = async (deckId: number) => {
    const isConfirmed = await confirm(
      `Are you sure you to delete the deck with id: ${deckId}`,
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
        credentials: "include",
      });


      if (!response.ok) {
        throw new Error("deleting deck failed");
      }
      favoriteCallback();
      toast.success("Successfully deleted deck")
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
            <div className={styles.cardDescription}>{deck.description}</div>
            <div className={styles.actions}>
              <button onClick={() => handleFavoriteClick(deck.id)}>
                <FavoriteIcon className={styles.icon} />
              </button>
              {user.role === "ADMIN" ? (
                <button
                  onClick={() => {
                    handleDeleteDeck(deck.id);
                  }}
                >
                  <DeleteIcon className={styles.icon} />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
