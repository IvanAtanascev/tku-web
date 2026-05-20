import type { Deck } from "@/types/Deck";
import type React from "react";

export default async function handleGetDecks(
  page: number,
  showFavorites: boolean,
  query: string,
  limit: number,
  debouncedQuery: string,
  setTotalPages: (value: React.SetStateAction<number>) => void,
  setTotalDecks: (value: React.SetStateAction<number>) => void,
  setHasPreviousPage: (value: React.SetStateAction<boolean>) => void,
  setHasNextPage: (value: React.SetStateAction<boolean>) => void,
  setDecks: (value: React.SetStateAction<Deck[]>) => void,
) {
  try {
    const url = new URL(`/api/decks/search`, window.location.origin);
    url.searchParams.append("page", String(page));
    url.searchParams.append("limit", String(limit));

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
}
