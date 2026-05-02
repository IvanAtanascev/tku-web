import { useState } from "react";

export function useCreateCard(deckId: number, onCardCreated: () => void) {
  const [original, setOriginal] = useState("");
  const [translation, setTranslation] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateCard = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      setOriginal("");
      setDescription("");
      setTranslation("");

      onCardCreated();
    } catch (error) {
      console.log(error);
    }
  };

  return {
    original,
    setOriginal,
    translation,
    setTranslation,
    description,
    setDescription,
    handleCreateCard,
  };
}
