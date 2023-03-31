let playerModel = {
  currentChallenge: {
    type: "",
    wordsI: 0,
    challengeI: 0,
    wordCompleted: false,
    challengeCompleted: false,
    totalPoints: 0,
    totalWords: 3,
    prevGuess: "",
    prevGuesses: []
  },
  challengesCompleted: [],
  currentCPS: 20,
  challengeStarted: false,
  currentTime: 0,
  guesses: [],
  currentWord: "",
  placeHolder: [],
  wordsCompleted: [],
  wordLen: 0,
  hintUsed: false,
  secondHintUsed: false,
  hintThreshold: 0,
  totalPoints: 0,
  totalWordsCompleted: 0,
  totalChallenegesCompleted: 0,
  totalTimeSpent: 0,
  totalCharCount: 0
}


let dataLoaded = false;

let jokeCounter = 1;

let player = playerModel;


let timer = null;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];


// const getWord = (min = 4, max = 4) => RiTa.randomWord({ minLength: min, maxLength: max });

const loadData = () => {
  let data = getCookie("player");
  if (data != "") {
    let user = JSON.parse(data);
    document.getElementById("totalPoints").innerHTML = user.totalPoints;
    document.getElementById("totalTime").innerHTML = user.totalTimeSpent + "s";
    document.getElementById("totalWords").innerHTML = user.totalWordsCompleted;
    document.getElementById("totalChallenges").innerHTML = user.totalChallenegesCompleted;
    let currentCPS = (parseInt(user.totalTimeSpent) / parseInt(user.totalCharCount));
    if (user.totalCharCount < 1) currentCPS = 1;
    if (user.totalCharCount === 0) currentCPS = 0;
    document.getElementById("currentCPS").innerHTML = currentCPS.toFixed(0);
  } else {
    document.getElementById("totalPoints").innerHTML = "0";
    document.getElementById("totalTime").innerHTML = "00";
    document.getElementById("totalWords").innerHTML = "0";
    document.getElementById("totalChallenges").innerHTML = "0";
    document.getElementById("currentCPS").innerHTML = "0";
  }
}

if (!dataLoaded) {
  loadData();
  dataLoaded = true;
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

  if (player.currentTime > 0) {
    let extraZero = player.currentTime < 10 ? "0" : "";
    updateTimerDsiplay("" + extraZero + player.currentTime);
    player.currentTime--;
    if (!player.hintUsed) {
      if (player.hintThreshold === 0) calcHintThreshhold();
      handleHint();
    } else if (player.hintUsed && !player.secondHintUsed && player.currentTime < 20) {
      handleSecondHint();
    }

  } else {
    updateTimerDsiplay("00");
    timesUp();
  }

}, 1000);

