type LetterBoxProps = {
  expectedChar: string;
  typedChar?: string;
};

export default function LetterBox({ expectedChar, typedChar }: LetterBoxProps) {
  const isCorrect = typedChar?.toLowerCase() === expectedChar.toLowerCase();
  const isWrong = typedChar && !isCorrect;
  const isSpace = expectedChar === " ";
  return (
    <div
      style={{
        width: "40px",
        height: "50px",
        borderBottom: isSpace ? "none" : "4px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2rem",
        fontWeight: "bold",
        color: isCorrect ? "green" : isWrong ? "red" : "black",
      }}
    >
      {typedChar || ""}
    </div>
  );
}
