// client-side JavaScript code
const socket = io(url + '', { transports: ['websocket', 'polling'] });
const spSocket = io(url + 'singleplayer');
const pvpSocket = io(url + 'pvp');
let playerProg = {};

let lobbySettings = {
  catSel: "wordsItem",
  diffSel: 1,
  maxPlayers: 2,
  wordCount: 3,
}

let isInLobby = getCookie("lobbyCode");
if (isInLobby) {
  document.getElementById("lobbyPanel").style.display = "flex";
}


const connectUser = () => {
  let playerId = getCookie("gameCode");
  let username = getCookie("username");
  if (!playerId || !username) {
    return;
  }
  socket.emit('connectUser', { playerId, username })
}

function connect() {

  let prevLobby = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  let username = getCookie("username");
  if (!playerId || !username) {
    alert("Please have an approved username to continue!");
    return;
  }

  pvpSocket.emit('createLobby', { playerId, username, prevLobby: prevLobby ? prevLobby : "" });


}

function startHTH() {
  let prevLobby = getCookie("lobbyCode");

  pvpSocket.emit('start', { lobbyId: prevLobby, ...lobbySettings });
}

const handleLobDis = () => {
  if (player.lobbyData.player.isCreator) {

  }
}

function displayLobbyToRomm(id) {
  if (!player.lobbyData.player.isCreator) return;
  console.log(player.lobbyData.lobby.code);
  pvpSocket.emit('changeCatSel', { lobbyId: player.lobbyData.lobby.code, selId: id });
}

function joinLobby(lobbyId, inviteId) {
  console.log(lobbyId);
  console.log(inviteId);
  let playerId = getCookie("gameCode");
  let username = getCookie("username");
  if (!playerId || !username) {
    alert("Please have an approved username to continue!");
    return;
  }



  pvpSocket.emit('joinLobby', { lobbyId, playerId, username, inviteId });
}

function reJoinLobby() {
  let lobbyCode = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  let username = getCookie("username");
  if (lobbyCode && playerId && username) {
    pvpSocket.emit('reJoinLobby', { lobbyCode, playerId, username });
  }
}

const handleLobDiff = (num) => {
  let isCreator = player.lobbyData.player.isCreator;

  if (!isCreator) {
    handleClientLobbySel();
    return;
  }

  let lobbyCode = getCookie("lobbyCode");
  if (lobbyCode) {
    pvpSocket.emit('selDiff', { lobbyCode, diff: num });
  }
}

const changeWordCount = (num) => {
  let lobbyCode = getCookie("lobbyCode");
  if (!num) num = 0;
  pvpSocket.emit("changeWordCount", { lobbyCode, wordCount: num })
}

const handlePlayerChange = () => {

}

const handleHTHGuess = (guess) => {
  let lobbyCode = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  player.challengeStarted = false;
  pvpSocket.emit('checkGuess', { lobbyCode, playerId, guess, correctLetters: player.currentChallenge.correctLetters, wordsGuessed: player.wordsCompleted, outOfPlaceLetters: player.currentChallenge.outOfPlaceLetters });
}

const getHTHHint = () => {

  if (player.currentChallenge.hints.hintsRemaining < 1) return;

  pvpSocket.emit("getHint", { lobbyCode: player.lobbyData.lobby.code, playerId: player.lobbyData.player.id })
}

const changeMaxPlayers = (e) => {
  pvpSocket.emit("changeMaxPlayers", { lobbyCode: player.lobbyData.lobby.code, maxPlayers: e.value })
}

const leaveLobby = () => {
  if (hthStarted) {
    alert("Please participate in your challenge!")
    return;
  }
  let lobbyCode = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  pvpSocket.emit('leaveLobby', { lobbyCode, playerId })
  handleLobbyLeave();
}

const handleLobbyLeave = () => {
  // pvpSocket.disconnect();
  spSocket.connect();
  deleteCookie("lobbyCode");
  deleteCookie("inLobby");
  closeLobbyPanel();
  hthStarted = false;
  document.getElementById("lobbyPanel").style.display = "none";
  document.getElementById("flipGameInner").classList.remove("flip-game");
  document.getElementById("startMenu").style.display = "flex";
  document.getElementById("title").innerHTML = "Word Frenzy";
  unsetPlayerLobby()
}

