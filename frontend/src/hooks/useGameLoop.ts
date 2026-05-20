import { useState, useEffect } from "react";
import type { Card } from "@/types/Card";
import { useConfirm } from "@/components/ConfirmContext";

export default function useGameLoop(deckId: string | undefined) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [studyMoreTrigger, setStudyMoreTrigger] = useState<boolean>(false);

  const confirm = useConfirm();

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
        const isConfirmed = await confirm(
          "You have finished this study session. Study more?",
        );

        if (isConfirmed) {
          setStudyMoreTrigger(!studyMoreTrigger);
        }
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
  }, [deckId, studyMoreTrigger]);

  const currentCard = cards[currentIndex];

  return {
    cards,
    currentCard,
    currentIndex,
    isFlipped,
    setIsFlipped,
    isLoading,
    userInput,
    setUserInput,
    handleReviewLogic,
  };
}