const calcPos = () => {
  let gen1 = Math.floor(Math.random() * 100) + 100;
  let gen2 = Math.floor(Math.random() * 1000000) + 1000000;
  let num = 4 + player.currentChallenge.challengeI;
  return "" + gen1 + "" + num + "" + gen2;
}
let hintType = "";
const handleHint = () => {

  if (player.currentTime === player.hintThreshold - 2) {
    let pos = calcPos();

    fetch(`https://salmon-barnacle-shoe.cyclic.app/words/hint?word=${player.currentWord}&p=${pos}&type=${hintType}`, {
      method: 'GET', // or 'PUT' // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
      .then(response => {

        if (!response.error) {
          let meaning = "";

          if (hintType === "synonym") {
            meaning = response.data.length > 3 ? response.data.slice(0, 3).join(", ") : response.data.join(", ");
          } else {
            meaning = response.data[0];
          }
          let fs = "16px";

          if (meaning.length > 35) {
            fs = "13px";
          }

          document.getElementById("message2").innerHTML = "<span style='font-size: " + fs + "'>" + meaning + "</span>";
          player.hintUsed = true;
        }
      }).catch((error) => {
        console.log(error);

      })

  } else if (player.currentTime === player.hintThreshold) {
    let m = "Heres ";
    if (hintType === "definition") {
      m += "the definition";
    } else {
      m += "a synonym(s)";
    }
    document.getElementById("message2").innerHTML = m;
  } else if (player.currentTime === player.hintThreshold + 3) {
    document.getElementById("message2").innerHTML = "Looks like you need help";
    let r = generateRandomNumber(0, 1);
    const hintTypes = ["definition", "synonym"];
    hintType = hintTypes[r];
  }
}


const handleSecondHint = () => {
  let w = handleWordRan(player.currentWord);
  let phLen = player.placeHolder.filter((x) => x === "");

  if (phLen.length < 2) return;

  if (player.currentCPS > 10) {
    if (player.currentTime === 19) {
      document.getElementById("message2").innerHTML = "Still need help?";
    } else if (player.currentTime === 17) {
      document.getElementById("message2").innerHTML = "Heres another hint!";
    } else if (player.currentTime === 15) {

      let index = calcSecondHint();

      let hint = w.charAt(index);

      let fs = "16px";
      let numberText = (index + 1) + "";
      if (index === 0) numberText += "st";
      if (index === 1) numberText += "nd";
      if (index === 2) numberText += "rd";
      if (index > 2) numberText += "th";
      document.getElementById("message2").innerHTML = "<span style='font-size: " + fs + "'>" + "The " + numberText + " letter is: " + hint + "</span>";
      player.secondHintUsed = true;

    }
  }
}

const calcSecondHint = () => {

  let indexArr = [];

  player.placeHolder.map((x, index) => {
    if (x === "") {
      indexArr.push(index);
    }
  })

  let r = generateRandomNumber(0, indexArr.length - 1);

  return indexArr[r];

}
const calcHintThreshhold = () => {

  let w = handleWordRan(player.currentWord);

  let total = 0;
  if (player.currentCPS < 21) {
    total = (w.length * player.currentCPS) / 2;
  } else if (player.currentCPS > 20 && player.currentCPS < 31) {
    total = (w.length * player.currentCPS) / 2.2;
  } else if (player.currentCPS > 30 && player.currentCPS < 41) {
    total = (w.length * player.currentCPS) / 2.4;
  } else if (player.currentCPS > 40) {
    total = (w.length * player.currentCPS) / 2.6;
  }
  player.hintThreshold = Math.round(total);
};

const timesUp = () => {

  clearInterval(timer);

  let w = handleWordRan(player.currentWord);

  timer = null;
  document.getElementById("message2").innerHTML = "The word was: " + w + "";
  gameOver("Times up! You have failed!!!");
}

const updateTimerDsiplay = (sec, min = 0) => {
  document.getElementById("time").innerHTML = "" + sec + "s";
}

const displayGame = () => {
  document.getElementById("startMenu").style.display = "none";
  document.getElementById("gameContent").style.display = "flex";
}
const displayMainMenu = () => {
  document.getElementById("startMenu").style.display = "flex";
  document.getElementById("gameContent").style.display = "none";
}

const displayMessage = (message) => document.getElementById("message").innerHTML = message;


const updateWordDisplay = (index, letter) => {
  document.getElementById("letter" + (index + 1)).innerHTML = letter;
}

const createPH = () => {
  let w = handleWordRan(player.currentWord);
  document.getElementById("words").innerHTML = "";
  for (let i = 0; i < w.length; i++) {
    player.placeHolder.push("");
  }

  for (let i = 0; i < w.length; i++) {
    const input = document.createElement("input");
    //input.innerHTML = "";
    input.id = "letter" + (i + 1);
    input.className = "letterBox";
    input.oninput = showLetter;
    input.onfocus = focusedInput;
    input.maxLength = 1;
    input.autocomplete = "off";
    input.placeholder = "";
    // input.disabled = i === 0 ? false : true;
    document.getElementById("words").appendChild(input);
  }

}

const focusedInput = (e) => {
  let num = parseInt(e.target.id.charAt(e.target.id.length - 1));
  player.currentChallenge.wordsI = num;
}

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


const handleWordRan = (word) => {

  let str = "";

  let num = 4 + player.currentChallenge.challengeI;

  switch (num) {
    case 4:
      str = word.charAt(4) + "" + word.charAt(9) + "" + word.charAt(13) + "" + word.charAt(17)
      break;
    case 5:
      str = word.charAt(3) + "" + word.charAt(7) + "" + word.charAt(11) + "" + word.charAt(16) + "" + word.charAt(21)
      break;
    case 6:
      str = word.charAt(3) + "" + word.charAt(6) + "" + word.charAt(10) + "" + word.charAt(15) + "" + word.charAt(18) + "" + word.charAt(22)
      break;
  }

  return str;

}

const handleRamNum = (word) => {
  let str = "";
  let num = 4 + player.currentChallenge.challengeI;
  for (let j = letters.length - 1; j > 0; j--) {
    let rand = [Math.floor(Math.random() * letters.length)];
    [letters[j], letters[rand]] = [letters[rand], letters[j]];
  }

  for (let i = 0; i < letters.length; i++) {

    if (num === 4) {
      if (i === 4) {
        letters[i] = word.charAt(0);
      } else if (i === 9) {
        letters[i] = word.charAt(1);
      } else if (i === 13) {
        letters[i] = word.charAt(2);
      } else if (i === 17) {
        letters[i] = word.charAt(3);
      }

    } else if (num === 5) {
      if (i === 3) {
        letters[i] = word.charAt(0);
      } else if (i === 7) {
        letters[i] = word.charAt(1);
      } else if (i === 11) {
        letters[i] = word.charAt(2);
      } else if (i === 16) {
        letters[i] = word.charAt(3);
      } else if (i === 21) {
        letters[i] = word.charAt(4);
      }
    } else if (num === 6) {
      if (i === 3) {
        letters[i] = word.charAt(0);
      } else if (i === 6) {
        letters[i] = word.charAt(1);
      } else if (i === 10) {
        letters[i] = word.charAt(2);
      } else if (i === 15) {
        letters[i] = word.charAt(3);
      } else if (i === 18) {
        letters[i] = word.charAt(4);
      } else if (i === 22) {
        letters[i] = word.charAt(5);
      }
    }


  }

  letters.map((x) => {
    str += x;
  })

  return str;

}

//======================================================================================================================================
//======================================================================================================================================
const showLetter = (e) => {

  document.getElementById(e.target.id).style.backgroundColor = "#f0f8ff";

  if (e.inputType === "deleteContentBackward") return;

  //handleJoke(e, document.getElementById(e.target.id).value);

  let strArray = e.target.id.split("");

  let endChar = parseInt(strArray[strArray.length - 1])

  if (endChar === player.wordLen) return;
  let inputs = document.getElementsByClassName("letterBox");

  let num = getWithinRange(player.currentChallenge.wordsI + 1, inputs.length);

  if (num > 0) {
    player.currentChallenge.wordsI = num;
    handleInputFocus(num);
  }

}

const getWithinRange = (start, end, type = "incr") => {
  let num = 0;

  switch (type) {
    case "decr":
      for (let i = start - 1; i > -1; i--) {
        let input = document.getElementById("letter" + (i + 1))

        if (player.placeHolder[i - 1] === "") {
          num = i;
          break;
        }
      }
      break;
    default:
      for (let i = start - 1; i < end; i++) {
        let input = document.getElementById("letter" + (i + 1))
        if (input.value === "" || player.placeHolder[i] === "") {
          num = i + 1;
          break;
        } else { continue }
      }
  }

  return num;
}

const handleInputFocus = (currentPos) => {
  document.getElementById("letter" + currentPos).focus();
}

const strToArr = (str) => {

  let words = [];

  for (let i = 0; i < str.length; i++) {
    words.push(str[i]);
  }

  return words;

}

const getInputs = () => {
  let str = "";
  for (let i = 0; i < player.wordLen; i++) {
    str += document.getElementById("letter" + (i + 1)).value;
  }

  return str;
}

// const handleInputBG = (allowed = true) => {

//   let lettersOOP = "";

//   for (let i = 0; i < player.placeHolder.length; i++) {
//     if (allowed && player.currentChallenge.wordCompleted || player.placeHolder[i] === "") {
//       let w = handleWordRan(player.currentWord);
//       let splitW = w.split("");
//       let wCount = splitW.filter((x) => x === player.currentChallenge.prevGuess.charAt(i));
//       let lSplit = lettersOOP.split("");
//       let lCount = lSplit.filter((x) => x === player.currentChallenge.prevGuess.charAt(i));

//       if (lCount < wCount) {
//         document.getElementById("letter" + (i + 1)).placeholder = player.currentChallenge.prevGuess.charAt(i);
//         document.getElementById("letter" + (i + 1)).style.backgroundColor = "#926b00"
//         document.getElementById("letter" + (i + 1)).value = "";
//         lettersOOP += player.currentChallenge.prevGuess.charAt(i);
//         console.log(player.currentChallenge.prevGuess.charAt(i));
//       } else {
//         document.getElementById("letter" + (i + 1)).value = "";
//         document.getElementById("letter" + (i + 1)).placeholder = player.currentChallenge.prevGuess.charAt(i);
//         document.getElementById("letter" + (i + 1)).style.backgroundColor = "#f0f8ff"
//       }
//     } else {
//       document.getElementById("letter" + (i + 1)).style.backgroundColor = "#f0f8ff"
//       document.getElementById("letter" + (i + 1)).value = "";
//     }
//   }
// }

const clearInputs = () => {

  for (let i = 0; i < player.placeHolder.length; i++) {
    if (player.currentChallenge.wordCompleted || player.placeHolder[i] === "") {
      document.getElementById("letter" + (i + 1)).style.backgroundColor = "#f0f8ff"
      document.getElementById("letter" + (i + 1)).value = "";
    }
  }
}

const updatePrevGuesses = () => {

  let prev = player.currentChallenge.prevGuesses.filter((x) => x === player.currentChallenge.prevGuess);

  if (prev.length > 0) return;

  player.currentChallenge.prevGuesses.push(player.currentChallenge.prevGuess);

  document.getElementById("prevWords").innerHTML += "<li>" + player.currentChallenge.prevGuess + "</li>";

  if (player.currentChallenge.prevGuesses.length > 7) {
    document.getElementById("prevWords").style.overflowY = "scroll";
  }

}

//updatePrevGuesses();

const handlePoints = () => {
  player.totalPoints += player.wordLen;
  document.getElementById("score").innerHTML = "" + player.totalPoints;
}

const isWord = (guess) => RiTa.hasWord(guess);


const handlePlayerAttempt = async () => {

  if (player.currentChallenge.wordCompleted) return;


  let guess = getInputs();


  if (guess.length != player.wordLen) return;

  player.currentChallenge.prevGuess = guess.toLowerCase();

  fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + guess, {
    method: 'GET', // or 'PUT' // data can be `string` or {object}!
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
    .then(response => {
      if (response.hasOwnProperty("resolution") && !isWord(guess)) {
        displayMessage(guess + " is not a word!!!");
        clearInputs();
        let num = player.placeHolder.findIndex((x) => x === "");
        player.currentChallenge.wordsI = num;
        if (num === -1) {
          num = 0;
        }
        document.getElementById("letter" + (num + 1)).focus();
        return;
      }

      let w = handleWordRan(player.currentWord);
      let correctMess = "";
      let inCorrectMess = "";
      let outCorrectMess = "";
      let incorrectLetters = "";
      let outOfPlaceLetters = "";
      for (let i = 0; i < guess.length; i++) {

        guess[i].toLowerCase();

        let guessedCorrect = player.placeHolder.filter((x) => x === guess[i]);
        let letterAmount = strToArr(w).filter((x) => x === guess[i]);
        let guessOutOfPlace = document.getElementById("guessOutOfPlace").textContent;
        let guessedIncorrectSpot = strToArr(guessOutOfPlace).filter((x) => x === guess[i]);
        // let leftOver = letterAmount.length - (guessedCorrect.length + guessedIncorrectSpot.length);

        if (letterAmount.length > 0) {
          if (guess[i] === w[i]) {
            updateWordDisplay(i, guess[i]);
            // document.getElementById("letter" + (i + 1)).innerHTML = guess[i];
            document.getElementById("letter" + (i + 1)).style.backgroundColor = "#33cc33";
            document.getElementById("letter" + (i + 1)).disabled = true;
            player.placeHolder[i] = guess[i];
            correctMess += correctMess.length === 0 ? guess[i] : ", " + guess[i];
            if (guessedCorrect.length + 1 < letterAmount.length) {
              outCorrectMess += outCorrectMess.length === 0 ? guess[i] : ", " + guess[i];
            }
          } else {
            outOfPlaceLetters += guess[i];
            outCorrectMess += outCorrectMess.length === 0 ? guess[i] : ", " + guess[i];
          }

        } else {
          let guessesIncorrect = document.getElementById("guessIncorrect").textContent;
          inCorrectMess += inCorrectMess.length === 0 ? guess[i] : ", " + guess[i];
          if (guessesIncorrect.search(guess[i]) < 0) {
            incorrectLetters += guess[i];
          }
        }

      }

      handleIncorrectWordDisplay(incorrectLetters);
      handleOOPWordDisplay(outOfPlaceLetters);
      let newMessage = "";

      if (inCorrectMess != "") {
        let s = incorrectLetters.length > 1 ? "are" : "is";
        newMessage += inCorrectMess + " " + s + " incorrect | ";
      } else {
        newMessage += "None incorrect | ";
      }
      if (outCorrectMess != "") {
        let s = outOfPlaceLetters.length > 1 ? "are" : "is";
        newMessage += outCorrectMess + " " + s + " out of place";
      } else {
        newMessage += "None out of place";
      }

      if (guess === w) {
        player.totalWordsCompleted++;
        player.totalTimeSpent += ((w.length * player.currentCPS) - player.currentTime);
        player.totalCharCount += w.length;
        clearInterval(timer);
        displayMessage("Success! You guessed the word");
        handlePoints();
        document.getElementById("guessIncorrect").innerHTML = "";
        document.getElementById("guessOutOfPlace").innerHTML = "";
        player.currentChallenge.wordCompleted = true;
        addCorrectWord(w);
        player.wordsCompleted.push(w);
        updatePlayer();
        if (player.currentChallenge.challengeI === player.currentChallenge.totalWords - 1) {
          player.currentChallenge.challengeCompleted = true;
          player.totalChallenegesCompleted++;
          player.totalPoints += 15;
          document.getElementById("score").innerHTML = "" + player.totalPoints;
          updatePlayer();
          gameOver("You have completed the challenge!!!")
        } else {
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

      } else {
        displayMessage(newMessage);
        updatePrevGuesses();
        clearInputs();
        let num = player.placeHolder.findIndex((x) => x === "");
        player.currentChallenge.wordsI = num;
        if (num === -1) {
          num = 0;
        }
        document.getElementById("letter" + (num + 1)).focus();
      }
      // let OOP = document.getElementById("guessOutOfPlace").textContent;
      // if (OOP.length > 0) handleOutOfPLace()
    })
    .catch(error => console.error('Error:', error));


  //isWord(guess);

  // if (!check) {

  //   displayMessage(guess + " is not a word!!!")
  //   clearInputs();
  //   let num = player.placeHolder.findIndex((x) => x === "");
  //   player.currentChallenge.wordsI = num;
  //   if (num === -1) {
  //     num = 0;
  //   }
  //   document.getElementById("letter" + (num + 1)).focus();
  //   return;
  // }

  // document.getElementById("message").innerHTML = message;

}

const handleIncorrectWordDisplay = (letters) => {
  let guessesIncorrect = document.getElementById("guessIncorrect");

  let str = "";

  for (let i = 0; i < letters.length; i++) {
    if (guessesIncorrect.textContent.length > 0 || i > 0) str += " | ";
    str += letters[i];
  }

  let newStr = "<span style='background-color: #7d0000; padding: 5px;'>" + guessesIncorrect.textContent + str + "</span>";

  if (guessesIncorrect.textContent.length > 0 || letters.length > 0) {
    guessesIncorrect.innerHTML = newStr;
  }
}


const handleOOPWordDisplay = (letters) => {

  let w = handleWordRan(player.currentWord);
  let splitW = w.split("");
  let OOP = document.getElementById("guessOutOfPlace").textContent;
  let splitOOP = OOP.split("");
  let lettersArr = letters.split("");
  if (letters.length > 0) {
    for (let i = 0; i < lettersArr.length; i++) {
      //is in out of place
      let isInOOP = splitOOP.findIndex((x) => x === lettersArr[i]);

      //if the letter is not already in out of place
      if (isInOOP === -1) {
        //then add it
        splitOOP.push(lettersArr[i]);
      } else {
        let countCorrect = player.placeHolder.filter((x) => x === lettersArr[i]);
        let countOOP = splitOOP.filter((x) => x === lettersArr[i])

        if (countOOP.length < countCorrect.length) {
          splitOOP.push(lettersArr[i]);
        }
      }
    }
  }

  let str = "";

  for (let i = 0; i < splitOOP.length; i++) {

    if (splitOOP[i] === "") continue;

    let countW = splitW.filter((x) => x === splitOOP[i]);
    let countCorrect = player.placeHolder.filter((x) => x === splitOOP[i]);
    //if the letter is not already in out of place
    if (countCorrect.length < countW.length) {
      let space = str.length === 0 ? "" : " | ";
      str += space + splitOOP[i]
    }
  }

  if (str.length > 0) {
    let newStr = "<span style='background-color: #926b00; padding: 5px;'>" + str + "</span>";
    document.getElementById("guessOutOfPlace").innerHTML = newStr;
  } else {
    document.getElementById("guessOutOfPlace").innerHTML = "";
  }
}

const updatePH = () => {
  let w = handleWordRan(player.currentWord);

  for (let i = 0; i < w.length; i++) {
    player.placeHolder.push("");
  }
}

const addCorrectWord = (word) => {
  const li = document.createElement("li");
  li.innerHTML = word;
  document.getElementById("correctWords").appendChild(li);
}

// {
//   currentChallenge: {
//     type: "",
//     wordsI: 0,
//     challengeI: 0,
//     wordCompleted: false,
//     challengeCompleted: false,
//     totalPoints: 0,
//     totalWords: 3
//   },
//   challengesCompleted: [],
//   currentCPS: 20,
//   challengeStarted: false,
//   wordsCompleted: [],
//   currentTime: 0,
//   guesses: [],
//   currentWord: "",
//   placeHolder: [],
//   wordLen: 0,
//   hintUsed: false,
//   hintThreshold: 0,
//   totalPoints: 0,
// }

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
  document.getElementById("words").innerHTML = "<li><p>Please Refresh the browser to play another challenge</p></li>";
  displayMessage(message)
  document.getElementById("guess").style.display = "none";
  // document.getElementById("continueGame").style.display = "block";
}

const nextLevel = () => {
  player.guesses = [];
  player.placeHolder = [];
}

const intermission = () => {

  let count = 5;

  document.getElementById("prevWords").innerHTML = "";
  document.getElementById("prevWords").style.overflowY = "hidden";
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
  }, 6000);

}

const setNewPlayer = () => {
  let obj = {
    totalPoints: 0,
    totalTimeSpent: 0,
    totalChallenegesCompleted: 0,
    totalWordsCompleted: 0,
    totalCharCount: 0
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
      totalCharCount: player.totalCharCount
    }
    setCookie("player", JSON.stringify(obj), 100);
  }

}

