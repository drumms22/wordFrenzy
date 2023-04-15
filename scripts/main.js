
let musicOn = true;
let lastIndex = -1;
const sounds = [
  new Howl({ src: ['assets/audio/bkg1.mp3'], volume: .02, }),
  new Howl({ src: ['assets/audio/bkg2.mp3'], volume: .02, }),
  new Howl({ src: ['assets/audio/bkg3.mp3'], volume: .02, })
];
const playBKMusic = () => {

  if (!musicOn || soundPlaying) return;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * sounds.length);
  } while (randomIndex === lastIndex);
  lastIndex = randomIndex;
  sounds[randomIndex].fade(0, 0.01, 5000);
  sounds[randomIndex].play();
  soundPlaying = true;

}

const stopBKMusic = () => {

  Howler.stop();
  soundPlaying = false;
  musicOn = false;

}


const checkMusic = () => {
  let approved = getCookie("bkgMusic");

  if (approved) {
    let num = parseInt(approved);
    if (num === 0) {
      musicOn = false;
      document.getElementById("musicBtnDiv").innerHTML = '<button id="musicBtn" onclick="turnOnMusic()">Turn On Music</button>';
    } else {
      musicOn = true;
      document.getElementById("musicBtnDiv").innerHTML = '<button id="musicBtn" onclick="turnOffMusic()">Turn Off Music</button>';
    }
  } else {
    setCookie("bkgMusic", 1);
    musicOn = true;
    document.getElementById("musicBtnDiv").innerHTML = '<button id="musicBtn" onclick="turnOffMusic()">Turn Off Music</button>';
  }

}

const turnOnMusic = () => {
  musicOn = true;
  document.getElementById("musicBtnDiv").innerHTML = '<button id="musicBtn" onclick="turnOffMusic()">Turn Off Music</button>';
  playBKMusic();
  setCookie("bkgMusic", 1);
}

const turnOffMusic = () => {
  musicOn = false;
  document.getElementById("musicBtnDiv").innerHTML = '<button id="musicBtn" onclick="turnOnMusic()">Turn On Music</button>';
  stopBKMusic();
  setCookie("bkgMusic", 0);
}


checkMusic()

window.addEventListener('click', () => {
  playBKMusic();
})
sounds.forEach(function (sound) {
  sound.on('end', function () {
    soundPlaying = false;
    playBKMusic();
  });
});


const loadData = (spc) => {
  let maxSpd = "<span style='font-size: 10px;'>/100</span>";
  document.getElementById("totalPoints").innerHTML = player.totalPoints;
  document.getElementById("totalTime").innerHTML = player.totalTimeSpent + "s";
  document.getElementById("totalWords").innerHTML = player.totalWordsCompleted;
  document.getElementById("totalChallenges").innerHTML = player.totalChallenegesCompleted;

  let spcMess = 100 - spc;
  document.getElementById("currentCPS").innerHTML = spcMess + "" + maxSpd;

}

const constructChallenge = (type) => {

  switch (type) {
    case "word":
      player.currentChallenge.words.push(getWord());
      player.currentChallenge.type = "word";
      break;
    case "challenge":
      for (let i = 0; i < 3; i++) {
        let num = 4 + i;
        player.currentChallenge.words.push(getWord(num, num));
      }
      player.currentChallenge.type = "challenge";
      break;
  }

  // player.currentChallenge = challenge;

}

const wait = (delay, ...args) => new Promise(resolve => setTimeout(resolve, delay, ...args));

const timerFunc = async (callback, time, ...arg) => {

  await wait(time);
  await callback(...arg);
}

const startTimer = () => timer = setInterval(() => {
  // (player.currentChallenge.ogTime - 5)
  if (player.currentTime > 0) {
    let extraZero = player.currentTime < 10 ? "0" : "";
    updateTimerDsiplay("" + extraZero + player.currentTime);

    player.currentTime--;

    if (!player.currentChallenge.hints.completed && !inLobby) {
      let preMess = player.currentChallenge.hints.triggers.findIndex((trigger) => player.currentTime === (trigger + 2));
      let hintsTrigger = player.currentChallenge.hints.triggers.findIndex((trigger) => player.currentTime === trigger);
      if (preMess > -1 && hintsTrigger === -1) {
        document.getElementById("message2").innerHTML = "Hint incoming!!!"
      } else if (hintsTrigger > -1 && preMess === -1) {
        let regex = /Lobby/;
        handleHint(hintsTrigger, selectedCategory.replace(regex, ""));
      }
    }

  } else {
    updateTimerDsiplay("00");
    if (inLobby || hthStarted) {
      handleTimesUp();
    } else {
      timesUp();
    }
  }

}, 1000);

const handleHint = async (index, cat) => {
  let payload = {
    type: "normal",
    hintsUsed: player.currentChallenge.hints.used,
  }

  switch (cat) {
    case "wordsItem":
      payload.word = player.currentWord;
      if (!inLobby && !hthStarted) {
        payload.type = index === player.currentChallenge.hints.triggers[1] ?
          "reveal" : index === player.currentChallenge.hints.triggers[2] ? "synonym" : "definition";
      } else {
        payload.type = index === 2 ? "definition" : "synonym";
      }
      break;
    case "animalsItem":
      payload.animal = player.currentWord;
      break;
    case "carsItem":
      payload.car = player.currentWord;
      break;
    case "citiesItem":
      payload.city = player.currentWord;
      payload.state = extra;
      break;
    case "sportsItem":
      payload.sport = player.currentWord;
      payload.sportC = extra;
      break;
    case "moviesItem":
      payload.movie = player.currentWord;
      break;
  }

  if (!inLobby && index >= (player.currentChallenge.hints.triggers.length - 1)) {
    payload.type = "reveal";
  }


  let res = await getHint(JSON.stringify(payload));

  if (!res.error || res != undefined || res != null) {
    player.currentChallenge.hints.used = res[0].hintsUsed;
    player.currentChallenge.hints.completed = res[0].completed;
    player.currentChallenge.hints.hintMessages.push(res[0].hint);
    document.getElementById("message2").innerHTML = res[0].hint;
  } else {
    player.currentChallenge.hints.completed = true;
    document.getElementById("message2").innerHTML = "Hint cannot be found, good luck!";
  }
}


