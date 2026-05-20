import { useCreateCard } from "../../hooks/useCreateCard";
import styles from "./CreateCard.module.css";

interface CreateCardProps {
  deckId: number;
  onCardCreated: () => void;
}

export default function CreateCard({ deckId, onCardCreated }: CreateCardProps) {
  const {
    original,
    setOriginal,
    translation,
    setTranslation,
    description,
    setDescription,
    handleCreateCard,
  } = useCreateCard(deckId, onCardCreated);

  return (
    <div
      className={styles.createCardDiv}
    >
      <form
        onSubmit={handleCreateCard}
        className={styles.createCardForm}
      >
        <input
          name="original"
          type="text"
          placeholder="original"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          required
        />

        <input
          name="translation"
          type="text"
          placeholder="translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          required
        />

        <input
          type="text"
          name="description"
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button type="submit">Create Card</button>
      </form>
    </div>
  );
}
