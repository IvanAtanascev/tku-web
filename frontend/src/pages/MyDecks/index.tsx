import useDecks from "@/hooks/useDecks";
import Pagination from "@/components/Pagination";
import DisplayFavoriteDecks from "@/components/DisplayFavoriteDecks";
import type { User } from "@/types/User";
import { OrbitProgress } from "react-loading-indicators";

interface MyDecksProps {
  user: User;
}

export default function MyDecks({ user }: MyDecksProps) {
  const {
    decks,
    page,
    setPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    userIsTyping,
    handleOnInputChange,
    handleChangeFavorite,
  } = useDecks(true);

  return (
    <div className="pageContainer">
      <div className="pillow">
        <input
          placeholder="Search for a deck.."
          name="search query"
          onChange={(e) => {
            handleOnInputChange(e);
          }}
        />
      </div>

      {userIsTyping ? (
        <div className="loading-div">
          <OrbitProgress size="small" color="#072e0d" />
        </div>
      ) : null}

      <DisplayFavoriteDecks
        decks={decks}
        user={user}
        unfavoriteCallback={handleChangeFavorite}
      />

      <Pagination
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPrevPage}
        page={page}
        pageSetter={setPage}
      />
    </div>
  );
}
