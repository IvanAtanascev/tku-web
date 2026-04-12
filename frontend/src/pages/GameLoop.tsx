import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { WordDisplay } from "../components/WordDisplay";
import type { Card } from "../types/Card";
import styles from "./GameLoop.module.css"

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
    <div className={styles.container}>
      
      {/* 1. Cleaned up the counter and styled it nicely */}
      <h2 className={styles.counter}>
        Card {currentIndex + 1} of {cards.length}
      </h2>

      {/* 2. The Interactive Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={styles.flashcard}
      >
        {isFlipped ? (
          <div>
            <h1 className={styles.originalText}>{currentCard.original}</h1>
            {currentCard.description && (
              <p className={styles.descriptionText}>{currentCard.description}</p>
            )}
          </div>
        ) : (
          <h1 className={styles.translationText}>{currentCard.translation}</h1>
        )}
      </div>

      {/* 3. The Word Display (Typing Practice) Wrapper */}
      <div className={styles.wordDisplayWrapper}>
        <WordDisplay targetWord={currentCard.original} userInput={userInput} />
      </div>

      {/* 4. The Spaced Repetition Buttons spaced perfectly in a row */}
      <div className={styles.reviewActions}>
        <button onClick={() => handleReviewLogic("easy", currentCard)}>
          Easy
        </button>
        <button onClick={() => handleReviewLogic("good", currentCard)}>
          Good
        </button>
        <button onClick={() => handleReviewLogic("normal", currentCard)}>
          Normal
        </button>
        <button onClick={() => handleReviewLogic("hard", currentCard)}>
          Hard
        </button>
      </div>
      
    </div>
  );
}
