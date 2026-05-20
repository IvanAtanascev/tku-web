import type React from "react";
import styles from "./Pagination.module.css";

interface PaginationProps {
  totalPages: number;
  page: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pageSetter: (page: React.SetStateAction<number>) => void;
}

export default function Pagination({
  totalPages,
  hasNextPage,
  hasPreviousPage,
  page,
  pageSetter,
}: PaginationProps) {
  return (
    <div className={styles.pagination}>
      <span className={styles.pageIndicator}>
        Page {page} / {totalPages}
      </span>

      {hasPreviousPage && (
        <button
          className={styles.pageButton}
          onClick={() => {
            pageSetter(page - 1);
          }}
        >
          {"<"}
        </button>
      )}
      {hasNextPage && (
        <button
          className={styles.pageButton}
          onClick={() => {
            pageSetter(page + 1);
          }}
        >
          {">"}
        </button>
      )}
    </div>
  );
}