const checkPlayer = () => {
  let data = getCookie("player");

  if (data != "") {
    let user = JSON.parse(data);
    player.totalPoints = parseInt(user.totalPoints);
    player.totalTimeSpent = parseInt(user.totalTimeSpent);
    player.totalChallenegesCompleted = parseInt(user.totalChallenegesCompleted);
    player.totalWordsCompleted = parseInt(user.totalWordsCompleted);
    player.totalCharCount = parseInt(user.totalCharCount);
  } else {
    setNewPlayer();
  }

}

const playRound = async () => {

  //clearInterval(timer);
  document.getElementById("continueGame").style.display = "none";
  let num = 4 + player.currentChallenge.challengeI;
  // let newWord = getWord(num, num);
  let res = await getWord(num);
  let h = res.data[0];
  const start = () => {
    player.wordLen = num;
    player.currentWord = h;
    player.currentChallenge.wordsI = 0;
    player.currentChallenge.prevGuess = "";
    player.currentChallenge.prevGuesses = [];
    player.hintUsed = false;
    player.secondHintUsed = false;
    player.currentTime = num * player.currentCPS;//player.currentChallenge.type === "challenge" ? newWord.length * player.currentCPS : 0;
    player.challengeStarted = true;
    player.currentChallenge.wordCompleted = false;
    document.getElementById("message2").innerHTML = "";
    createPH();
    timerFunc(() => {
      document.getElementById("letter1").focus();
      startTimer();
      displayMessage("Time has started!");
      document.getElementById("guess").style.display = "block";
    }, 10);
  }

  await start();
  // console.log(newWord);
  //let h = handleRamNum(newWord);
  // player.wordLen = newWord.length;
  // player.currentWord = h;
  // player.currentChallenge.wordsI = 0;
  // player.currentChallenge.prevGuess = "";
  // player.currentChallenge.prevGuesses = [];
  // player.hintUsed = false;
  // player.secondHintUsed = false;
  // player.currentTime = newWord.length * player.currentCPS;//player.currentChallenge.type === "challenge" ? newWord.length * player.currentCPS : 0;
  // player.challengeStarted = true;
  // player.currentChallenge.wordCompleted = false;
  // document.getElementById("message2").innerHTML = "";
  // createPH();
  // timerFunc(() => {
  //   document.getElementById("letter1").focus();
  //   startTimer();
  //   displayMessage("Time has started!");
  //   document.getElementById("guess").style.display = "block";
  // }, 10);
}

