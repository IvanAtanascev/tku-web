import styles from "./GraphicalKeyboard.module.css";

interface GraphicalKeyboardProps {
  keys: string;
  keyPressFunction: (char: string) => void;
}

export default function GraphicalKeyboard({
  keys,
  keyPressFunction,
}: GraphicalKeyboardProps) {
  return (
    <div
      className={styles.GraphicalKeyboardContainer}
    >
      {keys.split("").map((char) => (
        <button
          onClick={() => {
            keyPressFunction(char);
          }}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
