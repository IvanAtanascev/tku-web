import DisplayDecks from "@/components/DisplayDecks";
import useDecks from "@/hooks/useDecks";
import Pagination from "@/components/Pagination";
import type { User } from "@/types/User";
import { OrbitProgress } from "react-loading-indicators";

interface AllDecksProps {
  user: User;
}

export default function AllDecks({ user }: AllDecksProps) {
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
  } = useDecks(false);

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
      ) : (
        <>
          <DisplayDecks
            decks={decks}
            favoriteCallback={handleChangeFavorite}
            user={user}
          />

          <Pagination
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPrevPage}
            page={page}
            pageSetter={setPage}
          />
        </>
      )}
    </div>
  );
}