const determineSPC = () => {
  let spc = document.getElementById("SPCInput").value;

  if (spc > 0 && spc < 51) {
    player.currentCPS = spc;
  } else if (spc < 0) {
    player.currentCPS = 20;
  } else if (spc > 50) {
    player.currentCPS = 50;
  }
}

const startChallenge = () => {
  timerFunc(() => {
    displayMessage("Get Ready!!!");
  }, 2000)
  timerFunc(() => {
    playRound();
  }, 3000)
}

const continueGame = () => {
  startChallenge()
}

const play = async () => {

  determineSPC();
  checkPlayer();
  document.getElementById("flipGameInner").classList.add("flip-game");
  document.getElementById("score").innerHTML = "" + player.totalPoints;
  // if (player.challengesCompleted.length === 100) {
  //   constructChallenge("word");
  // } else {
  //   constructChallenge("challenge");
  // }
  timerFunc(() => {
    displayMessage("Get Ready!!!");
  }, 2000)
  timerFunc(() => {
    startChallenge();
  }, 3000)


}

window.addEventListener("keydown", (e) => {

  if (player.challengeStarted) {
    let inputs = document.getElementsByClassName("letterBox");
    switch (e.key) {
      case "Enter":
        handlePlayerAttempt();
        break;
      // case "ArrowLeft":
      //   if (player.currentChallenge.wordsI > 0) {
      //     player.currentChallenge.wordsI--
      //     handleInputFocus(player.currentChallenge.wordsI);
      //   }
      //   break;
      // case "ArrowRight":
      //   if (player.currentChallenge.wordsI < player.wordLen - 1) {
      //     player.currentChallenge.wordsI++
      //     handleInputFocus(player.currentChallenge.wordsI);
      //   }
      //   break;
      case "Backspace":

        let num = getWithinRange(player.currentChallenge.wordsI, 0, "decr");

        if (player.currentChallenge.wordCompleted) return;

        if (num <= player.wordLen && num > 0 && document.getElementById("letter" + player.currentChallenge.wordsI).value === "") {
          player.currentChallenge.wordsI--
          handleInputFocus(num);
        }
        break;
    }
  }

})
const getWord = async (num) => {
  let pos = await calcPos();
  let data = await fetch(`https://salmon-barnacle-shoe.cyclic.app/words/word/?min=${num}&max=${num}&p=${pos}`)
  //use string literals
  let dataJson = await data.json();
  return dataJson;
}

const getData = (guess, success, failed) => {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let data = JSON.parse(this.responseText);

      success(data);
      // displayMessage(data[0].meanings[0].definitions[0].definition);
    } else {
      failed();
    }
  }
  xhttp.open("GET", "https://api.dictionaryapi.dev/api/v2/entries/en/" + guess, false);
  xhttp.send();
}