const handleTimesUp = () => {
  // pvpSocket.emit("timesUp", { lobby: player.lobbyData.lobby, player: player.lobbyData.player });
}

const kickPlayer = (kickedId) => {
  console.log(kickedId);
  let lobbyCode = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  pvpSocket.emit('kickPlayer', { playerId, lobbyCode, kickedId });
}

const viewPlayer = (player2Id) => {
  console.log(player2Id);
  let playerId = getCookie("gameCode");
  let lobbyCode = getCookie("lobbyCode");
  pvpSocket.emit('getPlayedTogether', { lobbyCode, playerId, player2Id })
}

const getNewInvites = () => {
  let playerId = getCookie("gameCode");
  if (socket) {
    socket.emit('getInvites', playerId);
  }

}

const getInviteList = () => {
  let lobbyCode = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  pvpSocket.emit('getInviteList', { lobbyCode, playerId })
}

const sendInvite = async (playerTo) => {

  let lobbyCode = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  pvpSocket.emit('sendInvite', { playerId, lobbyCode, playerTo })

}

pvpSocket.on('sendInvite', (data) => {

  alert("Invite sent!");

  let list = player.playersNotInOrig.filter((p) => p._id.toString() !== data.playerTo)

  player.playersNotIn = list;
  player.playersNotInOrig = list;
  displayPlayersNotIn();

})

socket.on('getInvites', (invites) => {
  if (invites && invites.length > 0) {
    player.invites = invites;
    document.getElementById("openRightPanelBtn").classList.add("invite-button");
    document.getElementById("openHTHBtn").classList.add("invite-button");
    document.getElementById("headToHeadBtn").classList.add("invite-button");
    playSound(inviteAlertSound);
  }
})

pvpSocket.on('getInviteList', (list) => {
  player.playersNotIn = list;
  player.playersNotInOrig = list;
  displayPlayersNotIn();
})

pvpSocket.on('connect', () => {
  console.log('Connected to the server!');
});

//Reponse when lobby is initiated
pvpSocket.on('lobbyCreated', (data) => {
  console.log(data);
  playSound(lobbyJoinSound);
  inLobby = true;
  setCookie("inLobby", true);
  document.getElementById("headToHeadWrapper").style.display = "none";
  closeRightPanel();
  // document.getElementById("startMenu").style.display = "none";
  // document.getElementById("lobby").style.display = "flex";
  player.lobbyData.lobby = data.lobby;
  player.lobbyData.player = data.lobby.players[0];
  setCookie("lobbyCode", data.lobby.code, 100);
  document.getElementById("lobbyPanel").style.display = "flex";
  playerProg = data.playerProg;
  updatePlayerDisplay(data.lobby.players, false);
  document.getElementById("title").innerHTML = "My Lobby";
  document.getElementById("maxPlayerNum").innerHTML = `${data.lobby.players.length}/${lobbySettings.maxPlayers}`;
});

//Response for joining a lobby, handles the UI and Player data
pvpSocket.on('joined', (data) => {
  console.log(data);
  inLobby = true;
  player.lobbyData.player = data.player;
  player.lobbyData.lobby = data.lobby;
  playerProg = data.playerProg;

  closeRightPanel();
  document.getElementById("invitesDisplayWrapper").style.display = "none";
  document.getElementById("headToHeadWrapper").style.display = "none";
  let isCreator = data.player.isCreator;

  let creatorMess = "";
  if (isCreator) {
    creatorMess = "My Lobby";
    document.getElementById("maxPLayersWrapper").style.display = "flex";
    document.getElementById("inviteToLobby").style.display = "block";
  } else {
    let creator = data.lobby.players.filter((p) => p.isCreator);
    creatorMess = `${creator[0].username}'s Lobby`;

    document.getElementsByName("diffRadio").forEach((r) => r.disabled = true);
    slider.disabled = true;
    document.getElementById("inviteToLobby").style.display = "none";
    document.getElementById("maxPLayersWrapper").style.display = "none";
    document.getElementById("startGame").style.display = "none";
  }
  document.getElementById("title").innerHTML = creatorMess;

  document.getElementById("lobbyPanel").style.display = "flex";
  document.getElementById("maxPlayerNum").innerHTML = `${data.lobby.players.length}/${lobbySettings.maxPlayers}`;
  setCookie("inLobby", true);
  setCookie("lobbyCode", data.lobby.code, 100);
  setTimeout(() => document.getElementById("loading-screen").style.display = "none", 300);
});

