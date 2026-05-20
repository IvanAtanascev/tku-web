interface CardDTO {
  original: string;
  translation: string;
  description: string;
}

interface DeckDTO {
  name: string;
  description: string;
  cards: CardDTO[];
}

export default function parseCsvToDeck(importString: string): DeckDTO {
  const lines: string[] = importString
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");

  if (lines.length < 2) {
    throw new Error(
      "Invalid format: Must include a title line and at least one card.",
    );
  }

  if (lines[0] === undefined) {
    throw new Error("Invalid format of the deck information");
  }

  const [deckName, ...descParts] = lines[0].split(",");
  const trimmedName = deckName?.trim();

  if (!trimmedName) {
    throw new Error("Invalid format: Deck name cannot be empty.");
  }

  const cardsData: CardDTO[] = lines.slice(1).map((line, index) => {
    const [original, translation, ...descriptionParts] = line.split(",");

    const trimmedOriginal = original?.trim();
    const trimmedTranslation = translation?.trim();

    if (!trimmedOriginal || !trimmedTranslation) {
      throw new Error(
        `Invalid card at line ${index + 2}: Missing original word or translation.`,
      );
    }

    return {
      original: trimmedOriginal,
      translation: trimmedTranslation,
      description: descriptionParts.join(",").trim(),
    };
  });

  return {
    name: trimmedName,
    description: descParts.join(",").trim(),
    cards: cardsData,
  };
}
