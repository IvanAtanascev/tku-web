import { useEffect, useState } from "react";
import type { Card } from "../types/Card";
import type { Deck } from "../types/Deck";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import CreateCard from "./CreateCard";
import styles from "./DeckEdit.module.css";

export default function DeckEdit() {
  const { deckId } = useParams();
  const [deckName, setDeckName] = useState<String>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCards, setTotalCards] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPreviousPage] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPage((prev) => prev - 1);
  };

  const handleUpdateCard = async (
    e: React.SyntheticEvent<HTMLFormElement>,
    cardId: number,
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const original = formData.get("original") as string;
    const translation = formData.get("translation") as string;
    const description = formData.get("description") as string;

    const payload: any = {};
    if (original) payload.original = original;
    if (translation) payload.translation = translation;
    if (description) payload.description = description;

    if (Object.keys(payload).length === 0) return;
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("failed to update card");
      }

      const updatedCardFromServer = await response.json();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? updatedCardFromServer : card,
        ),
      );
      toast.success("card updated");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to delete card");
      }
      setRefreshTrigger((prev) => !prev);
      toast.success("card deleted");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(
          `/api/decks/${deckId}/cards?page=${page}&limit=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("failed to fetch cards");
        }
        const { data, meta } = await response.json();

        const cards: Card[] = data;
        setTotalPages(meta.totalPages);
        setTotalCards(meta.totalCards);
        setHasNextPage(meta.hasNextPage);
        setHasPreviousPage(meta.hasPrevPage);

        setCards(cards);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchDeckName = async () => {
      try {
        const response = await fetch(`/api/decks/${deckId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("failed to fetch deck name");
        }
        const name: Deck = await response.json();
        setDeckName(name.name);
      } catch (error) {
        console.log(error);
      }
    };

    const init = async () => {
      try {
        await fetchCards();
        await fetchDeckName();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [deckId, page, refreshTrigger]);

  if (isLoading) return <div>loading deck contents...</div>;

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.header}>{deckName}</h2>

      <div className={styles.cardList}>
        {deckId && (
          <CreateCard
            onCardCreated={() => setRefreshTrigger((prev) => !prev)}
            deckId={parseInt(deckId)}
          />
        )}

        {cards.map((card) => (
          <div key={card.id} className={styles.editorCard}>
            <form
              onSubmit={(e) => handleUpdateCard(e, card.id)}
              className={styles.form}
            >
              <div className={styles.fieldGroup}>
                <span className={styles.label}>Original</span>
                <div className={styles.currentValue}>{card.original}</div>
                <input
                  name="original"
                  placeholder="New original..."
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.label}>Translation</span>
                <div className={styles.currentValue}>{card.translation}</div>
                <input
                  name="translation"
                  placeholder="New translation..."
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.label}>Description</span>
                <div className={styles.currentValue}>{card.description}</div>
                <input
                  name="description"
                  placeholder="New description..."
                  // Applies both the base input style AND the larger descInput style
                  className={`${styles.input} ${styles.descInput}`}
                />
              </div>

              {/* Group the buttons together at the bottom! */}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteCard(card.id)}
                >
                  Delete
                </button>
                <button type="submit">Update</button>
              </div>
            </form>
          </div>
        ))}
      </div>

      {/* Reused your clean pagination design here! */}
      <div className={styles.pagination}>
        {hasPrevPage && (
          <button onClick={handlePrevPage}>&larr; Previous</button>
        )}

        <span className={styles.pageIndicator}>
          Page {page} / {totalPages}
        </span>

        {hasNextPage && <button onClick={handleNextPage}>Next &rarr;</button>}
      </div>
    </div>
  );
}
