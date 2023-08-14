
const connectSP = () => {
  spSocket.connect();
}

const getUser = () => {
  let username = document.getElementById('existUsername').value;
  socket.emit("getUser", username)
}

socket.on('getUser', (user) => {
  document.getElementById("loading-screen").style.display = "none";
  setCookie('gameCode', user._id.toString(), 100);
  setCookie('player', JSON.stringify(user.gameData), 100)
  setCookie('username', user.username, 100);

  checkPlayer(user.gameData);
  connectUser()
  document.getElementById('initScreen').style.display = "none";
})

const checkUpdatedUsername = (e) => {
  if (e.value.length === 0) {
    document.getElementById("updateUsernameMsg").innerHTML = "";
    document.getElementById("clickHere").disabled = true;
    return;
  }

  let match = /^[a-zA-Z0-9@!_$]+$/.test(e.value);
  clickHere
  if (e.value.length < 3 || e.value.length > 10 || !match) {
    document.getElementById("updateUsernameMsg").innerHTML = "Invalid Username!";
    document.getElementById("clickHere").disabled = true;
    return;
  }

  document.getElementById("updateUsernameMsg").innerHTML = "";

  socket.emit('checkUpdatedUsername', e.value);
}

socket.on('checkUpdatedUsername', (check) => {
  console.log(check);
  if (check) {
    document.getElementById("updateUsernameMsg").innerHTML = "Username is already taken!";
    document.getElementById("clickHere").disabled = true;
    return;
  }
  document.getElementById("updateUsernameMsg").innerHTML = "";
  document.getElementById("clickHere").disabled = false;
})

const checkUsername = (e) => {

  if (e.value.length === 0) {
    if (e.id === "newUsername") {
      document.getElementById("initScreenCreateMsg").innerHTML = "";
      document.getElementById("createUsernameBtn").disabled = true;
    }
    if (e.id === "existUsername") {
      document.getElementById("initScreenEnterMsg").innerHTML = "";
      document.getElementById("existUsernameBtn").disabled = true;
    }
    return;
  }

  let match = /^[a-zA-Z0-9@!_$]+$/.test(e.value);

  if (e.value.length < 3 || e.value.length > 10 || !match) {
    if (e.id === "newUsername") {
      document.getElementById("initScreenCreateMsg").innerHTML = "Invalid Username!";
      document.getElementById("createUsernameBtn").disabled = true;
    }
    if (e.id === "existUsername") {
      document.getElementById("initScreenEnterMsg").innerHTML = "Invalid Username!";
      document.getElementById("existUsernameBtn").disabled = true;
    }
    return;
  }

  if (e.id === "newUsername") {
    document.getElementById("initScreenCreateMsg").innerHTML = "";
    socket.emit('checkUsername', e.value);
  }
  if (e.id === "existUsername") {
    document.getElementById("initScreenEnterMsg").innerHTML = "";
    document.getElementById("existUsernameBtn").disabled = false;
  }

}

socket.on('checkUsername', (check) => {
  if (check) {
    document.getElementById("initScreenCreateMsg").innerHTML = "Username is already taken!";
    document.getElementById("createUsernameBtn").disabled = true;
    return;
  }
  document.getElementById("initScreenCreateMsg").innerHTML = "";
  document.getElementById("createUsernameBtn").disabled = false;
})

const createUser = () => {
  let username = document.getElementById('newUsername').value;
  socket.emit("createUser", username);

}

socket.on('createUser', (data) => {
  console.log(data);
  document.getElementById("loading-screen").style.display = "none";
  setCookie('gameCode', data.id.toString(), 100);
  setCookie('player', JSON.stringify(data.gameData), 100)
  setCookie('username', data.username, 100);

  checkPlayer(data.gameData);
  connectUser()
  document.getElementById('initScreen').style.display = "none";
})

socket.on('loading', () => {
  document.getElementById("loading-screen").style.display = "flex";
})

socket.on('notLoading', () => {
  document.getElementById("loading-screen").style.display = "none";
})

const updateUsername = () => {

  let playerId = getCookie("gameCode");
  if (!playerId) return;
  //document.getElementById("loading-screen").style.display = "flex";
  let username = document.getElementById('username');
  socket.emit('updateUsername', { username: username.value, playerId })
  username.value = "";
}