const calculateMaxHints = (totalTime) => {
  let maxHints = Math.floor(totalTime / 15) + 1; // adjust 15 to change interval time

  // cap at 3 hints
  maxHints = Math.min(3, maxHints);

  return maxHints;
};
const calculateHintTriggers = (totalTime) => {
  if (totalTime < 30) {
    return { hints: 0, triggers: [] };
  }

  const maxHints = calculateMaxHints(totalTime);
  const hintTriggers = [];
  const hintIntervals = [];
  const timePerHint = totalTime / (maxHints + 1);

  // Calculate hint intervals
  for (let i = 0; i <= maxHints; i++) {
    hintIntervals.push(i * timePerHint);
  }

  // Calculate hint triggers
  hintIntervals.forEach((hintInterval) => {
    const hintTime = Math.round(totalTime - hintInterval);

    if (hintTime >= totalTime || hintTime < 10) {
      // Hint time is invalid, skip to next hint
      return;
    }

    hintTriggers.push(hintTime);
  });

  return { hints: maxHints, triggers: hintTriggers };
};


const calcSpeed = (time, char) => {
  let l = player.totalWordsCompleted % 6;

  if (l === 0) {
    player.speedData.totalChar = 15;
    player.speedData.totalTime = player.currentCPS * 15

  } else {
    player.speedData.totalTime += time;
    player.speedData.totalChar += char;
    player.currentCPS = Math.floor(parseInt(player.speedData.totalTime) / parseInt(player.speedData.totalChar)) + 1;
  }

}

const timesUp = () => {

  clearInterval(timer);

  let w = usw(player.currentWord);

  calcSpeed(player.currentChallenge.ogTime, 0);

  player.totalTimeSpent += player.currentChallenge.ogTime;

  updatePlayer();

  updateGameData();

  timer = null;
  document.getElementById("message2").innerHTML = "The word was: " + w + "";
  gameOver("Times up! You have failed!!!");
}

const updateTimerDsiplay = (sec, min = 0) => {
  document.getElementById("time").innerHTML = "" + sec + "s";
}


const displayMessage = (message) => document.getElementById("message").innerHTML = message;


const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const handleJoke = (e, guess) => {

  let modNum = jokeCounter % 5;
  let modNum2 = jokeCounter % 3;


  if (modNum2 === 0) {
    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
  } else if (modNum === 0) {
    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
  } else {
    jokeCounter++;
  }
  // else
  // if (jokeCounter === 25) {
  //   jokeCounter++;
  //   document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
  //   alert("Just Stop Bro!");
  // } else 
  // if (jokeCounter === 30) {
  //   jokeCounter++;
  //   document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
  //   alert("Ok the jokes over!");
  // } else if (jokeCounter > 30 && modNum === 0 || modNum2 === 0) {

  //   jokeCounter++;
  //   document.getElementById(e.target.id).value = letters[generateRandomNumer(0, (letters.length - 1))];
  // } else
  // if (jokeCounter > 30) {
  //   jokeCounter++;
  // } else {
  //   jokeCounter++;
  // }
}

const usw = (w) => {
  let s = 3;
  let j = 0;
  let o = "";
  let p = 0;
  let c = w.length / 5;
  for (let i = 0; i < w.length; i++) {
    if (j < s) {
      j++;
    } else if (p < c) {
      o += w.charAt(i);
      j = 0;
      p++;
    }
  }

  return o;
}

// const getInputs = () => {
//   let str = "";

//   let count = 0;
//   for (let i = 0; i < player.placeHolder.length; i++) {
//     if (player.placeHolder[i] === "_" || player.placeHolder[i] === " ") {
//       str += " ";
//     } else {
//       str += document.getElementById("letter" + (count + 1)).value;
//       count++;
//     }
//   }

//   return str;
// }

const clearInputs = () => {

  let count = 0;
  for (let i = 0; i < player.placeHolder.length; i++) {
    if (player.placeHolder[i] === "_") {

    } else {
      if (player.currentChallenge.wordCompleted || player.placeHolder[i] === "") {
        document.getElementById("letter" + (count + 1)).style.backgroundColor = "#f0f8ff"
        document.getElementById("letter" + (count + 1)).value = "";
      }
      count++;
    }
  }
}

const updatePrevGuesses = () => {


  if (player.currentChallenge.prevGuesses.length === 0) return;

  document.getElementById("prevWords").innerHTML = "";

  player.currentChallenge.prevGuesses.map((g) => {
    document.getElementById("prevWords").innerHTML += `<li>${g}</li>`;
  })

  if (player.currentChallenge.prevGuesses.length > 7) {
    document.getElementById("prevWords").style.overflowY = "scroll";
  }

}

const handlePoints = () => {
  player.totalPoints += player.wordLen;

}

const isWord = (guess) => RiTa.hasWord(guess);