pvpSocket.on('lobbyJoinSound', () => {
  playSound(lobbyJoinSound);
})
pvpSocket.on('lobbyLeaveSound', () => {
  playSound(lobbyLeaveSound);
})
pvpSocket.on('unableToJoin', (data) => {
  pvpSocket.disconnect();
  spSocket.connect();
  document.getElementById("lobbyPanel").style.display = "none";
  document.getElementById("lobby").style.display = "none";
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("startMenu").style.display = "flex";
  hthStarted = false;
  unsetPlayerLobby();

  alert(data.message);
})
pvpSocket.on("alert", (msg) => {
  alert(msg);
})

pvpSocket.on("getHint", (hintData) => {
  console.log(hintData);
  player.currentChallenge.hints.hintsRemaining--;

  player.currentChallenge.hints.hintMessages.push(hintData.hint);
  player.currentChallenge.hints.completed = hintData.completed;


  if (hintData.completed || hintData.hintsUsed >= 2) {
    document.getElementById("getSPHint").innerHTML = "";
    document.getElementById("getSPHint").style.display = "none";
  } else {
    displaySPHintBtn();
  }

  displayHints();
})

pvpSocket.on('hintsComplete', (hint) => {
  player.currentChallenge.hints.hintsRemaining = 0;
  player.currentChallenge.hints.completed = true;
  player.currentChallenge.hints.hintMessages.push(hint);
  document.getElementById("getSPHint").innerHTML = "";
  document.getElementById("getSPHint").style.display = "none";
  displayHints();
})

pvpSocket.on('getPlayedTogether', (data) => {
  console.log(data);
  document.getElementById("viewLobbyPlayerWrapper").style.display = "flex";
  document.getElementById("viewLobbyPlayerStats").innerHTML = "";
  document.getElementById("vlpTog").innerHTML = "";
  let content1 = "";
  let content2 = "";
  let playerId = getCookie("gameCode");
  let player1Username = getCookie("username");
  let totalGameCount = data.together.length;
  let playerWCount = countPlayerWins(data.together, playerId);
  let player2WCount = countPlayerWins(data.together, data.player2Id);
  let player2Rank = Math.floor(data.player2Data.gameData.totalPoints / 100);
  //Create title

  let p2 = data.player2Data.gameData;

  content1 += `<h2 id="vlpTitle">${data.player2Data.username} &nbsp;<span id="vlpRank">${player2Rank}</span></h2>`;
  content1 += vlpStats(p2.totalPoints, createDateStr(p2.totalTimeSpent), p2.totalWordsCompleted, p2.totalChallengesCompleted, (p2.speedData.totalTime / p2.speedData.totalChar))

  document.getElementById("viewLobbyPlayerStats").innerHTML = content1;
  //Create header
  content2 += handleVLPHDis(totalGameCount, { username: player1Username, totalWins: playerWCount }, { username: data.player2Data.username, totalWins: player2WCount });
  content2 += ` <div id="vlpTogBodyRow1" class="vlpStatsBoxRow">
  <div class="vlpStatTogBox">
    <h4>Date</h4>
  </div>
  <div class="vlpStatTogBox">
    <h4>Winner</h4>
  </div>
  <div class="vlpStatTogBox">
    <h4>Word Count</h4>
  </div>
  <div class="vlpStatTogBox">
    <h4>Mode</h4>
  </div>
  <div class="vlpStatTogBox">
    <h4>Category</h4>
  </div>
  <div class="vlpStatTogBox">
    <h4>Duration</h4>
  </div>
</div>`;
  data.together.map((l) => {
    let date = formatDate(l.game.startedAt);
    let winnerCheck = l.players.filter((p) => p.isWinner);
    let winner = "";
    let dur = 0;
    if (winnerCheck.length > 0) {
      winner = winnerCheck[0].username;
      dur = winnerCheck[0].timeSpent;
    } else {
      winner = "None";
      dur = l.game.maxDuration;
    }

    let durStr = createDateStr(dur);
    let wordCount = l.game.words.length;
    //create lobbies data rows 
    content2 += handleVLPBDis(date, winner, wordCount, l.game.mode, l.game.category, durStr);
  })

  if (data.player2Id === playerId) {
    content2 = ` <div class="vlpStatsBoxRow">
    <div class="vlpStatTogBox">
      <h4>No games found</h4>
    </div>
  </div>`;
  }

  document.getElementById("vlpTog").innerHTML = content2;

})


