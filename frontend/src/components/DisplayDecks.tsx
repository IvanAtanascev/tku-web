import type { Deck } from "../types/Deck";

interface DisplayDecksProps {
  decks: Deck[];
}

export default function DisplayDecks({ decks }: DisplayDecksProps) {
  const handleFavoriteClick = async (deckId: number) => {
    try {
      const response = await fetch(`/api/decks/favorite/${deckId}`, {
        method: "POST",
        headers: {},
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to favorite decks");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      {decks.map((deck) => {
        return (
          <div key={deck.id}>
            <div>{deck.name}</div>
            <button onClick={() => handleFavoriteClick(deck.id)}>
              add to favorites
            </button>
          </div>
        );
      })}
    </div>
  );
}
