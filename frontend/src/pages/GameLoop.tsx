import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { WordDisplay } from "../components/WordDisplay";
import type { Card } from "../types/Card";

export default function GameLoop() {
  const { deckId } = useParams();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInput, setUserInput] = useState("");

  const handleReviewLogic = async (difficulty: string, card: Card) => {
    try {
      const response = await fetch(`/api/cards/${card.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ grade: difficulty }),
      });

      if (!response.ok) {
        throw new Error("failed to send review logic");
      }
      setIsFlipped(false);
      setUserInput("");

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        alert("you finished the deck!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(`/api/cards/${deckId}/study`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("failed to fetch cards");
        }

        const data = await response.json();

        const cards: Card[] = data;

        setCards(cards);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (deckId) {
      fetchCards();
    }
  }, [deckId]);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (!currentCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        setUserInput((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1 && e.key.match(/[\p{L}\p{N}\s]/u)) {
        setUserInput((prev) => {
          if (prev.length < currentCard.original.length) {
            return prev + e.key;
          }

          return prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentCard]);

  if (isLoading) return <div>loading your deck...</div>;
  if (cards.length === 0) return <div>this deck has no cards yet!</div>;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h2>
        card {currentIndex + 1} of {cards.length}
      </h2>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          border: "2px solid #333",
          borderRadius: "12px",
          padding: "4rem",
          margin: "2rem 0",
          cursor: "pointer",
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {isFlipped ? (
          <div>
            <h1 style={{ color: "#4CAF50" }}>{currentCard.original}</h1>
            {currentCard.description && <p>{currentCard.description}</p>}
          </div>
        ) : (
          <h1>{currentCard.translation}</h1>
        )}
      </div>

      <div
        style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2>
          card {currentIndex + 1} of {cards.length}
        </h2>

        <WordDisplay targetWord={currentCard.original} userInput={userInput} />
      </div>
      <button
        onClick={() => {
          handleReviewLogic("easy", currentCard);
        }}
        style={{ padding: "10px 20px", fontSize: "1.2rem" }}
      >
        easy
      </button>
      <button
        onClick={() => {
          handleReviewLogic("good", currentCard);
        }}
        style={{ padding: "10px 20px", fontSize: "1.2rem" }}
      >
        good
      </button>
      <button
        onClick={() => {
          handleReviewLogic("normal", currentCard);
        }}
        style={{ padding: "10px 20px", fontSize: "1.2rem" }}
      >
        normal
      </button>
      <button
        onClick={() => {
          handleReviewLogic("hard", currentCard);
        }}
        style={{ padding: "10px 20px", fontSize: "1.2rem" }}
      >
        hard
      </button>
    </div>
  );
}
