
let musicOn = true;
let volume = 0.02;
let menuMusicPlaying = false;
let gameMusicPlaying = false;
//Menu music and sounds
const menuBKGMusic = [
  'assets/audio/bkg1.mp3',
  'assets/audio/bkg2.mp3',
  'assets/audio/bkg3.mp3'
];
const inviteAlertSound = new Howl({ src: ['assets/audio/invitealert.mp3'], volume: .1 });
const lobbyJoinSound = new Howl({ src: ['assets/audio/lobbyjoin.mp3'], volume: .1 });
const lobbyLeaveSound = new Howl({ src: ['assets/audio/lobbyleave.mp3'], volume: .1 });
//Game music and sounds
const gameBKGMusic = [
  'assets/audio/gamebkg1.mp3',
  'assets/audio/gamebkg2.mp3',
  'assets/audio/gamebkg3.mp3',
  'assets/audio/gamebkg4.mp3'
];
const winnerMusic = new Howl({ src: ['assets/audio/winner.mp3'], volume });
const loserMusic = new Howl({ src: ['assets/audio/loser.mp3'], volume });
const countDownTickSound = new Howl({ src: ['assets/audio/clockTick.mp3'], volume: .1 });
const countDownGoSound = new Howl({ src: ['assets/audio/countdownGo.mp3'], volume: .1 });
const correctSound = new Howl({ src: ['assets/audio/correct.mp3'], volume: .1 });
const incorrectSound = new Howl({ src: ['assets/audio/incorrect2.mp3'], volume: .1 });


let menuMusicIndex = -1;
const playMenuBKMusic = () => {
  if (!musicOn || menuMusicPlaying || spStarted) return;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * menuBKGMusic.length);
  } while (randomIndex === menuMusicIndex);
  menuMusicIndex = randomIndex;

  let newSound = new Howl({ src: [menuBKGMusic[randomIndex]], volume });
  newSound.play();
  newSound.fade(0, newSound.volume(), 5000);
  newSound.on('end', function () {
    menuMusicPlaying = false;
    playMenuBKMusic();
  });
  menuMusicPlaying = newSound;

}

const idk = () => {
  menuMusicPlaying.volume(.02);
}

let gameMusicIndex = -1;
const playGameBKMusic = () => {
  if (!musicOn) return;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * gameBKGMusic.length);
  } while (randomIndex === gameMusicIndex);
  let newSound = new Howl({ src: [gameBKGMusic[randomIndex]], volume });
  newSound.play();
  newSound.fade(0, newSound.volume(), 5000);
  newSound.on('end', function () {
    menuMusicPlaying = false;
    playGameBKMusic();
  });
  gameMusicPlaying = newSound;

}

const playSound = (sound) => {
  if (!musicOn) return;
  if (menuMusicPlaying) {
    menuMusicPlaying.volume(.02);
  }
  if (gameMusicPlaying) {
    gameMusicPlaying.volume(.02);
  }
  sound.on('end', () => {
    if (menuMusicPlaying) {
      menuMusicPlaying.volume(.02);
    }
    if (gameMusicPlaying) {
      gameMusicPlaying.volume(.02);
    }
  });
  sound.play();
}

const stopBKMusic = () => {
  Howler.stop();
  menuMusicPlaying = false;
  gameMusicPlaying = false;
}

const stopMenuBKMusic = () => {
  menuMusicPlaying.stop();
  menuMusicPlaying = false;
}

const stopGameBKMusic = () => {
  gameMusicPlaying.stop();
  gameMusicPlaying = false;
}

const playWinnerMusic = () => {
  if (!musicOn) return;
  gameMusicPlaying.volume(0);
  winnerMusic.on('end', () => {
    if (gameMusicPlaying) {
      gameMusicPlaying.volume(volume);
    }
  });
  winnerMusic.play();
}
const playLoserMusic = () => {
  if (!musicOn) return;
  gameMusicPlaying.volume(0);
  loserMusic.on('end', () => {
    if (gameMusicPlaying) {
      gameMusicPlaying.volume(volume);
    }
  });
  loserMusic.play();
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
  playMenuBKMusic();
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
  playMenuBKMusic();
})


const addTokenToData = (data) => {
  const token = getCookie('at');
  return { ...data, token };
}