socket.on('updateUsername', (data) => {
  document.getElementById("loading-screen").style.display = "none";
  if (!data.updated) {
    document.getElementById("updateUsernameMsg").innerHTML = "Username not updated!";
    return;
  }
  document.getElementById("statsTitle").innerHTML = data.username;
  setCookie("username", data.username, 100);
  closeGameData();
  closeRightPanel();
})

if (!dataLoaded) {
  let playerId = getCookie("gameCode");
  if (playerId) {
    document.getElementById('initScreen').style.display = "none";
    socket.emit("getUser", playerId);
    dataLoaded = true;
    connectUser()
  } else {
    document.getElementById('initScreen').style.display = "flex";
  }
}


const startSPTime = () => {
  let playerId = getCookie("gameCode");
  const slider = document.getElementById("myRange");
  spSocket.emit("startGame", { mode: "Frenzy", selCat: selectedCategory, diff: selectedDiff, player: { id: playerId }, wordCount: slider.value })
}

const handlePlayerGuess = (guess) => {
  spSocket.emit('checkGuess', { guess, correctLetters: player.currentChallenge.correctLetters, wordsGuessed: player.wordsCompleted, outOfPlaceLetters: player.currentChallenge.outOfPlaceLetters });
}

const continueGame = () => {
  clearAfter();
  document.getElementById("continueGame").style.display = "none";
  document.getElementById("words").innerHTML = "";
  player.currentChallenge.correctLetters = [];
  document.getElementById("correctWords").innerHTML = "";
  document.getElementById("correctWords").style.display = "none";
  player.wordsCompleted = [];

  spSocket.emit("continueGame");
}

const getSPHint = () => {
  // hints: {
  //   used: [],
  //   hintMessages: [],
  //   triggers: [],
  //   maxHints: 0,
  //   completed: false
  // }

  if (player.currentChallenge.hints.hintsRemaining < 2) {
    document.getElementById("getSPHint").innerHTML = "";
    document.getElementById("getSPHint").style.display = "none";
  }
  let type = "normal";
  if (selectedCategory === "wordsItem") {
    type = player.currentChallenge.hints.hintsRemaining === 3 ? "definition" : player.currentChallenge.hints.hintsRemaining === 2 ? "synonym" : "reveal";
  }

  if (player.currentChallenge.hints.hintsRemaining === 1) {
    type = "reveal";
  }
  console.log("coool");
  spSocket.emit("getHint", { type, prevHints: player.currentChallenge.hints.used })

}

spSocket.on('getPlayer', (player) => {

  setCookie('player', JSON.stringify(player.gameData), 100);
  setCookie('username', player.username, 100);
  setCookie('gameCode', player._id.toString(), 100);

  checkPlayer(player.gameData);
})

spSocket.on('startGame', (data) => {

  timerFunc(() => {
    spStarted = true;
    if (musicOn) {
      playGameBKMusic();
      stopMenuBKMusic();
    }
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("flipGameInner").classList.add("flip-game");
    document.getElementById("score").innerHTML = selectedDiff === 0 ? "Easy" : selectedDiff === 2 ? "Hard" : selectedDiff === 3 ? "Frenzy" : "Normal";
    let selSplit = selectedCategory.split("Item");

    document.getElementById("categorySelectedTxt").innerHTML = titleCase(selSplit[0]);

  }, 1000);
  // createInputs();
  timerFunc(() => {
    spSocket.emit("startTime");
  }, 3000);
})
spSocket.on("startTime", (data) => {
  document.getElementById("words").innerHTML = "";
  createInputs(data.wordData[0].word);
  focusNextOpenInput();
  displayMessage("Time has started!");
  document.getElementById("guess").style.display = "block";
  displaySPHintBtn();
  let extraZero = data.time < 10 ? "0" : "";
  updateTimerDsiplay("" + extraZero + data.time);
})
spSocket.on("updateTime", (time) => {

  if (time > 0) {
    let extraZero = time < 10 ? "0" : "";
    updateTimerDsiplay("" + extraZero + time);

    // if (!player.currentChallenge.hints.completed && !inLobby) {
    //   let preMess = player.currentChallenge.hints.triggers.findIndex((trigger) => player.currentTime === (trigger + 2));
    //   let hintsTrigger = player.currentChallenge.hints.triggers.findIndex((trigger) => player.currentTime === trigger);
    //   if (preMess > -1 && hintsTrigger === -1) {
    //   } else if (hintsTrigger > -1 && preMess === -1) {
    //     let regex = /Lobby/;
    //     handleHint(hintsTrigger, selectedCategory.replace(regex, ""));
    //   }
    // }
    if (time < 11) playSound(countDownTickSound);

  }

})

