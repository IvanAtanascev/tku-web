import { Link } from "react-router-dom";
import type { Deck } from "../types/Deck";

interface DisplayFavoriteDecksProps {
  decks: Deck[];
};

export default function DisplayFavoriteDecks({ decks }: DisplayFavoriteDecksProps) {
  return (
    <div>
      {decks.map((deck) => {
        return (
          <div key={deck.id}>
            <div>{`${deck.name}`}</div>
            <Link
              to={`/play/${deck.id}`}
              style={{
                padding: "10px 20px",
                background: "#4CAF50",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              Play
            </Link>
            <Link
              to={`/edit/${deck.id}`}
              style={{
                padding: "10px 20px",
                background: "#4CAF50",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              Edit deck
            </Link>
          </div>
        );
      })}
    </div>
  );
}
