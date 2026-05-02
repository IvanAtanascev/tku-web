import { useState, useEffect } from "react";
import type { Deck } from "../types/Deck";

export function useDashboard() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDecks, setTotalDecks] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPreviousPage] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [userIsTyping, setUserIsTyping] = useState<boolean>(false);

  const handleGetDecks = async () => {
    try {
      const url = new URL(`/api/decks/search`, window.location.origin);
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", "9");

      if (showFavorites) url.searchParams.append("favorite", "true");
      else url.searchParams.append("favorite", "false");

      if (query) url.searchParams.append("query", String(debouncedQuery));

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      setUserIsTyping(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleOnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setUserIsTyping(true);
  };

  const handleChangeFavorite = () => {
    if (decks.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      setRefreshTrigger(!refreshTrigger);
    }
  };

  useEffect(() => {
    handleGetDecks();
  }, [page, showFavorites, refreshTrigger, debouncedQuery]);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => prev - 1);
  };

  return {
    decks,
    page,
    setPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    showFavorites,
    setShowFavorites,
    setRefreshTrigger,
    query,
    userIsTyping,
    handleOnInputChange,
    handleChangeFavorite,
    handleNextPage,
    handlePreviousPage,
  };
}