const getSimilarityScore = (input, validWord) => {
  const inputLength = input.length;
  const validWordLength = validWord.length;

  // Initialize the Levenshtein distance matrix
  const distanceMatrix = Array(inputLength + 1).fill(null).map(() => Array(validWordLength + 1).fill(null));

  // Fill the first row and column of the matrix with distance values
  for (let i = 0; i <= inputLength; i++) {
    distanceMatrix[i][0] = i;
  }

  for (let j = 0; j <= validWordLength; j++) {
    distanceMatrix[0][j] = j;
  }

  // Fill in the rest of the matrix with minimum distance values
  for (let i = 1; i <= inputLength; i++) {
    for (let j = 1; j <= validWordLength; j++) {
      const substitutionCost = input[i - 1] === validWord[j - 1] ? 0 : 1;

      distanceMatrix[i][j] = Math.min(
        distanceMatrix[i - 1][j] + 1, // Deletion
        distanceMatrix[i][j - 1] + 1, // Insertion
        distanceMatrix[i - 1][j - 1] + substitutionCost // Substitution
      );
    }
  }

  // Calculate the similarity score as a percentage of the length of the valid word
  const similarityScore = 1 - (distanceMatrix[inputLength][validWordLength] / validWordLength);

  return Math.floor(similarityScore * 100);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//   const charCounts = {};
//   for (const char of word) {
//     charCounts[char] = (charCounts[char] || 0) + 1;
//   }
//   const averageCount = word.length / Object.keys(charCounts).length;
//   const maxAllowed = Math.ceil(averageCount * 2.5);

//   console.log("avgCharC: " + averageCount);

//   for (const char of guess) {
//     if ((charCounts[char] || 0) >= maxAllowed) {
//       return true;
//     }
//   }
//   return false;
// };
// const hasTooManyOfOneChar = (word, guess) => {
//   console.log("Word: " + word + " | guess: " + guess);
//   const charCounts = {};
//   for (const char of word) {
//     charCounts[char] = (charCounts[char] || 0) + 1;
//   }
//   const maxAllowed = Math.ceil(word.length / Object.keys(charCounts).length * 1.5);
//   console.log("avgCharC: " + maxAllowed);
//   for (const char of guess) {
//     const count = charCounts[char] || 0;
//     if (count / word.length >= maxAllowed / word.length) {
//       return true;
//     }
//   }
//   return false;
// };

// const hasTooManyOfOneChar = (word, guess) => {
//   const charCounts = {};
//   for (const char of word) {
//     charCounts[char] = (charCounts[char] || 0) + 1;
//   }
//   const maxAllowed = Math.ceil(word.length / Object.keys(charCounts).length * 1.5);

//   let totalCharCount = guess.length;
//   const charCountInGuess = {};
//   for (const char of guess) {
//     charCountInGuess[char] = (charCountInGuess[char] || 0) + 1;
//   }

//   for (const char in charCounts) {
//     const countInWord = charCounts[char];
//     const countInGuess = charCountInGuess[char] || 0;
//     const maxAllowedCount = Math.ceil(maxAllowed * countInWord / word.length);
//     if (countInGuess > maxAllowedCount) {
//       return true;
//     }
//     totalCharCount -= countInGuess;
//   }

//   const remainingMaxAllowed = Math.ceil(maxAllowed * (word.length - totalCharCount) / word.length);
//   if (remainingMaxAllowed < 1) {
//     return true;
//   }

//   return false;
// };

// const hasTooManyOfOneChar = (word, guess, correctGuesses) => {
//   const charCounts = {};
//   for (const char of word) {
//     charCounts[char] = (charCounts[char] || 0) + 1;
//   }
//   const maxAllowed = Math.ceil(word.length / Object.keys(charCounts).length * 1.5);

//   const totalCharCount = guess.length;
//   const charCountInGuess = {};
//   for (const char of guess) {
//     charCountInGuess[char] = (charCountInGuess[char] || 0) + 1;
//   }
//   for (const char of correctGuesses) {
//     charCountInGuess[char] = (charCountInGuess[char] || 0) + 1;
//   }

//   for (const char in charCounts) {
//     const countInWord = charCounts[char];
//     const countInGuess = charCountInGuess[char] || 0;
//     const maxAllowedCount = Math.ceil(maxAllowed * countInWord / word.length);
//     if (countInGuess > maxAllowedCount) {
//       return true;
//     }
//     totalCharCount -= countInGuess;
//   }

//   const remainingMaxAllowed = Math.ceil(maxAllowed * (word.length - totalCharCount) / word.length);
//   if (remainingMaxAllowed < 1) {
//     return true;
//   }

//   return false;
// };

const hasTooManyOfOneChar = (word, guess, correctGuesses) => {
  const charCounts = {};
  for (const char of word) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }

  // Remove positions of correctly guessed letters from word and guess
  const correctIndices = new Set(correctGuesses);
  let filteredWord = '';
  let filteredGuess = '';
  for (let i = 0; i < word.length; i++) {
    if (!correctIndices.has(i)) {
      filteredWord += word[i];
      filteredGuess += guess[i] || ''; // Account for partial guesses
    }
  }

  const maxAllowed = Math.ceil(filteredWord.length / Object.keys(charCounts).length * 1.5);

  let totalCharCount = filteredGuess.length;
  const charCountInGuess = {};
  for (const char of filteredGuess) {
    charCountInGuess[char] = (charCountInGuess[char] || 0) + 1;
  }

  for (const char in charCounts) {
    const countInWord = filteredWord.split(char).length - 1;
    const countInGuess = charCountInGuess[char] || 0;
    const maxAllowedCount = Math.ceil(maxAllowed * countInWord / filteredWord.length);
    if (countInGuess > maxAllowedCount) {
      return true;
    }
    totalCharCount -= countInGuess;
  }

  const remainingMaxAllowed = Math.ceil(maxAllowed * (filteredWord.length - totalCharCount) / filteredWord.length);
  if (remainingMaxAllowed < 1) {
    return true;
  }

  return false;
};


// const checkWordGuess = (guess) => {
//   let w = usw(player.currentWord);

//   fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + guess, {
//     method: 'GET', // or 'PUT' // data can be `string` or {object}!
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   }).then(res => res.json())
//     .then(response => {
//       if (response.hasOwnProperty("resolution") && !isWord(guess)) {
//         displayMessage(guess + " is not a word!!!");
//         clearInputs();
//         let num = player.placeHolder.findIndex((x) => x === "");
//         if (num === -1) {
//           num = 0;
//         }
//         document.getElementById("letter" + (num + 1)).focus();
//         return;
//       }
//       //handleGuess(guess);
//     })
//     .catch(error => console.error('Error:', error));
// }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function handleInputFocus(event) {
  const currentInput = event.target;
  if (currentInput.value === "") return;
  const inputs = document.querySelectorAll('.letterBox');
  const currentIndex = Array.from(inputs).indexOf(currentInput);

  // Find the next unfilled input that is not marked as correct
  const nextInput = [...inputs].slice(currentIndex + 1).find(input => input.value === '' && !input.classList.contains('correct'));
  if (nextInput) {
    nextInput.focus();
    return;
  }

  // If no more unfilled inputs that are not correct, stay on the current input
  currentInput.focus();
}

