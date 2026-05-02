import { useState, useEffect } from "react";
import type { Card } from "../types/Card";
import type { Deck } from "../types/Deck";

export function useDeckCards(deckId: string | undefined) {
  const [deckName, setDeckName] = useState<String>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCards, setTotalCards] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPreviousPage] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [queryOriginal, setQueryOriginal] = useState<string>("");
  const [queryTranslation, setQueryTranslation] = useState<string>("");
  const [queryDescription, setQueryDescription] = useState<string>("");
  const [debouncedOriginal, setDebouncedOriginal] = useState<string>("");
  const [debouncedTranslation, setDebouncedTranslation] = useState<string>("");
  const [debouncedDescription, setDebouncedDescription] = useState<string>("");
  const [userIsTyping, setUserIsTyping] = useState<boolean>(false);

  const fetchCards = async () => {
    try {
      const url = new URL(`/api/decks/${deckId}/cards`, window.location.origin);

      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", "10");

      if (debouncedOriginal)
        url.searchParams.append("queryOriginal", debouncedOriginal);
      if (debouncedTranslation)
        url.searchParams.append("queryTranslation", debouncedTranslation);
      if (debouncedDescription)
        url.searchParams.append("queryDescription", debouncedDescription);

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

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPage((prev) => prev - 1);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedOriginal(queryOriginal);
      setDebouncedTranslation(queryTranslation);
      setDebouncedDescription(queryDescription);
      setPage(1);
      setUserIsTyping(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [queryOriginal, queryTranslation, queryDescription]);

  useEffect(() => {
    fetchCards();
  }, [
    refreshTrigger,
    page,
    debouncedDescription,
    debouncedOriginal,
    debouncedTranslation,
  ]);

  const handleOnInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setterFunction: (querystring: string) => void,
  ) => {
    setterFunction(e.target.value);
    setUserIsTyping(true);
  };

  useEffect(() => {
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
        await fetchDeckName();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [deckId]);
  return {
    deckName,
    cards,
    setCards,
    page,
    setPage,
    totalPages,
    hasNextPage,
    userIsTyping,
    hasPrevPage,
    queryOriginal,
    setQueryOriginal, 
    queryTranslation,
    setQueryTranslation, 
    queryDescription,
    setQueryDescription,
    totalCards,
    setTotalCards,
    isLoading,
    setIsLoading,
    setRefreshTrigger,
    handleOnInputChange,
    handleNextPage,
    handlePrevPage,
  };
}
