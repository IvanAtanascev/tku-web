import { Link } from "react-router-dom";
import type { Deck } from "../../types/Deck";
import styles from "./DisplayFavoriteDecks.module.css";
import type { User } from "../../types/User";
import { useConfirm } from "../ConfirmContext";
import PlayIcon from "@/assets/icons/play-large-line.svg?react";
import EditIcon from "@/assets/icons/edit-box-line.svg?react";
import DeleteIcon from "@/assets/icons/delete-bin-line.svg?react";
import UnfavoriteIcon from "@/assets/icons/star-off-line.svg?react";
import toast from "react-hot-toast";

interface DisplayFavoriteDecksProps {
  decks: Deck[];
  user: User;
  unfavoriteCallback: () => void;
}

export default function DisplayFavoriteDecks({
  decks,
  user,
  unfavoriteCallback,
}: DisplayFavoriteDecksProps) {
  const confirm = useConfirm();

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
      toast.success(`Removed deck from favorites`);
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
            <div className={styles.cardDescription}>{deck.description}</div>
            <div className={styles.actions}>
              <Link to={`/play/${deck.id}`}>
                <button>
                  <PlayIcon className={styles.icon} />
                </button>
              </Link>
              {user.role === "ADMIN" || deck.authorId === user.id ? (
                <>
                  <Link to={`/edit/${deck.id}`}>
                    <button>
                      <EditIcon className={styles.icon} />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      handleDeleteDeck(deck.id);
                    }}
                  >
                    <DeleteIcon className={styles.icon} />
                  </button>
                </>
              ) : null}
              <button
                onClick={() => {
                  handleUnfavoriteClick(deck.id);
                }}
              >
                <UnfavoriteIcon className={styles.icon} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
