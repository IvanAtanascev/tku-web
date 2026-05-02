import { useCreateCard } from "../hooks/useCreateCard";

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
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <form
        onSubmit={handleCreateCard}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          name="original"
          type="text"
          placeholder="original"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        <input
          name="translation"
          type="text"
          placeholder="translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        <input
          type="text"
          name="description"
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        <button type="submit">Create Card</button>
      </form>
    </div>
  );
}
