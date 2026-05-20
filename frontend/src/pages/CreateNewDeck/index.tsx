import CreateCard from "@/components/CreateCard";
import CreateDeck from "@/components/CreateDeck";
import EditableCard from "@/components/EditableCard";
import Pagination from "@/components/Pagination";
import type { Card } from "@/types/Card";
import { useEffect, useState } from "react";
import styles from "./CreateNewDec.module.css";

export default function CreateNewDeck() {
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const [deckIsCreated, setDeckIsCreated] = useState<boolean>(true);
  const [deckId, setDeckId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCards, setTotalCards] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [cards, setCards] = useState<Card[]>([]);

  const fetchCards = async () => {
    if (deckId === null) return;
    try {
      const url = new URL(`/api/decks/${deckId}/cards`, window.location.origin);

      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", "10");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

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

  useEffect(() => {
    fetchCards();
  }, [refreshTrigger, page]);
  return (
    <div className="pageContainer">
      <div className={styles.styleContainer}>
        <CreateDeck
          refreshTrigger={() => {
            setRefreshTrigger((prev) => !prev);
          }}
          afterCreateDeckCallback={(newDeckId: number) => {
            setDeckId(newDeckId);
          }}
        />
        {deckId !== null ? (
          <>
            <CreateCard
              onCardCreated={() => setRefreshTrigger((prev) => !prev)}
              deckId={deckId}
            />
            {cards.map((card) => (
              <EditableCard
                key={card.id}
                card={card}
                onUpdate={(updated) => {
                  setCards((prev) =>
                    prev.map((card) =>
                      card.id === updated.id ? updated : card,
                    ),
                  );
                }}
                onDelete={(deleteId) => {
                  if (cards.length === 1 && page > 1) {
                    setPage(page - 1);
                  } else {
                    setCards((prev) =>
                      prev.filter((card) => card.id !== deleteId),
                    );
                  }
                }}
              />
            ))}
            <Pagination
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              page={page}
              pageSetter={setPage}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
