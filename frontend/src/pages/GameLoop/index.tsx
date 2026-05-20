import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { WordDisplay } from "@/components/WordDisplay";
import styles from "./GameLoop.module.css";
import useGameLoop from "@/hooks/useGameLoop";
import { OrbitProgress } from "react-loading-indicators";

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
    setUserInput,
    handleReviewLogic,
  } = useGameLoop(deckId);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentCard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (currentCard && text.length <= currentCard.original.length) {
      setUserInput(text);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (isLoading) return <OrbitProgress size="medium" color="#072e0d" />;
  if (cards.length === 0)
    return (
      <div className={styles.emptyDeckDiv}>
        this deck has no cards for you to study right now!{" "}
        <Link to="/">
          <button>Go back</button>
        </Link>
      </div>
    );

  return (
    <div className={styles.container} onClick={handleContainerClick}>
      <input
        ref={inputRef}
        value={userInput}
        onChange={handleInputChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          width: "100%",
          height: "100%",
          border: "none",
          color: "transparent",
          caretColor: "transparent",
          padding: 0,
          margin: 0,
          outline: "none",
          zIndex: -1,
        }}
      />

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