//THIS IS FOR ALL CLIENTS ----------------------------------------------------

//Starts the game for all connected clients
pvpSocket.on('start', (data) => {

  player.currentChallenge.hints.hintsRemaining = 2;

  document.getElementById("leaveLobby").style.display = "none";
  hthStarted = true;
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("flipGameInner").classList.add("flip-game");
  document.getElementById("score").innerHTML = lobbySettings.diffSel === 0 ? "Easy" : lobbySettings.diffSel === 2 ? "Hard" : lobbySettings.diffSel === 3 ? "Frenzy" : "Normal";
  let regex = /Item/;
  // handleHint(hintsRemaining, lobbySettings.catSel.replace(regex, "Item"));
  // let selSplit = lobbySettings.catSel.split("LobbyItem");
  if (document.getElementById("inviteToLobby").style.display === "block") document.getElementById("inviteToLobby").style.display = "none";
  if (!document.getElementById("maxPlayers").disabled) document.getElementById("maxPlayers").disabled = true;
  document.getElementById("categorySelectedTxt").innerHTML = titleCase(lobbySettings.catSel.replace(regex, ""));
  document.getElementById("correctWords").innerHTML = "";
  document.getElementById("words").innerHTML = "";
  document.getElementById("prevWords").innerHTML = "";
  updatePlayerDisplay(player.lobbyData.lobby.players, true);
  displayMessage("Get Ready!");
  // setTimeout(() => {
  //   pvpSocket.emit("startTime");
  // }, 2000);
});
//Alerts all clients of the joined memeber and updates their UI
pvpSocket.on('lobbyJoined', (data) => {
  data.lobby.game.words = [];
  player.lobbyData.lobby = data.lobby;
  document.getElementById("maxPlayerNum").innerHTML = `${data.lobby.players.length}/${lobbySettings.maxPlayers}`;
  updatePlayerDisplay(data.lobby.players, false);
});

pvpSocket.on('refreshUi', (data) => {

  lobbySettings.catSel = data.lobbySettings.catSel;
  lobbySettings.diffSel = data.lobbySettings.diffSel;
  lobbySettings.maxPlayers = data.lobbySettings.maxPlayers;
  lobbySettings.wordCount = data.lobbySettings.wordCount;
  document.getElementById("maxPlayerNum").innerHTML = `${player.lobbyData.lobby.players.length}/${lobbySettings.maxPlayers}`;
  handleClientLobbySel();

});

pvpSocket.on('refreshLobby', (data) => {
  console.log(data);
  data.lobby.game.words = [];
  player.lobbyData.lobby = data.lobby;
  playerProg = data.playerProg;
  let playerData = data.lobby.players.filter((p) => p.id === player.lobbyData.player.id);

  player.lobbyData.player = playerData[0];

  let creatorMess = "";
  if (playerData[0].isCreator) {
    creatorMess = "My Lobby";
    document.getElementById("maxPLayersWrapper").style.display = "flex";
    document.getElementById("inviteToLobby").style.display = "block";
  } else {
    let creator = data.lobby.players.filter((p) => p.isCreator);
    creatorMess = `${creator[0].username}'s Lobby`;

    document.getElementsByName("diffRadio").forEach((r) => r.disabled = true);
    slider.disabled = true;
    document.getElementById("inviteToLobby").style.display = "none";
    document.getElementById("maxPLayersWrapper").style.display = "none";
    document.getElementById("startGame").style.display = "none";
  }
  document.getElementById("maxPlayerNum").innerHTML = `${data.lobby.players.length}/${lobbySettings.maxPlayers}`;
  document.getElementById("title").innerHTML = creatorMess;
  updatePlayerDisplay(data.lobby.players, true);

});

// pvpSocket.on('nextWord', (data) => {

