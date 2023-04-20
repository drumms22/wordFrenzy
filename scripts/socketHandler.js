// client-side JavaScript code
let socket = io(url, { transports: ['websocket', 'polling'] });
let lobbySettings = {
  catSel: "wordsLobbyItem",
  diffSel: 1,
  lobbyDetails: {
    time: 0,
    words: 0,
    points: 0
  }
}

let hintsRemaining = 2;
let isInLobby = getCookie("lobbyCode");
if (isInLobby) {
  document.getElementById("lobbyPanel").style.display = "flex";
}

function connect() {


  let prevLobby = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  let username = getCookie("username");
  if (!playerId || !username) {
    alert("Please have an approved username to continue!");
    return;
  }

  socket.emit('createLobby', { playerId, username, prevLobby: prevLobby ? prevLobby : "" });


}

socket.on('connect', () => {
  console.log('Connected to the server!');
});

function startHTH() {
  let prevLobby = getCookie("lobbyCode");

  socket.emit('start', { lobbyId: prevLobby, ...lobbySettings });
}

const handleLobDis = () => {
  if (player.lobbyData.player.isCreator) {

  }
}

function displayLobbyToRomm(id) {
  if (!player.lobbyData.player.isCreator) return;

  socket.emit('changeCatSel', { lobbyId: player.lobbyData.lobby.code, selId: id });
}

function joinLobby(lobbyId, inviteId) {
  let playerId = getCookie("gameCode");
  let username = getCookie("username");
  if (!playerId || !username) {
    alert("Please have an approved username to continue!");
    return;
  }
  socket.emit('joinLobby', { lobbyId, playerId, username, inviteId });
}

function reJoinLobby() {
  let lobbyCode = getCookie("lobbyCode");
  let playerId = getCookie("gameCode");
  let username = getCookie("username");
  if (lobbyCode && playerId && username) {
    socket.emit('reJoinLobby', { lobbyCode, playerId, username });
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
    socket.emit('selDiff', { lobbyCode, diff: num });
  }
}

const handleHTHGuess = (data) => {

  socket.emit('handlePlayerGuess', { lobby: player.lobbyData.lobby, player: data })

}

const getHTHHint = () => {

  if (hintsRemaining === 0) return;

  socket.emit("getHint", { lobbyCode: player.lobbyData.lobby.code, w: usw(player.currentWord), num: hintsRemaining })

  hintsRemaining--;

  if (hintsRemaining <= 0) {
    document.getElementById("getHint").style.display = "none";
  } else {
    document.getElementById("getHint").innerHTML = `${hintsRemaining} hints rem`;
  }

}

const leaveLobby = () => {
  if (hthStarted) {
    alert("Please participate in your challenge!")
    return;
  }
  socket.emit('leaveLobby', { lobby: player.lobbyData.lobby, player: player.lobbyData.player })
  deleteCookie("lobbyCode");
  deleteCookie("inLobby");
  closeLobbyPanel();
  document.getElementById("lobbyPanel").style.display = "none";
  document.getElementById("lobby").style.display = "none";
  document.getElementById("flipGameInner").classList.remove("flip-game");
  document.getElementById("startMenu").style.display = "flex";
  unsetPlayerLobby()
}

const handleTimesUp = () => {
  socket.emit("timesUp", { lobby: player.lobbyData.lobby, player: player.lobbyData.player });
}

//Reponse when lobby is initiated
socket.on('lobbyCreated', (data) => {

  inLobby = true;
  setCookie("inLobby", true);
  document.getElementById("headToHeadWrapper").style.display = "none";
  closeRightPanel();
  document.getElementById("startMenu").style.display = "none";
  document.getElementById("lobby").style.display = "flex";
  player.lobbyData.lobby = data.lobby;
  player.lobbyData.player = data.lobby.players[0];
  setCookie("lobbyCode", data.lobby.code, 100);
  document.getElementById("lobbyPanel").style.display = "flex";
  document.getElementById("joinCodeDiplayWrapper").style.display = "flex";
  updatePlayerDisplay(data.lobby.players, false);
  document.getElementById("lobbyJoinCodeDisplay").innerHTML = data.lobby.code;
  document.getElementById("lobbyTitle").innerHTML = "My Lobby";
  document.getElementById("maxPlayerNum").innerHTML = `${data.lobby.players.length}/2`;
});

