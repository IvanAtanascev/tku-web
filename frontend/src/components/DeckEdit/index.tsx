import { useParams } from "react-router-dom";
import CreateCard from "../CreateCard";
import styles from "./DeckEdit.module.css";
import EditableCard from "../EditableCard";
import { useDeckCards } from "../../hooks/useDeckCards";
import Pagination from "../Pagination";
import { OrbitProgress } from "react-loading-indicators";

export default function DeckEdit() {
  const { deckId } = useParams();

  const {
    deckName,
    cards,
    setCards,
    page,
    setPage,
    totalPages,
    hasNextPage,
    userIsTyping,
    hasPrevPage,
    setQueryOriginal,
    setQueryTranslation,
    setQueryDescription,
    isLoading,
    setRefreshTrigger,
    handleOnInputChange,
  } = useDeckCards(deckId);

  if (isLoading) return <div>loading deck contents...</div>;

  return (
    <div className="pageContainer">
      <h2 className={styles.header}>Editing {deckName}</h2>

      <div className={styles.cardList}>
        <div className={styles.topPart}>
          {deckId && (
            <CreateCard
              onCardCreated={() => setRefreshTrigger((prev) => !prev)}
              deckId={parseInt(deckId)}
            />
          )}

          <div className={styles.searchFields}>
            <input
              onChange={(e) => handleOnInputChange(e, setQueryOriginal)}
              name="search original"
              placeholder="Search back..."
            />
            <input
              onChange={(e) => handleOnInputChange(e, setQueryTranslation)}
              name="search translation"
              placeholder="Search front..."
            />
            <input
              onChange={(e) => handleOnInputChange(e, setQueryDescription)}
              name="search description"
              placeholder="Search description..."
            />
          </div>
        </div>
        {userIsTyping ? (
          <div className="loading-div">
            <OrbitProgress size="small" color="#072e0d" />
          </div>
        ) : null}

        {cards.map((card) => (
          <EditableCard
            key={card.id}
            card={card}
            onUpdate={(updated) => {
              setCards((prev) =>
                prev.map((card) => (card.id === updated.id ? updated : card)),
              );
            }}
            onDelete={(deletedId) => {
              if (cards.length === 1 && page > 1) {
                setPage(page - 1);
              } else {
                setCards((prev) =>
                  prev.filter((card) => card.id !== deletedId),
                );
              }
            }}
          />
        ))}
        <Pagination
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPrevPage}
          page={page}
          pageSetter={setPage}
        />
      </div>
    </div>
  );
}