//   player.lobbyData.player = data.player;
//   document.getElementById("message2").innerHTML = "";
//   document.getElementById("guess").style.display = "block";
//   hintsRemaining = 2;
//   document.getElementById("getHint").style.display = "block";
//   document.getElementById("getHint").innerHTML = `${hintsRemaining} hints rem`;
//   document.getElementById("prevWords").innerHTML = "";
//   document.getElementById("guessOutOfPlace").style.display = "none";
//   document.getElementById("guessIncorrect").style.display = "none";
//   extra = data.wordData.extr;
//   let w = usw(data.wordData.word);
//   setSession(w, data.wordData.word, player.currentTime);
//   document.getElementById("words").innerHTML = "";
//   createInputs(w);
//   focusNextOpenInput();
//   displayMessage("Next Word!");
// });
pvpSocket.on("startGame", ({ time, word }) => {
  console.log(word);
  displayMessage("Time has started!")
  player.challengeStarted = true;
  createInputs(word);
  document.getElementById("guess").style.display = "block";
  displaySPHintBtn();
})
pvpSocket.on("updateTime", (time) => {

  if (time > 0) {
    let extraZero = time < 10 ? "0" : "";
    updateTimerDsiplay("" + extraZero + time);
  }
})

pvpSocket.on('checkGuess', (check, word) => {
  player.currentChallenge.prevGuesses.unshift(player.currentChallenge.prevGuess);
  updateAfterGuess(check, word);
  focusNextOpenInput();
  player.challengeStarted = true;
})

pvpSocket.on('nextWord', (words) => {
  document.getElementById("words").innerHTML = "";
  clearAfter();
  player.wordsCompleted.push(words.prevWord);
  document.getElementById("correctWords").style.display = "block";
  document.getElementById("prevWords").style.display = "block";
  player.currentChallenge.hints.hintsRemaining = 2;
  displaySPHintBtn();
  addCorrectWord(words.prevWord);
  displayMessage("Success! Heres the next word");
  createInputs(words.nextWord);
  focusNextOpenInput();
  player.challengeStarted = true;
})

pvpSocket.on('completed', (data) => {
  addCorrectWord(data.word);
  clearAfter();
  gameOver("You have completed the Frenzy!!!");
  document.getElementById("continueGame").style.display = "block";
})

pvpSocket.on('startEndScreen', () => {
  if (timer !== null) {
    clearInterval(timer);
  }
  const overlay = document.querySelector('#winnerOverlay');
  overlay.style.display = 'none';
  const loserOverlay = document.querySelector('#loserOverlay');
  loserOverlay.style.display = 'none';
})

pvpSocket.on('endScreenTimer', (time) => {
  let ez = time < 10 ? "0" : "";
  document.getElementById("words").innerHTML = `<h3>Returning to lobby in ${ez}${time}s</h3>`;
})

pvpSocket.on('updateStats', (stats) => {
  console.log(stats);
  setCookie("player", JSON.stringify(stats), 100)
  checkPlayer(stats);
})

pvpSocket.on('timesUp', () => {

  document.getElementById("guess").style.display = "none";
  document.getElementById("getSPHint").style.display = "none";
  gameOver("Times up! You suck prick!!!");
  document.getElementById("words").innerHTML = "<h3>Waiting for other players to finish</h3>";
})

pvpSocket.on('gameOver', (data) => {
  console.log(data);
  console.log(playerProg[player.lobbyData.player.id]);
  document.getElementById("words").innerHTML = "";
  //let notComplete = data.words.slice(playerProg[player.lobbyData.player.id]).map((x) => x.word);
  displayMessage(`The remaing word${data.notComplete.length === 1 ? " was" : "s were"} ${data.notComplete.join(', ')}`);
  document.getElementById("guess").style.display = "none";
  document.getElementById("getSPHint").style.display = "none";
  const overlay = document.querySelector('#loserOverlay');
  overlay.style.display = 'block';
  document.getElementById("winnerIsMess").innerHTML = `Everyone is out`;
});

pvpSocket.on('winner', (data) => {
  addCorrectWord(data.word);
  document.getElementById("words").innerHTML = "";
  document.getElementById("message").innerHTML = "";
  document.getElementById("guess").style.display = "none";
  document.getElementById("getSPHint").style.display = "none";
  timer = setInterval(() => {
    showWinnerOverlay()
  }, 1000);

});

pvpSocket.on('loser', (data) => {

  document.getElementById("words").innerHTML = "";
  // let notComplete = data.words.slice(playerProg[player.lobbyData.player.id]).map((x) => x.word);;
  displayMessage(`The remaing word${data.notComplete.length === 1 ? " was" : "s were"} ${data.notComplete.join(', ')}`);
  document.getElementById("guess").style.display = "none";
  document.getElementById("getSPHint").style.display = "none";
  const overlay = document.querySelector('#loserOverlay');
  overlay.style.display = 'block';
  document.getElementById("winnerIsMess").innerHTML = `${data.winner.username} has won`;
});

