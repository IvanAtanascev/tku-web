import LetterBox from "./LetterBox";

type WordDisplayProps = {
  targetWord: string;
  userInput: string;
};

export function WordDisplay({ targetWord, userInput }: WordDisplayProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        margin: "2rem 0",
      }}
    >
      {targetWord.split("").map((char, index) => {
        return (
          <LetterBox
            key={index}
            expectedChar={char}
            typedChar={userInput[index]}
          />
        );
      })}
    </div>
  );
}
