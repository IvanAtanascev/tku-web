import type { Deck } from "../types/Deck";
import { useEffect, useState } from "react";
import DisplayDecks from "../components/DisplayDecks";
import DisplayFavoriteDecks from "../components/DisplayFavoriteDecks";
import CreateDeck from "../components/CreateDeck";
import styles from "./Dashboard.module.css";

type DashboardProps = {
  userId: number;
};

export default function Dashboard({ userId }: DashboardProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDecks, setTotalDecks] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPreviousPage] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);

  useEffect(() => {
    const handleGetDecks = async () => {
      try {
        let response = null;
        if (showFavorites) {
          response = await fetch(`/api/decks/favorites?page=${page}&limit=9`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
        } else {
          response = await fetch(`/api/decks/?page=${page}&limit=9`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
        }

        if (!response.ok) {
          throw new Error("failed to fetch decks");
        }

        const { data, meta } = await response.json();
        const deck: Deck[] = data;

        setTotalPages(meta.totalPages);
        setTotalDecks(meta.totalDecks);
        setHasNextPage(meta.hasNextPage);
        setHasPreviousPage(meta.hasPrevPage);

        setDecks(deck);
      } catch (error) {
        console.error(error);
      }
    };

    handleGetDecks();
  }, [page, showFavorites, refreshTrigger]);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => prev - 1);
  };

  return (
    <div className={styles.pageContainer}>
      <div>
        <CreateDeck refreshTrigger={() => setRefreshTrigger((prev) => !prev)} />
      </div>

      <div className={styles.header}>
        <h1>{showFavorites ? "Favorite Decks" : "All Decks"}</h1>
        <button onClick={() => setShowFavorites(!showFavorites)}>
          {showFavorites ? "View All Decks" : "View Favorites"}
        </button>
      </div>

      {showFavorites ? (
        <DisplayFavoriteDecks
          unfavoriteCallback={() => setRefreshTrigger((prev) => !prev)}
          userId={userId}
          decks={decks}
        />
      ) : (
        <DisplayDecks
          favoriteCallback={() => setRefreshTrigger((prev) => !prev)}
          decks={decks}
        />
      )}

      <div className={styles.pagination}>
        <span className={styles.pageIndicator}>
          Page {page} / {totalPages}
        </span>

        {hasPrevPage && (
          <button className={styles.pageButton} onClick={handlePreviousPage}>
            {"<"}
          </button>
        )}
        {hasNextPage && (
          <button className={styles.pageButton} onClick={handleNextPage}>
            {">"}
          </button>
        )}
      </div>

    </div>
  );
}
