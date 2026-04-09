import { useState } from "react";

export default function CreateDeck() {
  const [deckName, setDeckName] = useState("");
  //const [error, setError] = useState("");

  const handleCreateDeck = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("error, no token");
        return;
      }
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: deckName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "creating deck failed");
      }
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
        onSubmit={handleCreateDeck}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="deck name"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
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
          Create Deck
        </button>
      </form>
    </div>
  );
}