spSocket.on('invalidGuess', (check) => {
  playSound(incorrectSound);
  displayMessage("None were correct!");
})

spSocket.on('checkGuess', (check, word) => {
  playSound(incorrectSound);
  player.currentChallenge.prevGuesses.unshift(player.currentChallenge.prevGuess);
  updateAfterGuess(check, word);
  focusNextOpenInput();
})

spSocket.on('nextWord', (words) => {
  playSound(correctSound);
  document.getElementById("words").innerHTML = "";
  clearAfter();
  player.wordsCompleted.push(words.prevWord);
  document.getElementById("correctWords").style.display = "block";
  document.getElementById("prevWords").style.display = "block";
  player.currentChallenge.hints.hintsRemaining = 3;
  displaySPHintBtn();
  addCorrectWord(words.prevWord);
  displayMessage("Success! Heres the next word");
  createInputs(words.nextWord);
  focusNextOpenInput();
})

spSocket.on("getHint", (hintData) => {
  console.log(hintData);
  player.currentChallenge.hints.hintsRemaining--;

  player.currentChallenge.hints.hintMessages.push(hintData[0].hint);
  player.currentChallenge.hints.used = hintData[0].hintsUsed;
  player.currentChallenge.hints.completed = hintData[0].completed;


  if (hintData[0].completed) {
    document.getElementById("getSPHint").innerHTML = "";
    document.getElementById("getSPHint").style.display = "none";
  } else {
    displaySPHintBtn();
  }

  displayHints();

})

spSocket.on('completed', (data) => {
  addCorrectWord(data.word);
  clearAfter();
  playWinnerMusic();
  timer = setInterval(() => {
    showWinnerOverlay()
  }, 1000);
  gameOver("You have completed the Frenzy!!!");
  document.getElementById("continueGame").style.display = "block";
  document.getElementById("leaveSpGame").style.display = "block";
})

spSocket.on('gameOver', (data) => {
  console.log(data);
  displayMessage(`The remaing word${data.notComplete.length === 1 ? " is" : "s are"} ${data.notComplete.join(', ')}`);
  document.getElementById("guess").style.display = "none";
  document.getElementById("getSPHint").style.display = "none";
  updateTimerDsiplay("00");
  const overlay = document.querySelector('#loserOverlay');
  overlay.style.display = 'block';
  document.getElementById("winnerIsMess").innerHTML = `You ran out of time!`;
  playLoserMusic();
  document.getElementById("continueGame").style.display = "block";
  document.getElementById("leaveSpGame").style.display = "block";
})

spSocket.on('startEndScreen', () => {
  if (timer !== null) {
    clearInterval(timer);
  }
  const overlay = document.querySelector('#winnerOverlay');
  overlay.style.display = 'none';
  const loserOverlay = document.querySelector('#loserOverlay');
  loserOverlay.style.display = 'none';
})

spSocket.on('endScreenTimer', (time) => {
  let ez = time < 10 ? "0" : "";
  document.getElementById("words").innerHTML = `<h3>Returning to home in ${ez}${time}s</h3>`;
})

spSocket.on('returnHome', () => {
  leaveSpGame();
})

spSocket.on('updateStats', (stats) => {
  console.log(stats);
  setCookie("player", JSON.stringify(stats), 100)
  checkPlayer(stats);
})

spSocket.on('endHints', () => {
  document.getElementById("getSPHint").innerHTML = "";
  document.getElementById("getSPHint").style.display = "none";
})

const leaveSpGame = () => {
  spStarted = false;
  if (musicOn) {
    playMenuBKMusic();
    stopGameBKMusic();
  }
  document.getElementById("leaveSpGame").style.display = "none";
  document.getElementById("continueGame").style.display = "none";
  document.getElementById("flipGameInner").classList.remove("flip-game");
  const slider = document.getElementById("myRange");
  slider.value = player.wordCount - 1;
  document.getElementById("words").innerHTML = "";
  player.currentChallenge.correctLetters = [];
  document.getElementById("correctWords").innerHTML = "";
  document.getElementById("correctWords").style.display = "none";
  document.getElementById("score").innerHTML = "";
  document.getElementById("categorySelectedTxt").innerHTML = "";
  document.getElementById("time").innerHTML = "";
  displayMessage("");
  player.wordsCompleted = [];
  clearAfter();
}
