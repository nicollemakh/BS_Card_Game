console.log("🎮 BS Game script loaded");
// === Imports ===
import { Card } from "./Card.js";
import { Hand } from "./Hand.js";
import { Deck } from "./Deck.js";
import { CARD_VALUES } from "./constants.js";

// === Game State ===
let turnCount = 0;
const numPlayers = 4;
const hands: Hand[] = [];
const aiPlayers = new Set([1]); // Only Player 1 is AI

let deck: Deck;
let currentPlayer = 0;
let lastPlayedCards: Card[] = [];
let lastPlayer = -1;
let lastDeclaredValue = "";

// === UI Elements ===
const handDisplay = document.getElementById("hand-display")!;
const playButton = document.getElementById("play-button")!;
console.log("playButton is:", playButton);
const bsButton = document.getElementById("bs-button")!;
const nextButton = document.getElementById("next-button")!;
const playedArea = document.getElementById("played-cards")!;
const bsResult = document.getElementById("bs-result")!;
const gameStatus = document.getElementById("game-status")!;
const rulesButton = document.getElementById("rules-button")!;
const rulesModal = document.getElementById("rules-modal")!;
const closeRules = document.getElementById("close-rules")!;

// === Event Listeners ===
rulesButton.addEventListener("click", () => (rulesModal.style.display = "block"));
closeRules.addEventListener("click", () => (rulesModal.style.display = "none"));

// === Game Setup ===
function setupGame() {
  deck = new Deck();
  deck.shuffle();

  for (let i = 0; i < numPlayers; i++) {
    hands.push(new Hand());
  }
  deck.dealHands(numPlayers, hands);

  renderHand();
  maybeTriggerAITurn();
}

// === Render Current Hand ===
function renderHand() {
  handDisplay.innerHTML = "";
  const playerHand = hands[currentPlayer];
  const currentCardValue = CARD_VALUES[turnCount % CARD_VALUES.length];

  playerHand.hand.forEach((card, index) => {
    const btn = document.createElement("button");
    btn.className = `card ${card.color}`;
    btn.dataset.index = index.toString();
    btn.textContent = card.toString();

    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
      const selected = handDisplay.querySelectorAll(".card.selected");
      const cards = handDisplay.querySelectorAll(".card");

      if (selected.length >= 4) {
        cards.forEach(c => {
          if (!c.classList.contains("selected")) {
            (c as HTMLButtonElement).disabled = true;
          }
        });
      } else {
        cards.forEach(c => ((c as HTMLButtonElement).disabled = false));
      }
    });

    handDisplay.appendChild(btn);
  });

  gameStatus.textContent = `Player ${currentPlayer}'s turn — declare: ${currentCardValue}`;
}