function handleBackspace(event) {
  const currentInput = event.target;
  if (event.key === "Backspace" && currentInput.value === '') {
    const inputs = document.querySelectorAll('.letterBox');
    const currentIndex = Array.from(inputs).indexOf(currentInput);
    const previousInput = [...inputs].slice(0, currentIndex).reverse().find(input => !input.classList.contains('correct'));
    if (previousInput) {
      previousInput.focus();
      return;
    }
  }
}

function createInputs(sentence) {
  const words = sentence.split(' ');
  const inputs = [];
  const inputValues = [];
  let charCount = 1;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordContainer = document.createElement('div');
    wordContainer.classList.add('wordsRow');
    const inputValuesForWord = [];

    for (let j = 0; j < word.length; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.id = "letter" + charCount
      input.dataset.index = j;
      input.placeholder = '_';
      input.autocomplete = "off";
      input.oninput = handleInputFocus;
      input.onkeydown = handleBackspace;
      input.classList.add('letterBox');
      wordContainer.appendChild(input);
      inputs.push(input);
      inputValuesForWord.push('_');

      charCount++;
    }
    charCount++;
    inputValues.push(inputValuesForWord);
    document.getElementById('words').appendChild(wordContainer);
  }

  return { inputs, inputValues };
}

const continueCheck = (word, guess) => {
  let check = true;
  let score = getSimilarityScore(guess, word);

  let tooManyChar = hasTooManyOfOneChar(joinWord(word), joinWord(guess), player.currentChallenge.correctLetters);

  if (tooManyChar) check = false;
  if (!guess.search(/[aeiou]/g)) check = false;
  if (!guess.search(/^[A-Za-z ]+$/)) check = false;
  check = score < 50 ? false : true;

  if (!check) {

    return false;
  }

  return true;
}

const checkWordGuess = async (guess) => {
  let c = await checkName(guess, "words");
  if (c) {
    return true;
  } else {
    return false;
  }
}


const checkAnimalGuess = async (guess, word) => {
  let c = await checkName(guess, "animals");
  let r = await RiTa.hasWord(guess);
  if (c || r) {
    return true;
  } else {
    return await continueCheck(word, guess);
  }
}

const checkCarGuess = async (guess, word) => {
  let c = await checkName(guess, "cars");
  let r = await RiTa.hasWord(guess);
  if (c || r) {
    return true;
  } else {
    return await continueCheck(word, guess);
  }
}

const checkCityGuess = async (guess, word) => {
  let c = await checkName(guess, "cities");
  let r = await RiTa.hasWord(guess);
  if (c || r) {
    return true;
  } else {
    return await continueCheck(word, guess);
  }
}

const checkSportGuess = async (guess, word) => {
  let c = await checkName(guess, "sports", { sportC: extra });
  let r = await RiTa.hasWord(guess);
  if (c || r) {
    return true;
  } else {
    return await continueCheck(word, guess);
  }
}

const checkMovieGuess = async (guess, word) => {
  let c = await checkName(guess, "movies");
  let r = await RiTa.hasWord(guess);
  if (c || r) {
    return true;
  } else {
    return await continueCheck(word, guess);
  }
}

