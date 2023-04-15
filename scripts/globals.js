let playerModel = {
  currentChallenge: {
    type: "",
    challengeI: 0,
    wordCompleted: false,
    challengeCompleted: false,
    totalPoints: 0,
    totalWords: 3,
    prevGuess: "",
    prevGuesses: [],
    ogTime: 0,
    hints: {
      used: [],
      hintMessages: [],
      triggers: [],
      maxHints: 0,
      completed: false
    },
    incorrectLetters: [],
    outOfPlaceLetters: [],
    correctLetters: []
  },
  lobbyData: {
    lobby: {},
    player: {}
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
  totalCharCount: 0,
  speedData: {
    totalChar: 5,
    totalTime: 100,
  }
}
//https://salmon-barnacle-shoe.cyclic.app/
//http://localhost:3000/
const url = "https://word-frenzy-api-production.up.railway.app/";

let extra = "";
let selectedCategory = "";
let lobbyData = null;
let inLobby = false;
let selectedDiff = 1;

let dataLoaded = false;

let jokeCounter = 1;

let player = playerModel;

let timer = null;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

let soundPlaying = false;

let hthStarted = false;

const titleCase = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();