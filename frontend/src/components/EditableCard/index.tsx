import toast from "react-hot-toast";
import type { Card } from "../../types/Card";
import styles from "./EditableCard.module.css";
import React, { useState } from "react";
import ResetIcon from "@/assets/icons/reset-right-line.svg?react";
import { useConfirm } from "../ConfirmContext";

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
  const [displayFront, setDisplayFront] = useState<string>(card.translation);
  const [displayBack, setDisplayBack] = useState<string>(card.original);
  const [displayDesc, setDisplayDesc] = useState<string>(
    card.description ? card.description : "",
  );

  const confirm = useConfirm();

  const handleUpdate = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
    const isConfirmed = await confirm(
      `Are you sure you want to delete this card?`,
    );

    if (!isConfirmed) return;

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

  const handleFieldInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setterFunction: (value: string) => void,
  ) => {
    setterFunction(e.target.value);
  };

  return (
    <div key={card.id} className={styles.editorCard}>
      <form onSubmit={handleUpdate} className={styles.form}>
        <div className={styles.fieldGroup}>
          <div className={styles.labelDiv}>
            <span className={styles.label}>Back</span>
            <button
              type="button"
              onClick={() => {
                setDisplayBack(card.original);
              }}
            >
              <ResetIcon className={styles.resetIcon} />
            </button>
          </div>
          <textarea
            name="original"
            placeholder="New back"
            value={displayBack}
            className={styles.input}
            onChange={(e) => {
              handleFieldInputChange(e, setDisplayBack);
            }}
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.labelDiv}>
            <span className={styles.label}>Front</span>
            <button
              type="button"
              onClick={() => {
                setDisplayFront(card.translation);
              }}
            >
              <ResetIcon className={styles.resetIcon} />
            </button>
          </div>
          <textarea
            name="translation"
            placeholder="New front..."
            value={displayFront}
            className={styles.input}
            onChange={(e) => {
              handleFieldInputChange(e, setDisplayFront);
            }}
          />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.labelDiv}>
            <span className={styles.label}>Description</span>
            <button
              type="button"
              onClick={() => {
                setDisplayDesc(card.description ? card.description : "");
              }}
            >
              <ResetIcon className={styles.resetIcon} />
            </button>
          </div>
          <textarea
            name="description"
            placeholder="New description..."
            value={displayDesc}
            className={`${styles.input} ${styles.descInput}`}
            onChange={(e) => {
              handleFieldInputChange(e, setDisplayDesc);
            }}
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