const checkName = async (name, path, extra) => {

  try {
    //salmon-barnacle-shoe.cyclic.app
    const response = await fetch(`${url}categories/${path}/check`, {
      method: 'POST', // or 'PUT' // data can be `string` or {object}!
      body: JSON.stringify({
        name,
        ...extra
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const jsonData = await response.json();
    return jsonData.data[0];

  } catch (error) {
    console.log(error);
    return false;
  }

}

const validateGuess = async (guess, word) => {

  switch (selectedCategory) {
    case "wordsItem":
      return await checkWordGuess(guess);
    case "animalsItem":
      return await checkAnimalGuess(guess, word)
    case "carsItem":
      return await checkCarGuess(guess, word);
    case "citiesItem":
      return await checkCityGuess(guess, word);
    case "sportsItem":
      return await checkSportGuess(guess, word);
    case "moviesItem":
      return await checkMovieGuess(guess, word);
  }

}

const handlePlayerAttempt = async () => {
  let word = usw(player.currentWord).toLowerCase();
  const inputs = document.querySelectorAll('.letterBox');
  const guess = Array.from(inputs).map(input => input.value).join('').toLowerCase();

  let guessWSpace = "";
  let count = 0;
  for (let i = 0; i < word.length; i++) {

    if (word.charAt(i) === " ") {
      guessWSpace += " ";
    } else {
      guessWSpace += "" + guess.charAt(count);
      count++;
    }

  }

  if (player.currentChallenge.prevGuesses.includes(guessWSpace)) {
    displayMessage("Please enter a different guess!");
    clearIncorrectInputs(inputs);
    focusNextOpenInput();
    return;
  }

  if (guessWSpace.length < word.length) {
    displayMessage("Please fill out all letter blocks!");
    focusNextOpenInput();
    return;
  }


  let validate = await validateGuess(guessWSpace, word);


  if (guessWSpace !== word && !validate) {
    displayMessage("That is not correct, keep trying!");
    clearIncorrectInputs(inputs);
    focusNextOpenInput();
    return;
  }

  let check = checkNewGuess(word, guessWSpace);
  const notMatchedIndexes = check.notMatchedIndexes.concat(check.outOfPlaceIndexes).sort((a, b) => a - b);
  const wordLetters = word.split('');
  const spaces = [...wordLetters.join('').matchAll(new RegExp(" ", 'gi'))].map(a => a.index);
  player.currentChallenge.prevGuesses.unshift(guessWSpace);

  // Highlight correct letters
  check.matchedIndexes.forEach(index => {

    if (spaces.findIndex((i) => index === i) === -1) {
      document.getElementById("letter" + (index + 1)).classList.add('correct');
      document.getElementById("letter" + (index + 1)).style.backgroundColor = "#4cd74c";
      document.getElementById("letter" + (index + 1)).disabled = true;
    }

  });

  player.currentChallenge.correctLetters = player.currentChallenge.correctLetters.concat(check.correctLetters);
  notMatchedIndexes.forEach(index => {
    if (spaces.findIndex((i) => index === i) === -1) {

      document.getElementById("letter" + (index + 1)).value = "";
    }
  });
  updatePrevGuesses();
  if (check.correctLetters.length === wordLetters.length) {
    player.totalWordsCompleted++;
    player.totalTimeSpent += (player.currentChallenge.ogTime - player.currentTime);
    player.totalCharCount += joinWord(word).length;
    addCorrectWord(word);
    displayMessage("Success! You guessed the word");
    handlePoints();
    document.getElementById("guessIncorrect").innerHTML = "";
    document.getElementById("guessOutOfPlace").innerHTML = "";
    player.wordsCompleted.push(word);
    calcSpeed((player.currentChallenge.ogTime - player.currentTime), word.length);
    updatePlayer();
    if (inLobby) {
      updateGameData();
      let p = player.lobbyData.player;
      p.wordsGuessed.push(word);
      handleHTHGuess(p);
    } else {

      clearInterval(timer);
      player.currentChallenge.wordCompleted = true;
      player.wordsCompleted.push(word);

      if (player.currentChallenge.challengeI === 2) {
        player.currentChallenge.challengeCompleted = true;
        player.totalChallenegesCompleted++;
        player.totalPoints += 15;
        // document.getElementById("score").innerHTML = "" + player.totalPoints;
        updateGameData();
        gameOver("You have completed the Frenzy!!!")
      } else {
        updateGameData();
        document.getElementById("message2").innerHTML = "";
        document.getElementById("guess").style.display = "none";
        timerFunc(() => {
          displayMessage("Next word incomming!");
          document.getElementById("words").innerHTML = "";
          timerFunc(() => {
            intermission();
          }, 1000)
        }, 2000)
      }
    }
  } else {
    // Highlight out of place letters

    let newTempInc = player.currentChallenge.incorrectLetters;

    for (let i = 0; i < check.incorrectLetters.length; i++) {
      let incCount = newTempInc.filter((l) => l === check.incorrectLetters[i]).length;

      if (incCount === 0) {
        newTempInc.push(check.incorrectLetters[i]);
      }
    }

    player.currentChallenge.incorrectLetters = newTempInc;

    let newTempOOP = player.currentChallenge.outOfPlaceLetters;

    for (let i = 0; i < check.outOfPlaceLetters.length; i++) {
      let oopCount = newTempOOP.filter((l) => l === check.outOfPlaceLetters[i]).length;
      let wCount = word.split("").filter((l) => l === check.outOfPlaceLetters[i]).length;
      if (oopCount < wCount) {
        newTempOOP.push(check.outOfPlaceLetters[i]);
      }
    }

    player.currentChallenge.outOfPlaceLetters = newTempOOP;

    // let newIncorrect = check.incorrectLetters.filter((l) => !player.currentChallenge.incorrectLetters.includes(l));
    // if (newIncorrect.length > 0) {
    //   player.currentChallenge.incorrectLetters = player.currentChallenge.incorrectLetters.concat(newIncorrect);
    // }
    // let newOOP = check.outOfPlaceLetters.filter((l) => !player.currentChallenge.outOfPlaceLetters.includes(l));
    // if (newOOP.length > 0) {
    //   player.currentChallenge.outOfPlaceLetters = player.currentChallenge.outOfPlaceLetters.concat(newOOP);

    // }

    document.getElementById("guessIncorrect").innerHTML = "" + player.currentChallenge.incorrectLetters.join(' | ');
    document.getElementById("guessOutOfPlace").innerHTML = "" + player.currentChallenge.outOfPlaceLetters.join(' | ');
    document.getElementById("message").innerHTML = "You got " + (check.incorrectLetters.length > 0 ? check.incorrectLetters.join(', ') : "none ") + " incorrect | You got " + (check.outOfPlaceLetters.length > 0 ? check.outOfPlaceLetters.join(', ') : "none") + " out of place";
    focusNextOpenInput();
  }

};



const clearIncorrectInputs = (inputs) => {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (!input.disabled && !input.classList.contains('correct')) {
      input.value = '';
    }
  }
};

const focusNextOpenInput = () => {
  const inputs = document.querySelectorAll('input');

  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].value) {
      inputs[i].focus();
      //handleInputStyle(inputs[i]);
      break;
    }
  }
}
// function handleInputStyle(event) {
//   const selectedInput = event;
//   const previouslySelectedInput = document.querySelector('.selected');

//   if (previouslySelectedInput) {
//     previouslySelectedInput.classList.remove('selected');
//   }

