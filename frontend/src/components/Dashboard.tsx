import { Link } from "react-router-dom";
import type { Deck } from "../types/Deck";
import { useEffect, useState } from "react";
import DisplayDecks from "./DisplayDecks";
import DisplayFavoriteDecks from "./DisplayFavoriteDecks";

type DashboardProps = {
  userId: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDecks, setTotalDecks] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPreviousPage] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(true);

  useEffect(() => {
    const handleGetDecks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("error: couldn't find token");
        return;
      }

      try {
        let response = null
        if (showFavorites){
        response = await fetch(
          `/api/decks/favorites?page=${page}&limit=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include"
          },
        );
          
        } else {
          response = await fetch(`/api/decks/?page=${page}&limit=10`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include"
            })
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
  }, [page, showFavorites]);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => prev - 1);
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <div>
        {showFavorites ? (
          <div>
            <button onClick={() => {setShowFavorites(false)}}>Show all decks</button>
          <DisplayFavoriteDecks decks={decks} />
          </div>
        ) : (
          <div>
            <button onClick={() => {setShowFavorites(true)}}>Show favorite decks</button>
          <DisplayDecks decks={decks} />
          </div>
        )}
        <div>
          {hasPrevPage ? (
            <button
              onClick={handlePreviousPage}
              style={{ padding: "10px 20px", fontSize: "1.2rem" }}
            >
              previous page
            </button>
          ) : null}
          {hasNextPage ? (
            <button
              onClick={handleNextPage}
              style={{ padding: "10px 20px", fontSize: "1.2rem" }}
            >
              next page
            </button>
          ) : null}
          {`page ${page}/${totalPages}`}
        </div>
      </div>

      <div>
        <Link
          to={"/create/deck"}
          style={{
            padding: "10px 20px",
            background: "#4CAF50",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Create a new deck!
        </Link>
      </div>
    </div>
  );
}
