import type { Deck } from "@/types/Deck";
import handleGetDecks from "@/utils/utils";
import { useEffect, useState } from "react";

export default function useDecks(isFavorite: boolean) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDecks, setTotalDecks] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPreviousPage] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [userIsTyping, setUserIsTyping] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      setUserIsTyping(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    handleGetDecks(
      page,
      isFavorite,
      query,
      9,
      debouncedQuery,
      setTotalPages,
      setTotalDecks,
      setHasPreviousPage,
      setHasNextPage,
      setDecks,
    );
  }, [page, refreshTrigger, debouncedQuery]);

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

  return {
    decks,
    page,
    setPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setRefreshTrigger,
    userIsTyping,
    handleOnInputChange,
    handleChangeFavorite,
    totalDecks,
  };
}
