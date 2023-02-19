let playerModel = {
  currentChallenge: {
    words: [],
    type: "",
    wordsI: 0,
    challengeI: 0,
    wordCompleted: false,
    totalPoints: 0
  },
  challengesCompleted: [],
  currentCPS: 20,
  challengeStarted: false,
  currentTime: 0,
  guesses: [],
  currentWord: "",
  placeHolder: []
}

let jokeCounter = 1;

let player = playerModel;

let timer = null;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];


const getWord = (min = 5, max = 5) => RiTa.randomWord({ minLength: min, maxLength: max });

const constructChallenge = (type) => {

  switch (type) {
    case "word":
      player.currentChallenge.words.push(getWord());
      player.currentChallenge.type = "word";
      break;
    case "challenge":
      for (let i = 0; i < 3; i++) {
        let num = 5 + i;
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
  } else {
    updateTimerDsiplay("00");
    timesUp();
  }

}, 1000);

const timesUp = () => {
  clearInterval(timer);
  timer = null;
  document.getElementById("message2div").innerHTML = "<h3>The word was: " + player.currentWord + "</h3>";
  gameOver("Times up! You have failed!!!");
}

const updateTimerDsiplay = (sec, min = 0) => {
  document.getElementById("time").innerHTML = "" + sec;
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
  document.getElementById("words").innerHTML = "";
  for (let i = 0; i < player.currentWord.length; i++) {
    player.placeHolder.push("");
  }

  for (let i = 0; i < player.currentWord.length; i++) {
    const input = document.createElement("input");
    //input.innerHTML = "";
    input.id = "letter" + (i + 1);
    input.className = "letterBox";
    input.oninput = showLetter;
    input.maxLength = 1;
    input.autocomplete = "off";
    // input.disabled = i === 0 ? false : true;
    document.getElementById("words").appendChild(input);
  }

}

const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const handleJoke = (e, guess) => {

  let modNum = jokeCounter % 5;
  let modNum2 = jokeCounter % 3;


  if (jokeCounter === 15) {
    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
    alert("Having Fun Yet!")
  } else if (jokeCounter === 20) {
    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
    alert("Why you still doing this!")
  } else if (jokeCounter === 25) {
    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
    alert("Just Stop Bro!");
  } else if (jokeCounter === 30) {
    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
    alert("Ok the jokes over!");
  } else if (jokeCounter > 30 && modNum === 0 || modNum2 === 0) {

    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumer(0, (letters.length - 1))];
  } else if (jokeCounter > 30) {
    jokeCounter++;
  } else {
    jokeCounter++;
    document.getElementById(e.target.id).value = letters[generateRandomNumber(0, (letters.length - 1))];
  }
}

const showLetter = (e) => {

  document.getElementById(e.target.id).style.backgroundColor = "#f0f8ff";

  if (e.inputType === "deleteContentBackward") return;

  //handleJoke(e, document.getElementById(e.target.id).value);

  let strArray = e.target.id.split("");

  let endChar = parseInt(strArray[strArray.length - 1])

  let incr = endChar + 1;

  if (endChar === player.currentWord.length) return;

  if (endChar < player.currentWord.length - 1 && player.placeHolder[endChar] != "") incr++;

  document.getElementById("letter" + incr).focus();

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
  for (let i = 0; i < player.currentWord.length; i++) {
    str += document.getElementById("letter" + (i + 1)).value;
  }

  return str;
}

const clearInputs = () => {

  for (let i = 0; i < player.placeHolder.length; i++) {
    if (player.currentChallenge.wordCompleted || player.placeHolder[i] === "") {
      document.getElementById("letter" + (i + 1)).value = "";
      document.getElementById("letter" + (i + 1)).style.backgroundColor = "#f0f8ff"
    }
  }
}

const handlePoints = () => {
  player.currentChallenge.totalPoints += player.currentWord.length;
  document.getElementById("score").innerHTML = "" + player.currentChallenge.totalPoints;
}