pvpSocket.on("loading", () => {
  document.getElementById("loading-screen").style.display = "flex";
})

pvpSocket.on("newLobby", (data) => {

  //await io.to(data.lobby.code).emit("newLobby", { lobbySettings: lobbySettings[newLobby.code], lobby: newLobby });
  lobbySettings = data.lobbySettings;
  player.lobbyData.lobby = data.lobby;
  hthStarted = false;
  let playerId = getCookie("gameCode");
  let p = data.lobby.players.filter((x) => x.id === playerId);
  player.lobbyData.player = p[0];
  setCookie("lobbyCode", data.lobby.code, 100);
  player.challengeStarted = false;
  document.getElementById("flipGameInner").classList.remove("flip-game");
  document.getElementById("leaveLobby").style.display = "block";
  document.getElementById("time").innerHTML = "";
  document.getElementById("categorySelectedTxt").innerHTML = "";
  document.getElementById("score").innerHTML = "";
  let creatorMess = "";
  if (p[0].isCreator) {
    creatorMess = "My Lobby";
    document.getElementById("maxPLayersWrapper").style.display = "flex";
    document.getElementById("maxPlayers").value = lobbySettings.maxPlayers;
    document.getElementById("inviteToLobby").style.display = "block";
    if (!document.getElementById("maxPlayers").disabled) document.getElementById("maxPlayers").disabled = true;
    if (document.getElementById("maxPlayers").disabled) document.getElementById("maxPlayers").disabled = false;
  } else {
    let creator = data.lobby.players.filter((p) => p.isCreator);
    creatorMess = `${creator[0].username}'s Lobby`;

    document.getElementsByName("diffRadio").forEach((r) => r.disabled = true);
    slider.disabled = true;
    document.getElementById("inviteToLobby").style.display = "none";
    document.getElementById("maxPLayersWrapper").style.display = "none";
    document.getElementById("startGame").style.display = "none";
  }
  document.getElementById("title").innerHTML = creatorMess;
  handleClientLobbySel();
  updatePlayerDisplay(data.lobby.players);
})


pvpSocket.on("updatePlayerProgress", (data) => {
  playerProg = data;
  updatePlayerDisplay(player.lobbyData.lobby.players);
})

pvpSocket.on('kickPlayer', () => {
  console.log("kicked");
  handleLobbyLeave();
  alert("You have been kicked!")
})

const handleClientLobbySel = () => {

  handleCategoryDisplay(lobbySettings.catSel);

  document.getElementById("diff1" + lobbySettings.diffSel).checked = true;

  slider.value = lobbySettings.wordCount;

  sliderOutput.innerHTML = lobbySettings.wordCount;
}


const updatePlayerDisplay = (players, gameStarted) => {

  let playerId = getCookie("gameCode");

  document.getElementById("lobbyPanel").style.display = "flex";


  let p = players.filter((x) => x.id === playerId);
  let id = p[0].id

  let prog = playerProg[id];

  let div = "";
  div += `<div class="lobbyPlayerBox">
  <div class="lobbyPlayerBoxHeader">
  <h4>${p[0].username}</h4>
  </div>
  <div class="playerProgBox lobbyPlayerBoxBody">
  <p style='font-size: 13px'>${hthStarted ? (prog + 1) + "/" + lobbySettings.wordCount : "Waiting"}</p>
  </div>
  <div class="lobbyPlayerBoxBody">
  <button onclick="viewPlayer('${players[0].id}')" class="invite-display-btns lobby-player-btns">View</button>
  </div>
  </div>`;

  for (let i = 0; i < players.length; i++) {
    if (players[i].id !== playerId) {
      prog = playerProg[players[i].id];

      div += `<div class="lobbyPlayerBox">
      <div class="lobbyPlayerBoxHeader">
      <h4>${players[i].username}</h4>
      </div>
      <div class="playerProgBox lobbyPlayerBoxBody">
      <p style='font-size: 13px'>${hthStarted ? (prog + 1) + "/" + lobbySettings.wordCount : "Waiting"}</p>
      </div>
      <div class="lobbyPlayerBoxBody">
      <button onclick="viewPlayer('${players[i].id}')" class="invite-display-btns lobby-player-btns">View</button>
      ${p[0].isCreator ? `<button onclick="kickPlayer('${players[i].id}')" class="invite-display-btns lobby-player-btns">Kick</button>` : ""}
      </div>
      </div>`;
    }
  }

  if (div !== "") {
    document.getElementById("lobbyPlayerDisplayBody").innerHTML = div;
  } else {
    document.getElementById("lobbyPlayerDisplayBody").innerHTML = `<div class="lobbyPlayerBox"><div class="lobbyPlayerBoxHeader"><h4>No Player</h4> </div><div class="lobbyPlayerBoxBody"><p style='font-size: 10px'>Waiting</p></div></div>`;
  }
}

