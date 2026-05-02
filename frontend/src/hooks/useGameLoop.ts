import { useState, useEffect } from "react";
import type { Card } from "../types/Card";

export default function useGameLoop(deckId: string | undefined) {
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

  return {
    cards,
    currentCard,
    currentIndex,
    isFlipped,
    setIsFlipped,
    isLoading,
    userInput,
    handleReviewLogic,
  };
}