//Response for joining a lobby, handles the UI and Player data
socket.on('joined', (data) => {

  inLobby = true;
  player.lobbyData.player = data.player;
  player.lobbyData.lobby = data.lobby;


  closeRightPanel();
  document.getElementById("invitesDisplayWrapper").style.display = "none";
  document.getElementById("headToHeadWrapper").style.display = "none";
  document.getElementById("startMenu").style.display = "none";
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("lobby").style.display = "flex";
  let isCreator = player.lobbyData.player.isCreator;

  let creatorMess = "";
  if (isCreator) {
    creatorMess = "My Lobby";
  } else {
    let creator = data.lobby.players.filter((p) => p.isCreator);
    creatorMess = `${creator[0].username}'s Lobby`;
  }
  document.getElementById("lobbyTitle").innerHTML = creatorMess;
  if (!data.player.isCreator) document.getElementById("startHTH").style.display = "none";
  player.lobbyData.player = data.player;
  player.lobbyData.lobby = data.lobby;
  document.getElementById("lobbyPanel").style.display = "flex";
  document.getElementById("maxPlayerNum").innerHTML = `${data.lobby.players.length}/2`;
  updatePlayerDisplay(data.lobby.players, false);
  setCookie("inLobby", true);
  setCookie("lobbyCode", data.lobby.code, 100);
});

socket.on('unableToJoin', (data) => {

  document.getElementById("lobbyPanel").style.display = "none";
  document.getElementById("lobby").style.display = "none";
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("startMenu").style.display = "flex";

  unsetPlayerLobby();

  alert(data.message);
})
socket.on("alert", (msg) => {
  alert(msg);
})

socket.on("getHint", (hint) => {
  document.getElementById("message2").innerHTML = hint;
})

//THIS IS FOR ALL CLIENTS ----------------------------------------------------

//Starts the game for all connected clients
socket.on('start', (data) => {

  hintsRemaining = 2;

  document.getElementById("leaveLobby").style.display = "none";
  hthStarted = true;
  extra = data.wordData.extr;
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("flipGameInner").classList.add("flip-game");
  document.getElementById("score").innerHTML = lobbySettings.diffSel === 0 ? "Easy" : lobbySettings.diffSel === 2 ? "Hard" : lobbySettings.diffSel === 3 ? "Frenzy" : "Normal";
  let regex = /LobbyItem/;
  // handleHint(hintsRemaining, lobbySettings.catSel.replace(regex, "Item"));
  // let selSplit = lobbySettings.catSel.split("LobbyItem");

  document.getElementById("categorySelectedTxt").innerHTML = titleCase(lobbySettings.catSel.replace(regex, ""));
  document.getElementById("correctWords").innerHTML = "";
  document.getElementById("prevWords").innerHTML = "";
  updatePlayerDisplay(player.lobbyData.lobby.players, true);
  displayMessage("Get Ready!");
  setTimeout(() => {
    playHeadToHead(data.wordData.word, data.time);
  }, 2000);
});
//Alerts all clients of the joined memeber and updates their UI
socket.on('lobbyJoined', (data) => {

  player.lobbyData.lobby = data.lobby;
  updatePlayerDisplay(data.lobby.players, false);
});

socket.on('nextWord', (data) => {

  player.lobbyData.player = data.player;
  document.getElementById("message2").innerHTML = "";
  document.getElementById("guess").style.display = "block";
  hintsRemaining = 2;
  document.getElementById("getHint").style.display = "block";
  document.getElementById("getHint").innerHTML = `${hintsRemaining} hints rem`;
  document.getElementById("prevWords").innerHTML = "";
  document.getElementById("guessOutOfPlace").style.display = "none";
  document.getElementById("guessIncorrect").style.display = "none";
  extra = data.wordData.extr;
  let w = usw(data.wordData.word);
  setSession(w, data.wordData.word, player.currentTime);
  document.getElementById("words").innerHTML = "";
  createInputs(w);
  focusNextOpenInput();
  displayMessage("Next Word!");
});
// socket.on('changeCatSel', (id) => {
//   console.log('Sel cat: ', id);
//   lobbySettings.catSel = id;
//   handleClientLobbySel();

// });

socket.on('refreshUi', (data) => {

  lobbySettings = data.lobbySettings;
  handleClientLobbySel();

});

socket.on('refreshLobby', (data) => {

  player.lobbyData.lobby = data;

  let playerData = data.players.filter((p) => p.id === player.lobbyData.player.id);

  player.lobbyData.player = playerData[0];

  let creatorMess = "";
  if (playerData[0].isCreator) {
    creatorMess = "My Lobby";
  } else {
    let creator = data.players.filter((p) => p.isCreator);
    creatorMess = `${creator[0].username}'s Lobby`;
  }
  document.getElementById("lobbyTitle").innerHTML = creatorMess;
  updatePlayerDisplay(data.players, true);

});


socket.on('gameOver', (data) => {

  clearInterval(timer);
  document.getElementById("words").innerHTML = "";
  document.getElementById("message2").innerHTML = "The word was: " + usw(player.currentWord);
  document.getElementById("message").innerHTML = data;
  document.getElementById("guess").style.display = "none";
  document.getElementById("getHint").style.display = "none";
  player.currentChallenge.challengeI = 0;
  hthStarted = false;
  updatePlayer();
  updateGameData();
});

