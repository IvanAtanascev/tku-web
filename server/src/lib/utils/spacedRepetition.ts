type Grade = "hard" | "normal" | "good" | "easy";

export function calculateReview(
  grade: Grade,
  currentRepetitions: number,
  currentInterval: number,
  currentEase: number,
) {
  let newRepetitions = currentRepetitions;
  let newInterval = currentInterval;
  let newEase = currentEase;

  if (grade != "hard") newRepetitions = currentRepetitions + 1;

  switch (grade) {
    case "hard":
      newRepetitions = 0;
      newInterval = 1;
      newEase = Math.max(1.3, currentEase - 0.2);
      break;
    case "normal":
      newInterval =
        currentRepetitions === 0 ? 1 : Math.round(currentInterval * 1.2);
      newEase = Math.max(1.3, currentEase - 0.15);
      break;
    case "good":
      newInterval =
        currentRepetitions === 0
          ? 1
          : currentRepetitions === 1
            ? 6
            : Math.round(currentInterval * currentEase);
      break;
    case "easy":
      newInterval =
        currentRepetitions === 0
          ? 4
          : currentRepetitions === 1
            ? 10
            : Math.round(currentInterval * currentEase * 1.3);
      newEase = currentEase + 0.15;
      break;
  }

  const newNextReviewDate = new Date();
  newNextReviewDate.setDate(newNextReviewDate.getDate() + newInterval);

  return {
    newRepetitions,
    newInterval,
    newEase,
    newNextReviewDate,
  };
}
