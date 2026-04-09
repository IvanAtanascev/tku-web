import { useEffect, useState } from "react";
import type { Card } from "../types/Card";
import type { Deck } from "../types/Deck";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import CreateCard from "./CreateCard";

export default function DeckEdit() {
  const { deckId } = useParams();
  const [deckName, setDeckName] = useState<String>("");
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCards, setTotalCards] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPreviousPage] = useState<boolean>(false);
  const [addCardRefreshTrigger, setAddCardRefreshTrigger] =
    useState<boolean>(false);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPage((prev) => prev - 1);
  };

  const handleUpdateCard = async (
    e: React.SyntheticEvent<HTMLFormElement>,
    cardId: number,
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const original = formData.get("original") as string;
    const translation = formData.get("translation") as string;
    const description = formData.get("description") as string;

    const payload: any = {};
    if (original) payload.original = original;
    if (translation) payload.translation = translation;
    if (description) payload.description = description;

    if (Object.keys(payload).length === 0) return;
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("failed to update card");
      }

      const updatedCardFromServer = await response.json();

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? updatedCardFromServer : card,
        ),
      );
      toast.success("card updated");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(
          `/api/decks/${deckId}/cards?page=${page}&limit=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

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
        await fetchCards();
        await fetchDeckName();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [deckId, page, addCardRefreshTrigger]);

  if (isLoading) return <div>loading deck contents...</div>;

  return (
    <div>
      <h2>{deckName}</h2> {/* changed to h2 just to make it pop! */}
      <div
        style={{
          display: "flex",
          flexDirection: "column", // stacks the card rows vertically
          gap: "15px", // space between each card row
          margin: "2rem auto",
          maxWidth: "800px",
        }}
      >
        {deckId && (
          <CreateCard
            onCardCreated={() => setAddCardRefreshTrigger((prev) => !prev)}
            deckId={parseInt(deckId)}
          />
        )}
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              display: "flex", // THIS makes the contents horizontal!
              flexDirection: "row", // (this is the default, but good to be explicit)
              alignItems: "center", // vertically centers the text with the inputs
              justifyContent: "space-between", // spreads them out evenly
              gap: "10px",
              padding: "10px",
              border: "1px solid #ddd", // adds a nice box around each row
              borderRadius: "8px",
              background: "#090909",
            }}
          >
            <form
              onSubmit={(e) => handleUpdateCard(e, card.id)}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* grouping the label and input together keeps them attached */}
              <div
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                <strong>original:</strong>
                <div>{card.original}</div>
                <input name="original" placeholder={card.original} />
              </div>

              <div
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                <strong>translation:</strong>
                <div>{card.translation}</div>
                <input name="translation" placeholder={card.translation} />
              </div>

              <div
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                <strong>desc:</strong>
                <div>{card.description}</div>
                <input name="description" placeholder={card.description} />
              </div>

              <button
                type="submit"
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                Update
              </button>
            </form>
          </div>
        ))}
      </div>
      <div>
        <div>{`${page}/${totalPages}`}</div>
        {hasPrevPage ? (
          <button onClick={handlePrevPage}>previous</button>
        ) : null}
        {hasNextPage ? <button onClick={handleNextPage}>next</button> : null}
      </div>
    </div>
  );
}
