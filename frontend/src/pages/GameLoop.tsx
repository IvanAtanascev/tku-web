import { useParams } from "react-router-dom";
import { WordDisplay } from "../components/WordDisplay";
import styles from "./GameLoop.module.css";
import useGameLoop from "../hooks/useGameLoop";

export default function GameLoop() {
  const { deckId } = useParams();
  const {
    cards,
    currentCard,
    currentIndex,
    isFlipped,
    setIsFlipped,
    isLoading,
    userInput,
    handleReviewLogic,
  } = useGameLoop(deckId);

  if (isLoading) return <div>loading your deck...</div>;
  if (cards.length === 0) return <div>this deck has no cards yet!</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.counter}>
        Card {currentIndex + 1} of {cards.length}
      </h2>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={styles.flashcard}
      >
        {isFlipped ? (
          <div>
            <h1 className={styles.originalText}>{currentCard.original}</h1>
            {currentCard.description && (
              <p className={styles.descriptionText}>
                {currentCard.description}
              </p>
            )}
          </div>
        ) : (
          <h1 className={styles.translationText}>{currentCard.translation}</h1>
        )}
      </div>

      <div className={styles.wordDisplayWrapper}>
        <WordDisplay targetWord={currentCard.original} userInput={userInput} />
      </div>

      <div className={styles.reviewActions}>
        <button onClick={() => handleReviewLogic("easy", currentCard)}>
          Easy
        </button>
        <button onClick={() => handleReviewLogic("good", currentCard)}>
          Good
        </button>
        <button onClick={() => handleReviewLogic("normal", currentCard)}>
          Normal
        </button>
        <button onClick={() => handleReviewLogic("hard", currentCard)}>
          Hard
        </button>
      </div>
    </div>
  );
}
