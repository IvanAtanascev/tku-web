import { useParams } from "react-router-dom";
import CreateCard from "./CreateCard";
import styles from "./DeckEdit.module.css";
import EditableCard from "./EditableCard";
import { useDeckCards } from "../hooks/useDeckCards";

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
    queryOriginal,
    setQueryOriginal,
    queryTranslation,
    setQueryTranslation,
    queryDescription,
    setQueryDescription,
    totalCards,
    setTotalCards,
    isLoading,
    setRefreshTrigger,
    handleOnInputChange,
    handleNextPage,
    handlePrevPage,
  } = useDeckCards(deckId);

  if (isLoading) return <div>loading deck contents...</div>;

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.header}>{deckName}</h2>

      <div className={styles.cardList}>
        {deckId && (
          <CreateCard
            onCardCreated={() => setRefreshTrigger((prev) => !prev)}
            deckId={parseInt(deckId)}
          />
        )}

        <input
          onChange={(e) => handleOnInputChange(e, setQueryOriginal)}
          name="search original"
          placeholder="Search original..."
        />
        <div>{queryOriginal}</div>
        <input
          onChange={(e) => handleOnInputChange(e, setQueryTranslation)}
          name="search translation"
          placeholder="Search translation..."
        />
        <div>{queryTranslation}</div>
        <input
          onChange={(e) => handleOnInputChange(e, setQueryDescription)}
          name="search description"
          placeholder="Search Description..."
        />
        <div>{queryDescription}</div>
        {userIsTyping ? <div>"Loading"</div> : null}

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
      </div>

      <div className={styles.pagination}>
        {hasPrevPage && (
          <button onClick={handlePrevPage}>&larr; Previous</button>
        )}

        <span className={styles.pageIndicator}>
          Page {page} / {totalPages}
        </span>

        {hasNextPage && <button onClick={handleNextPage}>Next &rarr;</button>}
      </div>
    </div>
  );
}