//   selectedInput.classList.add('selected');
// }
const checkNewGuess = (word, guess) => {
  const matchedIndexes = [];
  const notMatchedIndexes = [];
  const incorrectLetters = [];
  const outOfPlaceLetters = [];
  const correctLetters = [];
  const outOfPlaceIndexes = [];

  const wordLetters = word.split('');
  const guessLetters = guess.split('');

  // Check for correct order and matches
  for (let i = 0; i < wordLetters.length && i < guessLetters.length; i++) {
    const letter = guessLetters[i];
    if (wordLetters[i] === letter) {
      matchedIndexes.push(i);
      correctLetters.push(letter);
    } else {
      notMatchedIndexes.push(i);
    }
  }

  // Check for correct letters in wrong place
  for (let i = 0; i < guessLetters.length; i++) {
    if (matchedIndexes.includes(i)) continue;
    const letter = guessLetters[i];
    const index = wordLetters.indexOf(letter);
    if (index !== -1 && !matchedIndexes.includes(index) && !outOfPlaceIndexes.includes(index)) {
      outOfPlaceIndexes.push(index);
      outOfPlaceLetters.push(letter);
    } else {
      incorrectLetters.push(letter);
    }
  }

  // Remove duplicates from notMatchedIndexes and outOfPlaceIndexes arrays
  const uniqueNotMatchedIndexes = Array.from(new Set(notMatchedIndexes));
  const uniqueOutOfPlaceIndexes = Array.from(new Set(outOfPlaceIndexes));

  // Combine notMatchedIndexes and outOfPlaceIndexes arrays and sort them in ascending order
  const notMatchedOrOutOfPlaceIndexes = uniqueNotMatchedIndexes.concat(uniqueOutOfPlaceIndexes).sort();

  // Return an object with the results
  return {
    matchedIndexes,
    notMatchedIndexes: notMatchedOrOutOfPlaceIndexes.filter(index => !outOfPlaceIndexes.includes(index)),
    outOfPlaceIndexes: uniqueOutOfPlaceIndexes,
    incorrectLetters,
    outOfPlaceLetters,
    correctLetters
  };
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const addCorrectWord = (word) => {
  const li = document.createElement("li");
  li.innerHTML = word;
  document.getElementById("correctWords").appendChild(li);
}


const resetPlayer = () => {
  let newPlayer = {
    challengesCompleted: player.challengesCompleted,
    currentCPS: player.currentCPS,
    challengeStarted: player.challengeStarted,
    wordsCompleted: player.wordsCompleted,
  }

  player = {
    ...playerModel,
    ...newPlayer,
  };

}


const gameOver = (message) => {
  resetPlayer();
  document.getElementById("words").innerHTML = "<p>Please Refresh the browser to go back to the home page</p>";
  displayMessage(message)
  document.getElementById("guess").style.display = "none";
  document.getElementById("continueGame").style.display = "block";
}

const nextLevel = () => {
  player.guesses = [];
  player.placeHolder = [];
  player.currentChallenge.correctLetters = [];
  player.currentChallenge.incorrectLetters = [];
  player.currentChallenge.outOfPlaceLetters = [];
}

const intermission = () => {

  let count = 3;

  document.getElementById("prevWords").innerHTML = "";
  document.getElementById("prevWords").style.overflowY = "hidden";
  document.getElementById("message2").innerHTML = "";
  timer = setInterval(() => {

    if (count > 0) {
      displayMessage("" + count)
      count--;
    }

  }, 1000);

  timerFunc(() => {
    nextLevel()
    player.currentChallenge.challengeI++;
    playRound();
  }, 4500);

}


const setNewPlayer = () => {
  let obj = {
    totalPoints: 0,
    totalTimeSpent: 0,
    totalChallenegesCompleted: 0,
    totalWordsCompleted: 0,
    totalCharCount: 0,
    speedData: {
      totalChar: 5,
      totalTime: 100
    }
  };

  setCookie("player", JSON.stringify(obj), 100);
}

const updatePlayer = () => {

  let data = getCookie("player");

  if (data != "") {
    let obj = {
      totalPoints: player.totalPoints,
      totalTimeSpent: player.totalTimeSpent,
      totalChallenegesCompleted: player.totalChallenegesCompleted,
      totalWordsCompleted: player.totalWordsCompleted,
      totalCharCount: player.totalCharCount,
      speedData: {
        totalChar: player.speedData.totalChar,
        totalTime: player.speedData.totalTime
      }
    }
    setCookie("player", JSON.stringify(obj), 100);
    let spc = Math.floor(player.speedData.totalTime / player.speedData.totalChar) + 1;
    loadData(spc)
  }

}

const checkPlayer = () => {
  let data = getCookie("player");

  if (data != "") {
    let user = JSON.parse(data);

    let spc = 0;
    // if (!user.speedData) {
    //   spc = Math.floor(parseInt(player.speedData.totalChar) / parseInt(player.speedData.totalTime)) + 1;
    // } else {
    spc = Math.floor(parseInt(user.speedData.totalTime) / parseInt(user.speedData.totalChar)) + 1;
    // }
    player.totalPoints = parseInt(user.totalPoints);
    player.totalTimeSpent = parseInt(user.totalTimeSpent);
    player.totalChallenegesCompleted = parseInt(user.totalChallenegesCompleted);
    player.totalWordsCompleted = parseInt(user.totalWordsCompleted);
    player.totalCharCount = parseInt(user.totalCharCount);
    player.speedData.totalChar = parseInt(user.speedData.totalChar)
    player.speedData.totalTime = parseInt(user.speedData.totalTime)
    player.currentCPS = spc;

    loadData(spc);

  } else {
    setNewPlayer();
    loadData(20);
  }

}

const calcTime = (w) => {
  let time = w.length * 20;

  switch (selectedDiff) {
    case 0:
      time = (w.length * player.currentCPS) + (Math.floor((w.length * player.currentCPS) * .3) + 1);
      break;
    case 1:
      time = w.length * player.currentCPS;
      break;
    case 2:
      time = (w.length * player.currentCPS) - (Math.floor((w.length * player.currentCPS) * .25));
      break;
    case 3:
      time = (w.length * player.currentCPS) - (Math.floor((w.length * player.currentCPS) * .5));
      break;

  }

  if (time < 1) {
    time = 1;
  }

  return time;

}

const handleModes = async (num) => {

  switch (selectedCategory) {
    case "wordsItem":
      return await getWord()
    case "animalsItem":
      return await getAnimal()
    case "carsItem":
      return await getCar()
    case "citiesItem":
      return await getCity()
    case "sportsItem":
      return await getSport()
    case "moviesItem":
      return await getMovie()
  }

}


const playRound = async () => {

  //clearInterval(timer);
  // document.getElementById("continueGame").style.display = "none";
  // let newWord = getWord(num, num);
  let res = await handleModes();

  let h = res[0];
  const start = () => {
    let w = usw(h);

    let startTime = 1000;//calcTime(w);
    setSession(w, h, startTime);
    document.getElementById("message2").innerHTML = "";
    createInputs(w);
    timerFunc(() => {
      startTimer();
      focusNextOpenInput();
      displayMessage("Time has started!");
      document.getElementById("guess").style.display = "block";
    }, 100);
  }

  await start();

}
async function playHeadToHead(h, t) {

  const start = () => {
    let w = usw(h);

    setSession(w, h, t);
    document.getElementById("message2").innerHTML = "";
    timerFunc(() => {
      createInputs(w);
      startTimer();
      focusNextOpenInput();
      displayMessage("Time has started!");
      document.getElementById("guess").style.display = "block";
      document.getElementById("getHint").style.display = "block";
      document.getElementById("getHint").innerHTML = `${hintsRemaining} hints rem`;
    }, 3000);
  }

  await start();

}

const continueGame = () => {
  player.currentChallenge.challengeI = 0;
  document.getElementById("continueGame").style.display = "none";
  player.currentChallenge.challengeCompleted = false;
  document.getElementById("correctWords").innerHTML = "";
  document.getElementById("words").innerHTML = "";
  document.getElementById("message2").innerHTML = "";
  document.getElementById("time").innerHTML = "";
  document.getElementById("prevWords").innerHTML = "";
  displayMessage("Get ready!!!")
  setTimeout(() => {
    playRound();
  }, 3000);

}


const setSession = (w, h, t) => {

  player.wordLen = joinWord(w).length;
  player.currentWord = h;
  player.currentChallenge.prevGuess = "";
  player.currentChallenge.prevGuesses = [];
  player.currentChallenge.hints.completed = false;
  player.currentChallenge.hints.hintMessages = [];
  player.currentChallenge.hints.maxHints = 0;
  player.currentChallenge.hints.triggers = [];
  player.currentChallenge.hints.used = [];
  player.currentTime = t;
  player.currentChallenge.ogTime = t;
  let hintData = calculateHintTriggers(t, joinWord(w).length);
  //if (startTime < 30) player.currentChallenge.hints.completed = true;
  player.currentChallenge.hints.triggers = hintData.triggers
  player.currentChallenge.hints.maxHints = hintData.hints;
  player.challengeStarted = true;
  player.currentChallenge.wordCompleted = false;
  player.currentChallenge.correctLetters = [];
  player.currentChallenge.incorrectLetters = [];
  player.currentChallenge.outOfPlaceLetters = [];

}

const getWord = async () => {
  let num = 4 + player.currentChallenge.challengeI;

  let data = await fetch(`${url}categories/words?min=${num}&max=${num}`);
  //let data = await fetch(`https://salmon-barnacle-shoe.cyclic.app/words/word/?min=${num}&max=${num}&p=${pos}`);
  //use string literals
  let dataJson = await data.json();
  return dataJson.data;
}

const getAnimal = async () => {

  let min = 3;
  let max = 10;

  if (player.currentChallenge.challengeI === 1) {
    min = 6;
    max = 16
  }
  if (player.currentChallenge.challengeI === 2) {
    min = 9;
    max = 25
  }
  let data = await fetch(`${url}categories/animals?min=${min}&max=${max}`);
  //let data = await fetch(`${url}words/word/?min=${num}&max=${num}&p=${pos}`);
  //use string literals
  let dataJson = await data.json();
  return dataJson.data;
}
const getCar = async () => {
  let min = 3;
  let max = 10;

  if (player.currentChallenge.challengeI === 1) {
    min = 4;
  }
  if (player.currentChallenge.challengeI === 2) {
    min = 5;
  }

  let data = await fetch(`${url}categories/cars?min=${min}&max=${max}`);
  //let data = await fetch(`${url}words/word/?min=${num}&max=${num}&p=${pos}`);
  //use string literals
  let dataJson = await data.json();
  return dataJson.data;
}

const getCity = async () => {
  let min = 3;
  let max = 8;

  if (player.currentChallenge.challengeI === 1) {
    min = 5;
    max = 12;
  }
  if (player.currentChallenge.challengeI === 2) {
    min = 8;
    max = 25;
  }

  let data = await fetch(`${url}categories/cities?min=${min}&max=${max}`);
  //let data = await fetch(`${url}words/word/?min=${num}&max=${num}&p=${pos}`);
  //use string literals
  let dataJson = await data.json();
  extra = dataJson.data[1];
  return dataJson.data;
}

const getSport = async () => {
  let min = 3;
  let max = 6;

  if (player.currentChallenge.challengeI === 1) {
    min = 5;
    max = 12;
  }
  if (player.currentChallenge.challengeI === 2) {
    min = 8;
    max = 25;
  }

  let data = await fetch(`${url}categories/sports?min=${min}&max=${max}`);
  //let data = await fetch(`${url}words/word/?min=${num}&max=${num}&p=${pos}`);
  //use string literals
  let dataJson = await data.json();
  extra = dataJson.data[1];
  return dataJson.data;
}

const getMovie = async () => {
  let min = 3;
  let max = 7;

  if (player.currentChallenge.challengeI === 1) {
    min = 7;
    max = 11;
  }
  if (player.currentChallenge.challengeI === 2) {
    min = 11;
    max = 25;
  }

  let data = await fetch(`${url}categories/movies?min=${min}&max=${max}`);
  //let data = await fetch(`${url}words/word/?min=${num}&max=${num}&p=${pos}`);
  //use string literals
  let dataJson = await data.json();
  return dataJson.data;
}

const getHint = async (payload) => {

  let data = await fetch(`${url}hints`, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  //let data = await fetch(`${url}words/word/?min=${num}&max=${num}&p=${pos}`);
  //use string literals
  let dataJson = await data.json();
  return dataJson.data;
}


const handleCategorySel = (id) => {
  // setCookie("selCat", id, 100);
  // let catArr = document.getElementsByClassName("categoriesItem");



  // for (let i = 0; i < catArr.length; i++) {
  //   if (document.getElementById(catArr[i].id).classList.contains("selectedItem")) {
  //     document.getElementById(catArr[i].id).classList.remove("selectedItem");
  //   }
  // };

  // selectedCategory = id;

  // document.getElementById(id).classList.add("selectedItem");

}

const joinWord = (word) => word.includes(" ") ? word.split(" ").join("") : word


const handleDiff = (num) => {
  selectedDiff = num;
  setCookie("selDiff", num, 100);
}

const createCategories = () => {

  // const categories = ["Words", "Animals", "Cars", "Cities", "Sports", "Movies"];

  // categories.map((cat, i) => {
  //   const colors = ['#181818', 'rgb(187, 84, 84)', '#2C3E50', '#9B59B6', '#F1C40F', '#1ABC9C', '#E67E22', '#3498DB', '#BDC3C7', '#2980B9'];
  //   let id = getCatId(cat.toLowerCase());
  //   let div = `<div class="categoriesItem" id="${id}" onclick="handleCategorySel('${id}')"><h4>${cat}</h4></div>`;
  //   let c = cat.split(" ");

  //   if (c.length > 1) {
  //     let joined = c.join("");
  //     id = getCatId(joined.toLowerCase());

  //     div = `<div class="categoriesItem" id="${id}" onclick="handleCategorySel('${id}')"><h4>${cat.split(" ")[0]} ${cat.split(" ")[1]}</h4></div>`;
  //   }
  //   document.getElementById("categoriesContent").innerHTML += div;
  // })


}


createCategories();

const showHtp = () => document.getElementById("howToPlayContentWrapper").style.display = "flex";
const hideHtp = () => document.getElementById("howToPlayContentWrapper").style.display = "none";

if (selectedCategory === "" && !inLobby) {
  let cookie = getCookie("selCat");
  let selItem = "wordsItem";
  if (cookie) {
    selItem = cookie;
  }

  handleCategorySel(selItem);
}

if (selectedDiff === 1 && !inLobby) {
  let cookie = getCookie("selDiff");
  if (cookie) {
    selectedDiff = parseInt(cookie);
    document.getElementById("diff1" + selectedDiff).checked = true;
  }

}

if (!dataLoaded) {
  checkPlayer();
  dataLoaded = true;
}


//6430f475530103d3127f0d16
//64320d2d3410c4b03cafdbfa
const getGameData = async () => {

  if (player.currentTime > 0) return;

  let input = document.getElementById("gameCode");

  let data = await fetchGameData(`?id=${input.value}`);

  if (data) {


    setCookie("gameCode", input.value);

    input.value = "";
    let dataStr = await JSON.stringify(data);

    closeGameData();

    await setCookie("player", dataStr);

    await checkPlayer();

  }

}
const fetchGameData = async (end, extra) => {
  try {
    let data = await fetch(`${url}users${end}`, { ...extra });
    let dataJson = await data.json();

    return dataJson.data[0];
  } catch (error) {
    return false;
  }
}

const getNewGameCode = async () => {

  let code = await getCookie("gameCode");
  let player = await getCookie("player");
  let mess = "";
  if (!code && player) {
    let playerData = await JSON.parse(player);

    if (playerData.totalWordsCompleted > 0) {
      let res = await fetchGameData('/save', {
        method: 'POST', body: JSON.stringify({ data: [playerData] }), headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res) {
        mess = res;
        await setCookie("gameCode", res);
      } else {
        mess = "Not able to get code, please try again later!";
      }

    } else {
      mess = "Please play a Frenzy before generating a code!";
    }

  } else {
    mess = code;
  }

  document.getElementById("newCode").innerHTML = mess;

}

const updateGameData = async () => {
  let code = await getCookie("gameCode");
  let player = await getCookie("player");
  if (code && player) {
    let playerData = await JSON.parse(player);
    let res = await fetchGameData('/update', {
      method: 'POST', body: JSON.stringify({ id: code, data: [playerData] }), headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res) {
      console.log("Game data updated");
    } else {
      console.log("Game data not updated");
    }
  }
}

const openGameData = () => {
  if (player.currentTime > 0) return;
  document.getElementById("getMyDataWrapper").style.display = "flex";
}

const closeGameData = () => {
  document.getElementById("getMyDataWrapper").style.display = "none";
}
const openHeadToHead = () => {
  if (inLobby || player.currentTime > 0) return;
  document.getElementById("headToHeadWrapper").style.display = "flex";
}

const closeHeadToHead = () => {
  document.getElementById("headToHeadWrapper").style.display = "none";
}

const createNewLobby = () => {
  connect();
}

if (!inLobby) {
  let check = getCookie("inLobby");

  if (check) {
    inLobby = true;
    reJoinLobby();
  }
}

const getLobCatId = (cat) => {
  let c = cat.split(" ");
  let str = c;
  if (c.length > 1) {
    let joined = c.join("");
    str = joined;
  }

  str += "LobbyItem";

  return str;
}

const getCatId = (cat) => {
  let c = cat.split(" ");
  let str = c;
  if (c.length > 1) {
    let joined = c.join("");
    str = joined;
  }

  str += "Item";

  return str;
}

const createLobbyCategories = () => {

  const categories = ["Words", "Animals", "Cars", "Cities", "Sports", "Movies"];

  categories.map((cat, i) => {
    const colors = ['#181818', 'rgb(187, 84, 84)', '#2C3E50', '#9B59B6', '#F1C40F', '#1ABC9C', '#E67E22', '#3498DB', '#BDC3C7', '#2980B9'];
    let id = getLobCatId(cat.toLowerCase());
    let name = i === 1 ? "selectedLobbyItem" : "";
    let div = `<div class="categoriesLobbyItem ${name}" id="${id}" onclick="handleLobbyCategorySel('${id}')"><h4>${cat}</h4></div>`;
    document.getElementById("categoriesLobbyContent").innerHTML += div;
  })


}


const handleLobbyCategorySel = (id) => {
  let isCreator = player.lobbyData.player.isCreator;
  if (!isCreator) return;
  setCookie("selLobCat", id, 100);
  let catArr = document.getElementsByClassName("categoriesLobbyItem");



  for (let i = 0; i < catArr.length; i++) {
    if (document.getElementById(catArr[i].id).classList.contains("selectedLobbyItem")) {
      document.getElementById(catArr[i].id).classList.remove("selectedLobbyItem");
    }
  };

  selectedCategory = id;

  document.getElementById(id).classList.add("selectedLobbyItem");

  displayLobbyToRomm(id);

}

createLobbyCategories();

const getHTHHint = () => {

  if (hintsRemaining === 0) return;

  let regex = /Lobby/;
  let s = lobbySettings.catSel.replace(regex, "")

  handleHint(hintsRemaining, s);

  hintsRemaining--;



  if (hintsRemaining <= 0) {
    document.getElementById("getHint").style.display = "none";
  } else {
    document.getElementById("getHint").innerHTML = `${hintsRemaining} hints rem`;
  }

}