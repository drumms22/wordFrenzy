

const startChallenge = () => {

  displayMessage("Get Ready!!!");

  timerFunc(() => {
    playRound();
  }, 3000)
}

async function play() {

  document.getElementById("flipGameInner").classList.add("flip-game");
  document.getElementById("score").innerHTML = selectedDiff === 0 ? "Easy" : selectedDiff === 2 ? "Hard" : selectedDiff === 3 ? "Frenzy" : "Normal";
  let selSplit = selectedCategory.split("Item");

  document.getElementById("categorySelectedTxt").innerHTML = titleCase(selSplit[0]);
  // if (player.challengesCompleted.length === 100) {
  //   constructChallenge("word");
  // } else {
  //   constructChallenge("challenge");
  // }
  // await timerFunc(() => {
  //   displayMessage("Get Ready!!!");
  // }, 2000)
  await timerFunc(() => {
    startChallenge();
  }, 3000)


}

window.addEventListener("keydown", (e) => {

  if (player.challengeStarted) {
    switch (e.key) {
      case "Enter":
        handlePlayerAttempt();
        break;
    }
  }

})

// const calculateHintTriggers = (totalTime, wordLength) => {
//   const maxHints = Math.min(3, Math.floor(totalTime / 10) + (wordLength > 8 ? 1 : 0));
//   const hintTriggers = [];
//   const hintIntervals = [];
//   const timePerHint = totalTime / (maxHints + 1);

//   // Calculate hint intervals
//   for (let i = 1; i <= maxHints; i++) {
//     hintIntervals.push(i * timePerHint);
//   }

//   // Calculate hint triggers
//   hintIntervals.reverse().forEach((hintInterval) => {
//     const hintTime = Math.round(totalTime - hintInterval);

//     if (hintTime >= totalTime || hintTime < 0) {
//       // Hint time is invalid, skip to next hint
//       return;
//     }

//     hintTriggers.push(hintTime);
//   });

//   return { hints: maxHints, triggers: hintTriggers };
// };

// function getSimilarityScore(input, validWord) {
//   const inputLength = input.length;
//   const validWordLength = validWord.length;

//   // Initialize the Levenshtein distance matrix
//   const distanceMatrix = Array(inputLength + 1).fill(null).map(() => Array(validWordLength + 1).fill(null));

//   // Fill the first row and column of the matrix with distance values
//   for (let i = 0; i <= inputLength; i++) {
//     distanceMatrix[i][0] = i;
//   }

//   for (let j = 0; j <= validWordLength; j++) {
//     distanceMatrix[0][j] = j;
//   }

//   // Fill in the rest of the matrix with minimum distance values
//   for (let i = 1; i <= inputLength; i++) {
//     for (let j = 1; j <= validWordLength; j++) {
//       const substitutionCost = input[i - 1] === validWord[j - 1] ? 0 : 1;

//       distanceMatrix[i][j] = Math.min(
//         distanceMatrix[i - 1][j] + 1, // Deletion
//         distanceMatrix[i][j - 1] + 1, // Insertion
//         distanceMatrix[i - 1][j - 1] + substitutionCost // Substitution
//       );
//     }
//   }

//   // Calculate the similarity score as a percentage of the length of the valid word
//   const similarityScore = 1 - (distanceMatrix[inputLength][validWordLength] / validWordLength);

//   return similarityScore;
// }