socket.on('handleWinner', (data) => {

  clearInterval(timer);
  document.getElementById("words").innerHTML = "";
  document.getElementById("message").innerHTML = "You have won!";
  document.getElementById("guess").style.display = "none";
  document.getElementById("getHint").style.display = "none";
  player.totalPoints += (data.points + 15);
  player.totalChallenegesCompleted++;
  player.currentChallenge.challengeI = 0;
  hthStarted = false;
  updatePlayer();
  updateGameData();
});

socket.on('onTimesUp', (data) => {
  hthStarted = false;
  clearInterval(timer);
  document.getElementById("words").innerHTML = "";
  document.getElementById("message").innerHTML = "Time has ran out!";
  document.getElementById("message2").innerHTML = "The word was: " + usw(player.currentWord);
  document.getElementById("guess").style.display = "none";
  document.getElementById("getHint").style.display = "none";
  player.currentChallenge.challengeI = 0;
  updatePlayer();
  updateGameData();
});

socket.on("loading", () => {
  document.getElementById("loading-screen").style.display = "flex";
})

socket.on("newLobby", (data) => {

  //await io.to(data.lobby.code).emit("newLobby", { lobbySettings: lobbySettings[newLobby.code], lobby: newLobby });
  lobbySettings = data.lobbySettings;
  player.lobbyData.lobby = data.lobby;
  hthStarted = false;
  let playerId = getCookie("gameCode");
  let p = data.lobby.players.filter((x) => x.id.toString() === playerId);
  player.lobbyData.player = p[0];
  setCookie("lobbyCode", data.lobby.code, 100);
  setTimeout(() => {
    document.getElementById("message2").innerHTML = "";
    document.getElementById("flipGameInner").classList.remove("flip-game");
    document.getElementById("leaveLobby").style.display = "block";
    socket.emit("refresh", { lobbyCode: data.lobby.code });
    updatePlayerDisplay(data.lobby.players, false);
    let creatorMess = "";
    if (p[0].isCreator) {
      creatorMess = "My Lobby";
    } else {
      let creator = data.lobby.players.filter((p) => p.isCreator);
      creatorMess = `${creator[0].username}'s Lobby`;
      document.getElementById("startHTH").style.display = "none";
    }
    document.getElementById("lobbyTitle").innerHTML = creatorMess;
    handleClientLobbySel();
  }, 5000);
})

socket.on("updatePlayerProgress", (data) => {
  updatePlayerDisplay(data.lobby.players, true);
})

const handleClientLobbySel = () => {

  let catArr = document.getElementsByClassName("categoriesLobbyItem");
  for (let i = 0; i < catArr.length; i++) {
    if (document.getElementById(catArr[i].id).classList.contains("selectedLobbyItem")) {
      document.getElementById(catArr[i].id).classList.remove("selectedLobbyItem");
    }
  };

  document.getElementById(lobbySettings.catSel).classList.add("selectedLobbyItem");


  let diffArr = document.getElementsByName("diffLobRadio");
  for (let i = 0; i < diffArr.length; i++) {
    if (diffArr[i].checked) {
      diffArr[i].checked = false;
    }
  };

  document.getElementById("lobDiff1" + lobbySettings.diffSel).checked = true;

  document.getElementById("lobbyTime").innerHTML = lobbySettings.lobbyDetails.time + "s";
  document.getElementById("lobbyWords").innerHTML = lobbySettings.lobbyDetails.words;
  document.getElementById("lobbyPoints").innerHTML = lobbySettings.lobbyDetails.points + " points";
}


const updatePlayerDisplay = (players, gameStarted) => {

  let playerId = getCookie("gameCode");

  document.getElementById("lobbyPanel").style.display = "flex";


  p = players.filter((x) => x.id.toString() === playerId);

  let progress = !p[0].wordsGuessed ? "Waiting" : p[0].wordsGuessed.length > 2 ? 3 : p[0].wordsGuessed.length;
  let div = "";
  div += `<div class="lobbyPlayerBox"><div class="lobbyPlayerBoxHeader"><h4>${p[0].username}</h4> </div><div class="lobbyPlayerBoxBody"><p style='font-size: 10px'>${hthStarted ? progress + "/3" : "Waiting"}</p></div></div>`;

  for (let i = 0; i < players.length; i++) {
    if (players[i].id.toString() !== playerId) {
      let progress = players[i].wordsGuessed.length > 2 ? 3 : players[i].wordsGuessed.length;
      div += `<div class="lobbyPlayerBox"><div class="lobbyPlayerBoxHeader"><h4>${players[i].username}</h4> </div><div class="lobbyPlayerBoxBody"><p style='font-size: 10px'>${hthStarted ? progress + "/3" : "Waiting"}</p></div></div>`;
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
    catSel: "wordsLobbyItem",
    diffSel: 1,
    lobbyDetails: {
      time: 0,
      words: 0,
      points: 0
    }
  }
}