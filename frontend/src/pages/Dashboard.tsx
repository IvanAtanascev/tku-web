import DisplayDecks from "../components/DisplayDecks";
import DisplayFavoriteDecks from "../components/DisplayFavoriteDecks";
import CreateDeck from "../components/CreateDeck";
import styles from "./Dashboard.module.css";
import { useDashboard } from "../hooks/useDashboard";

type DashboardProps = {
  userId: number;
};

export default function Dashboard({ userId }: DashboardProps) {
  const {
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
  } = useDashboard();

  return (
    <div className={styles.pageContainer}>
      <div>
        <CreateDeck refreshTrigger={() => setRefreshTrigger((prev) => !prev)} />
      </div>

      <div className={styles.header}>
        <h1>{showFavorites ? "Favorite Decks" : "All Decks"}</h1>
        <button
          onClick={() => {
            setShowFavorites(!showFavorites);
            setPage(1);
          }}
        >
          {showFavorites ? "View All Decks" : "View Favorites"}
        </button>
      </div>

      <div>
        <input
          placeholder="Search for a deck.."
          name="search query"
          onChange={(e) => {
            handleOnInputChange(e);
          }}
        />
        <div>{query}</div>
      </div>
      {userIsTyping ? <div>"Loading..."</div> : null}

      {showFavorites ? (
        <DisplayFavoriteDecks
          unfavoriteCallback={handleChangeFavorite}
          userId={userId}
          decks={decks}
        />
      ) : (
        <DisplayDecks favoriteCallback={handleChangeFavorite} decks={decks} />
      )}

      <div className={styles.pagination}>
        <span className={styles.pageIndicator}>
          Page {page} / {totalPages}
        </span>

        {hasPrevPage && (
          <button className={styles.pageButton} onClick={handlePreviousPage}>
            {"<"}
          </button>
        )}
        {hasNextPage && (
          <button className={styles.pageButton} onClick={handleNextPage}>
            {">"}
          </button>
        )}
      </div>
    </div>
  );
}