const unsetPlayerLobby = () => {
  player.lobbyData = {
    lobby: {},
    player: {}
  }
  deleteCookie("lobbyCode");
  deleteCookie("inLobby");
  inLobby = false;
  lobbySettings = {
    catSel: "wordsItem",
    diffSel: 1,
  }
}

const clearAfter = () => {
  spaceInd = [];
  player.currentChallenge.incorrectLetters = [];
  player.currentChallenge.outOfPlaceLetters = [];
  player.currentChallenge.prevGuesses = [];
  document.getElementById("prevWords").innerHTML = "";
  document.getElementById("prevWords").style.display = "none";
  document.getElementById("guessOutOfPlace").innerHTML = "";
  document.getElementById("guessOutOfPlace").style.display = "none";
  document.getElementById("guessIncorrect").innerHTML = "";
  document.getElementById("guessIncorrect").style.display = "none";
  document.getElementById("prevWords").style.overflowY = "hidden";
  clearHintCont();

}

const updateAfterGuess = (check, word) => {

  const wordLetters = word.split('');
  const spaces = [...wordLetters.join('').matchAll(new RegExp(" ", 'gi'))].map(a => a.index);
  check.matchedIndexes.forEach(index => {

    if (spaces.findIndex((i) => index === i) === -1) {
      document.getElementById("letter" + (index + 1)).classList.add('correct');
      document.getElementById("letter" + (index + 1)).style.backgroundColor = "#4cd74c";
      document.getElementById("letter" + (index + 1)).disabled = true;
    }

  });

  clearIncorrectInputs();

  player.currentChallenge.correctLetters = check.correctLetters;
  player.currentChallenge.incorrectLetters = combineArr(player.currentChallenge.incorrectLetters, check.incorrectLetters).filter(letter => !player.currentChallenge.correctLetters.includes(letter));
  player.currentChallenge.outOfPlaceLetters = check.outOfPlaceLetters;

  if (player.currentChallenge.incorrectLetters.length > 0) {
    document.getElementById("guessIncorrect").style.display = "flex";
  }
  if (player.currentChallenge.outOfPlaceLetters.length > 0) {
    document.getElementById("guessOutOfPlace").style.display = "flex";
  }
  // let newTempInc = player.currentChallenge.incorrectLetters;

  // for (let i = 0; i < check.incorrectLetters.length; i++) {
  //   let incCount = newTempInc.filter((l) => l === check.incorrectLetters[i]).length;

  //   if (incCount === 0) {
  //     newTempInc.push(check.incorrectLetters[i]);
  //   }
  // }

  // player.currentChallenge.incorrectLetters = newTempInc;

  // let newTempOOP = player.currentChallenge.outOfPlaceLetters;

  // for (let i = 0; i < check.outOfPlaceLetters.length; i++) {
  //   let oopCount = player.currentChallenge.outOfPlaceLetters.filter((l) => l === check.outOfPlaceLetters[i]).length;
  //   let wCount = word.split("").filter((l) => l === check.outOfPlaceLetters[i]).length;
  //   if (oopCount < wCount) {
  //     newTempOOP.push(check.outOfPlaceLetters[i]);
  //   }
  // }

  // // let newOOP = updateOutOfPlaceLetters(joinWord(word), check.correctLetters, newTempOOP)

  // player.currentChallenge.outOfPlaceLetters = newOOP;

  updatePrevGuesses();

  let mainMess = "";
  if (player.currentChallenge.incorrectLetters.length > 0) {
    document.getElementById("guessIncorrect").style.display = "block"
    document.getElementById("guessIncorrect").innerHTML = "" + player.currentChallenge.incorrectLetters.join(' | ');
    mainMess += "You got some incorrect";
  } else {
    document.getElementById("guessIncorrect").innerHTML = "";
    document.getElementById("guessIncorrect").style.display = "none"
  }
  if (player.currentChallenge.outOfPlaceLetters.length > 0) {
    document.getElementById("guessOutOfPlace").style.display = "block"
    document.getElementById("guessOutOfPlace").innerHTML = "" + player.currentChallenge.outOfPlaceLetters.join(' | ');
    if (mainMess.length > 0) mainMess += " and "
    mainMess += "You got some out of place";
  } else {
    document.getElementById("guessOutOfPlace").innerHTML = "";
    document.getElementById("guessOutOfPlace").style.display = "none"
  }
  document.getElementById("message").innerHTML = mainMess;
  //"You got " + (check.incorrectLetters.length > 0 ? check.incorrectLetters.join(', ') : "none ") + " incorrect | You got " + (check.outOfPlaceLetters.length > 0 ? check.outOfPlaceLetters.join(', ') : "none") + " out of place";
}

