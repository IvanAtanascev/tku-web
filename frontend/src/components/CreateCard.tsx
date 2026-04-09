import { useState } from "react";

interface CreateCardProps {
  deckId: number;
  onCardCreated: () => void;
}

export default function CreateCard({ deckId, onCardCreated }: CreateCardProps) {
  const [original, setOriginal] = useState("");
  const [translation, setTranslation] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateCard = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          original: original,
          translation: translation,
          description: description,
          deckId: deckId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "creating card failed");
      }

      setOriginal("")
      setDescription("")
      setTranslation("")

      onCardCreated()
    } catch (error) {
      console.log(error);
    }
  };

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
          type="text"
          placeholder="original"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        <input
          type="text"
          placeholder="translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        <input
          type="text"
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: "10px", fontSize: "1rem" }}
          required
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#4CAF50",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Create Card
        </button>
      </form>
    </div>
  );
}
