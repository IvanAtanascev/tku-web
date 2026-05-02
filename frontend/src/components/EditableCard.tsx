import toast from "react-hot-toast";
import type { Card } from "../types/Card";
import styles from "./DeckEdit.module.css";

interface EditableCardProps {
  card: Card;
  onUpdate: (updatedCard: Card) => void;
  onDelete: (cardId: number) => void;
}

export default function EditableCard({
  card,
  onUpdate,
  onDelete,
}: EditableCardProps) {
  const handleUpdate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const original = formData.get("original") as string;
    const translation = formData.get("translation") as string;
    const description = formData.get("description") as string;

    const payload: any = {};
    if (original) payload.original = original;
    if (translation) payload.translation = translation;
    if (description) payload.description = description;

    if (Object.keys(payload).length === 0) return;
    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("failed to update card");
      }

      const updatedCardFromServer = await response.json();

      onUpdate(updatedCardFromServer);
      toast.success("card updated");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to delete card");
      }
      onDelete(card.id);
      toast.success("card deleted");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div key={card.id} className={styles.editorCard}>
      <form onSubmit={handleUpdate} className={styles.form}>
        <div className={styles.fieldGroup}>
          <span className={styles.label}>Original</span>
          <div className={styles.currentValue}>{card.original}</div>
          <input
            name="original"
            placeholder="New original..."
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>Translation</span>
          <div className={styles.currentValue}>{card.translation}</div>
          <input
            name="translation"
            placeholder="New translation..."
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>Description</span>
          <div className={styles.currentValue}>{card.description}</div>
          <input
            name="description"
            placeholder="New description..."
            className={`${styles.input} ${styles.descInput}`}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
          >
            Delete
          </button>
          <button type="submit">Update</button>
        </div>
      </form>
    </div>
  );
}