const handlePlayerAttempt = () => {

  let guess = getInputs();

  if (guess.length != player.currentWord.length) return;




  let correctMess = "";
  let inCorrectMess = "";
  let outCorrectMess = "";
  for (let i = 0; i < guess.length; i++) {

    guess[i].toLowerCase();

    let guessedCorrect = player.placeHolder.filter((x) => x === guess[i]);
    let letterAmount = strToArr(player.currentWord).filter((x) => x === guess[i]);
    let guessOutOfPlace = document.getElementById("guessOutOfPlace").textContent;
    let guessedIncorrectSpot = strToArr(guessOutOfPlace).filter((x) => x === guess[i]);
    // let leftOver = letterAmount.length - (guessedCorrect.length + guessedIncorrectSpot.length);

    if (letterAmount.length > 0) {
      if (guess[i] === player.currentWord[i]) {
        updateWordDisplay(i, guess[i]);
        // document.getElementById("letter" + (i + 1)).innerHTML = guess[i];
        document.getElementById("letter" + (i + 1)).style.backgroundColor = "blue";
        player.placeHolder[i] = guess[i];
        correctMess += correctMess.length === 0 ? guess[i] : ", " + guess[i];
        // player.currentChallenge.wordCompleted = true;

      } else if ((letterAmount.length - guessedCorrect.length) > 0 && guessedIncorrectSpot.length < (letterAmount.length - guessedCorrect.length)) {
        let str = guessOutOfPlace.length === 0 ? guess[i] : " | " + guess[i];
        document.getElementById("guessOutOfPlace").innerHTML += str;
        outCorrectMess += outCorrectMess.length === 0 ? guess[i] : ", " + guess[i];
      }
    } else {
      let guessesIncorrect = document.getElementById("guessIncorrect").textContent;
      inCorrectMess += inCorrectMess.length === 0 ? guess[i] : ", " + guess[i];
      if (guessesIncorrect.search(guess[i]) <= 0) {
        let str = guessesIncorrect.length === 0 ? guess[i] : " | " + guess[i];
        document.getElementById("guessIncorrect").innerHTML += str;
      }
    }

  }

  let newMessage = "";

  if (correctMess != "") {
    newMessage += "You got " + correctMess + " correct | ";
  } else {
    newMessage += "You got none correct | ";
  }
  if (inCorrectMess != "") {
    newMessage += "You got " + inCorrectMess + " incorrect | ";
  } else {
    newMessage += "You got none incorrect | ";
  }
  if (outCorrectMess != "") {
    newMessage += "You got " + outCorrectMess + " out of place";
  } else {
    newMessage += "You got none out of place";
  }

  if (guess === player.currentWord) {
    clearInterval(timer);
    displayMessage("Success! You guessed the word");
    handlePoints();
    document.getElementById("guessIncorrect").innerHTML = "";
    document.getElementById("guessOutOfPlace").innerHTML = "";
    player.currentChallenge.wordCompleted = true;
    addCorrectWord();
    if (player.currentChallenge.challengeI === player.currentChallenge.words.length - 1) {
      gameOver("You have completed the challenge!!!")
    } else {
      document.getElementById("guess").style.display = "none";
      timerFunc(() => {
        displayMessage("Next word incomming!");
        document.getElementById("words").innerHTML = "";
        timerFunc(() => {
          intermission();
        }, 1000)
      }, 2000)
    }
    // if (player.currentChallenge.i < player.currentWord.length)
  } else {
    displayMessage(newMessage);

    clearInputs();
    let num = player.placeHolder.findIndex((x) => x === "");

    if (num === -1) {
      num = 0;
    }
    document.getElementById("letter" + (num + 1)).focus();
  }
  //document.getElementById("message").innerHTML = message;

}

const addCorrectWord = () => {
  const li = document.createElement("li");
  li.innerHTML = player.currentWord;
  document.getElementById("correctWords").appendChild(li);
}

const gameOver = (message) => {
  player.guesses = [];
  player.placeHolder = [];
  clearInputs();
  let challenges = player.challengesCompleted;
  challenges.push(player.currentChallenge);
  player = playerModel
  player.challengesCompleted = challenges;
  document.getElementById("words").innerHTML = "<li><p>Please Refresh the browser to play another challenge</p></li>";
  displayMessage(message)
  document.getElementById("guess").style.display = "none";
}

const nextLevel = () => {
  player.guesses = [];
  player.placeHolder = [];
}

const intermission = () => {

  let count = 5;


  timer = setInterval(() => {

    if (count > 0) {
      displayMessage("" + count)
      count--;
    }

  }, 1000);

  timerFunc(() => {
    nextLevel()
    player.currentChallenge.challengeI++;
    playChallenge();
  }, 6000);

}

const playChallenge = () => {
  //clearInterval(timer);

  player.currentWord = player.currentChallenge.words[player.currentChallenge.challengeI];
  player.currentTime = player.currentChallenge.type === "challenge" ? player.currentWord.length * player.currentCPS : 0;
  player.challengeStarted = true;
  player.currentChallenge.wordCompleted = false;
  createPH();
  timerFunc(() => {
    let idNum = player.currentChallenge.wordsI < player.currentWord.length ? player.currentChallenge.wordsI + 1 : player.currentWord.length;
    document.getElementById("letter" + idNum).focus();
    startTimer();
    displayMessage("Time has started!");
    document.getElementById("guess").style.display = "block";
  }, 10);
}

const play = () => {

  let spc = document.getElementById("SPCInput").value;

  if (spc > 0 && spc < 51) {
    player.currentCPS = spc;
  } else if (spc < 0) {
    player.currentCPS = 20;
  } else if (spc > 50) {
    player.currentCPS = 50;
  }

  displayGame()

  if (player.challengesCompleted.length === 100) {
    constructChallenge("word");
  } else {
    constructChallenge("challenge");
  }

  timerFunc(() => {
    playChallenge();
  }, 2000)

  displayMessage("Get Ready!!!");

}