// === Handle Play Button ===
function handlePlay() {
  console.log("handlePlay triggered");

  // 1. Log which cards are selected by the user (indices)
  const selectedButtons = handDisplay.querySelectorAll<HTMLButtonElement>(".card.selected");
  const selectedIndices = Array.from(selectedButtons).map(btn => parseInt(btn.dataset.index!));
  console.log("Selected indices:", selectedIndices);

  if (selectedIndices.length === 0) {
    console.log("No cards selected!");
    return alert("Select at least one card.");
  }

  // 2. Before playing cards, log current hand for this player
  console.log("Hand before play:", hands[currentPlayer].hand.map(c => c.toString()));

  // 3. Remove cards from hand
  lastPlayer = currentPlayer;
  lastPlayedCards = hands[currentPlayer].playCards(selectedIndices);

  // 4. After playing cards, log updated hand to confirm removal
  console.log("Hand after play:", hands[currentPlayer].hand.map(c => c.toString()));

  lastDeclaredValue = CARD_VALUES[turnCount % CARD_VALUES.length];
  playedArea.textContent = `Player ${lastPlayer} declared ${lastPlayedCards.length} ${lastDeclaredValue}(s)`;

  // 5. Check if player has emptied their hand and won
  if (hands[currentPlayer].hand.length === 0) {
    console.log(`Player ${currentPlayer} wins!`);
    gameStatus.textContent = `Game Over — Player ${currentPlayer} wins! 🎉 (alert replaced)`;
    alert(`Player ${currentPlayer} wins! 🎉`);
    playButton.disabled = true;
    bsButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  selectedButtons.forEach(btn => btn.classList.remove("selected"));
  bsResult.textContent = "";

  currentPlayer = (currentPlayer + 1) % numPlayers;
  turnCount++;
  renderHand();
  maybeTriggerAITurn();
}

// === Handle BS Button ===
function handleBS() {
  if (lastPlayedCards.length === 0) {
    bsResult.textContent = "No cards to call BS on!";
    return;
  }
  const isLie = lastPlayedCards.some(card => card.value !== lastDeclaredValue);

  if (isLie) {
    hands[lastPlayer].addCards(lastPlayedCards);
    bsResult.textContent = `Correct! Player ${lastPlayer} picks up the cards.`;
  } else {
    hands[currentPlayer].addCards(lastPlayedCards);
    bsResult.textContent = `Wrong! Player ${currentPlayer} picks up the cards.`;
  }

  lastPlayedCards = [];
  playedArea.textContent = "";

  if (checkWinner()) return;

  currentPlayer = (currentPlayer + 1) % numPlayers;
  turnCount++;
  renderHand();
  maybeTriggerAITurn();
}

// === AI Turn ===
function aiTakeTurn() {
  const hand = hands[currentPlayer];
  const targetValue = CARD_VALUES[turnCount % CARD_VALUES.length];
  const matching = hand.hand.filter(card => card.value === targetValue);

  let toPlay: Card[];
  if (Math.random() < 0.6 && matching.length > 0) {
    toPlay = matching.slice(0, 4);
  } else {
    toPlay = hand.hand.slice(0, Math.min(3, hand.hand.length));
  }

  const indices = toPlay.map(card => hand.hand.indexOf(card));
  lastPlayedCards = hand.playCards(indices);
  lastDeclaredValue = targetValue;
  lastPlayer = currentPlayer;

  playedArea.textContent = `AI Player ${currentPlayer} declared ${lastPlayedCards.length} ${lastDeclaredValue}(s)`;

  // Check winner before moving to next player
  if (hand.hand.length === 0) {
    alert(`Player ${currentPlayer} wins! 🎉`);
    playButton.disabled = true;
    bsButton.disabled = true;
    nextButton.disabled = true;
    gameStatus.textContent = `Game Over — Player ${currentPlayer} wins! 🎉`;
    return;
  }

  currentPlayer = (currentPlayer + 1) % numPlayers;
  turnCount++;
  renderHand();
  maybeTriggerAITurn();
}

// === AI May Call BS ===
function maybeAIcallsBS() {
  const challenger = currentPlayer;
  const target = (challenger - 1 + numPlayers) % numPlayers;
  if (lastPlayedCards.length > 0 && aiPlayers.has(challenger) && Math.random() < 0.3) {
    bsResult.textContent = `AI Player ${challenger} calls BS on Player ${target}!`;
    handleBS();
  }
}

// === Trigger AI Turn If Needed ===
function maybeTriggerAITurn() {
  if (aiPlayers.has(currentPlayer)) {
    setTimeout(() => {
      maybeAIcallsBS();
      setTimeout(() => aiTakeTurn(), 1000);
    }, 1000);
  }
}

// === Check For Winner ===
function checkWinner(): boolean {
  for (let i = 0; i < numPlayers; i++) {
    if (hands[i].hand.length === 0) {
      alert(`Player ${i} wins! 🎉`);
      playButton.disabled = true;
      bsButton.disabled = true;
      nextButton.disabled = true;
      gameStatus.textContent = `Game Over — Player ${i} wins! 🎉`;
      return true;
    }
  }
  return false;
}

// === Next Button ===
function handleNext() {
  currentPlayer = (currentPlayer + 1) % numPlayers;
  playedArea.textContent = "";
  bsResult.textContent = "";
  renderHand();
  maybeTriggerAITurn();
}

// === Start Game ===
setupGame();
playButton.addEventListener("click", handlePlay);
bsButton.addEventListener("click", handleBS);
nextButton.addEventListener("click", handleNext);
