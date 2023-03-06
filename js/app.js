'use strict';

// selectors
const boardContainer = document.querySelector('.board-container');
const board = document.querySelector('.board');
const level = document.querySelector('.level');
const moves = document.querySelector('.moves');
const timer = document.querySelector('.timer');
const pairsMatched = document.querySelector('.pairs-matched');
const win = document.querySelector('.win');
const startBtn = document.querySelector('.start-btn');

const initialState = {
  gameStarted: false,
  level: 1,
  flippedCards: 0,
  matchedPairs: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

// on load
window.addEventListener('load', () => {
  renderStats();
  generateGame();
  attachEventListeners();
});

// randomizing order of cards array
const shuffledCards = (array) => {
  const clonedArray = [...array];

  for (let i = clonedArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const orig = clonedArray[i];

    clonedArray[i] = clonedArray[randomIndex];
    clonedArray[randomIndex] = orig;
  }
  return clonedArray;
};

// selecting specific num of unique cards (depending on level/dimensions)
const pickRandom = (array, numItems) => {
  const clonedArray = [...array];
  const randomPicks = [];

  for (let i = 0; i < numItems; i++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length);

    randomPicks.push(clonedArray[randomIndex]);
    clonedArray.splice(randomIndex, 1);
  }
  return randomPicks;
};

// formatting timer
const timerFormat = (time) => {
  const minute = Math.floor(time / 60);
  const seconds = time < 10 ? time.toString().padStart(2, '0') : time >= 60 * minute ? (time - 60 * minute).toString().padStart(2, '0') : time - 60;

  return `${minute}:${seconds}`;
};

// dynamically generating randomized cards in grid based on level/dimensions
const generateGame = () => {
  const pairs = board.getAttribute('data-pairs');

  if ((pairs * pairs) % 2 !== 0) {
    throw new Error('The dimensions of the board must equal an even number.');
  }

  const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];
  const picks = pickRandom(emojis, pairs);
  const items = shuffledCards([...picks, ...picks]);

  const cards = ` <div class='board' style="grid-template-columns: repeat(${pairs === '6' ? 4 : pairs > 6 ? pairs / 2 : pairs}, auto)">
  ${items
    .map((item) => {
      return `<div class="card">
    <div class="card-front"></div>
    <div class="card-back">${item}</div>
    </div>`;
    })
    .join('')}</div>`;

  const parser = new DOMParser().parseFromString(cards, 'text/html');
  document.querySelector('.board').replaceWith(parser.querySelector('.board'));
};

const startGame = () => {
  initialState.gameStarted = true;
  startBtn.classList.add('disabled');

  initialState.loop = setInterval(() => {
    initialState.totalTime++;
    renderStats();
  }, 1000);
};

////////////////////////////// render stats
const renderStats = () => {
  const pairs = board.getAttribute('data-pairs');
  level.innerText = `${initialState.level} / 4`;
  moves.innerText = `${initialState.totalFlips}`;
  timer.innerText = timerFormat(initialState.totalTime);
  pairsMatched.innerText = `${initialState.matchedPairs} / ${pairs}`;
};
//////////////////////////////

const flipBackCard = () => {
  document.querySelectorAll('.card').forEach((card) => {
    if (!card.classList.contains('matched')) {
      card.classList.remove('flip');
    }
  });
  initialState.flippedCards = 0;
};

const flipCard = (card) => {
  initialState.flippedCards++;
  initialState.totalFlips++;

  if (!initialState.gameStarted) {
    startGame();
  }
  if (initialState.flippedCards <= 2) {
    card.classList.add('flip');
  }
  if (initialState.flippedCards === 2) {
    const flippedCards = document.querySelectorAll('.flip:not(.matched)');

    // check if two cards match, else flip back and remove flip class
    if (flippedCards[0].innerText === flippedCards[1].innerText) {
      flippedCards[0].classList.add('matched');
      flippedCards[1].classList.add('matched');
      initialState.matchedPairs++;
    }
    setTimeout(() => {
      flipBackCard();
    }, 700);
  }
  // if all cards on board are flipped
  if (!document.querySelectorAll('.card:not(.flip)').length) {
    setTimeout(() => {
      boardContainer.classList.add('flip');
      win.innerHTML = `<span class="win-text">
        Congrats!🎉 <br/><br/>
        You rocked <span class="highlight">Level ${initialState.level}</span> with <span class="highlight">${
        initialState.totalFlips
      }</span> moves in <span class="highlight">${initialState.totalTime}</span> seconds!😍  
        ${
          initialState.level < 4
            ? `<button class="btn next-level-btn">Move on to the next level</button></span>`
            : `<br/><br/>
        You beat the game!🏆
        <br/><br/>
<button class="btn home-btn">Play again</button>
        </span>`
        }`;

      gameLog(`You completed level ${initialState.level} in ${initialState.totalTime} sec with ${initialState.totalFlips} moves.`);
      if (initialState.level === 4) {
        gameLog('Congrats, you beat the game!');
      }
      clearInterval(initialState.loop);
    }, 1000);
  }
};

// game log
const gameLog = (msg) => {
  const log = document.createElement('li');
  log.innerText = msg;
  document.querySelector('.game-log').appendChild(log);
};

// resetting board
const resetBoard = () => {
  startBtn.classList.remove('disabled');
  boardContainer.classList.remove('flip');
  document.querySelectorAll('.card').forEach((card) => {
    card.classList.remove('flip');
    card.classList.remove('matched');
  });
};

// event listeners
const attachEventListeners = () => {
  document.addEventListener('click', (e) => {
    const eventTarget = e.target;
    const eventParent = eventTarget.parentElement;

    if (eventTarget.className.includes('card') && !eventParent.className.includes('flip')) {
      flipCard(eventParent);
    } else if (eventTarget.className.includes('start-btn') && !eventTarget.className.includes('disabled')) {
      startGame();
    } else if (eventTarget.className.includes('replay-btn')) {
      gameLog('You replayed the level.');
      clearInterval(initialState.loop);
      init();
      resetBoard();
      renderStats();
      generateGame();
    } else if (eventTarget.className.includes('next-level-btn')) {
      const pairs = board.getAttribute('data-pairs');
      board.setAttribute('data-pairs', `${+pairs === 10 ? 10 : +pairs + 2}`);
      clearInterval(initialState.loop);
      resetBoard();
      init();
      initialState.level++;
      renderStats();
      generateGame();
    } else if (eventTarget.className.includes('home-btn')) {
      gameLog('You restarted the game.');
      board.setAttribute('data-pairs', `4`);
      clearInterval(initialState.loop);
      resetBoard();
      init();
      initialState.level = 1;
      renderStats();
      generateGame();
    }
  });
};

const init = () => {
  initialState.gameStarted = false;
  // initialState.level = 1;
  initialState.flippedCards = 0;
  initialState.matchedPairs = 0;
  initialState.totalFlips = 0;
  initialState.totalTime = 0;
  initialState.loop = null;
};