const combineArr = (arr1, arr2) => {
  const combined = [...arr1, ...arr2]; // Combine the arrays
  const unique = [...new Set(combined)];
  return unique;
}


const displaySPHintBtn = () => {
  document.getElementById("getSPHint").style.display = "block";
  document.getElementById("getSPHint").innerHTML = `${player.currentChallenge.hints.hintsRemaining} Hint${player.currentChallenge.hints.hintsRemaining === 1 ? "" : "s"} rem`;
}

const clearHintCont = () => {
  const hintTabs = document.querySelector('#hint-tabs');
  const hintContainer = document.querySelector('#hint-container');
  hintContainer.innerHTML = "";
  hintTabs.innerHTML = "";
  player.currentChallenge.hints = {
    used: [],
    hintMessages: [],
    triggers: [],
    maxHints: 0,
    completed: false,
    hintsRemaining: 3
  }
}


const handleVLPHDis = (totalGames, player, player2) =>
  `<div class="vlpStatsBoxRow">
      <p>Total games: ${totalGames || '0'}</p>
      <p>${player.username}: ${player.totalWins || '0'}</p>
      <p>${player2.username}: ${player2.totalWins || '0'}</p>
    </div>`

const handleVLPBDis = (date, winner, wordCount, mode, cat, dur) =>
  `<div class="vlpStatsBoxRow">
      <div class="vlpStatTogBox">
        <h4>${date}</h4>
      </div>
      <div class="vlpStatTogBox">
        <h4>${winner}</h4>
      </div>
      <div class="vlpStatTogBox">
        <h4>${wordCount}</h4>
      </div>
      <div class="vlpStatTogBox">
        <h4>${mode}</h4>
      </div>
      <div class="vlpStatTogBox">
        <h4>${cat}</h4>
      </div>
      <div class="vlpStatTogBox">
        <h4>${dur}</h4>
      </div>
    </div>`


const vlpStats = (points, time, words, chall, speed) =>
  `<div class="vlpStatsBoxRow">
  <div class="vlpStatsBox">
    <h3 class="vlpStatsBoxTitle">Total Points</h3>
    <p class="vlpStatsBoxBody">${points}</p>
  </div>
  <div class="vlpStatsBox">
    <h3 class="vlpStatsBoxTitle">Total Time</h3>
    <p class="vlpStatsBoxBody">${time}</p>
  </div>
  <div class="vlpStatsBox">
    <h3 class="vlpStatsBoxTitle">Total Words</h3>
    <p class="vlpStatsBoxBody">${words}</p>
  </div>
  <div class="vlpStatsBox">
    <h3 class="vlpStatsBoxTitle">Total Challenges</h3>
    <p class="vlpStatsBoxBody">${chall}</p>
  </div>
  <div class="vlpStatsBox">
    <h3 class="vlpStatsBoxTitle">Speed</h3>
    <p class="vlpStatsBoxBody">${100 - speed.toFixed(0)}</p>
  </div>
</div>`

const createDateStr = (dur) => {
  const hours = Math.floor(dur / 3600);  // 1 hour
  const minutes = Math.floor((dur % 3600) / 60);  // 50 minutes
  const seconds = dur % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}