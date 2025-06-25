import { Card } from "./Card.js";
import { Hand } from "./Hand.js";
import { Deck } from "./Deck.js";
import { CARD_VALUES } from "./constants.js";

// === Game state ===
let turnCount = 0;                    // Tracks current turn number (used to cycle declared values)
const numPlayers = 4;                // Total number of players
const hands: Hand[] = [];            // Array of player hands
const aiPlayers = new Set([1]);      // Set of AI player indices

let deck: Deck;
let currentPlayer = 0;               // Index of player whose turn it is
let lastPlayedCards: Card[] = [];   // Stores last played cards (to check for BS)
let lastPlayer = -1;                // Player who just played
let lastDeclaredValue = "";         // What the last player claimed they played

// === Rule modal elements ===
const rulesButton = document.getElementById("rules-button")!;
const rulesModal = document.getElementById("rules-modal")!;
const closeRules = document.getElementById("close-rules")!;

rulesButton.addEventListener("click", () => (rulesModal.style.display = "block"));
closeRules.addEventListener("click", () => (rulesModal.style.display = "none"));

// === UI elements ===
const handDisplay = document.getElementById("hand-display")!;
const playButton = document.getElementById("play-button")!;
const playedArea = document.getElementById("played-cards")!;
const bsButton = document.getElementById("bs-button")!;
const bsResult = document.getElementById("bs-result")!;
const nextButton = document.getElementById("next-button")!;

// === Initialize and start the game ===
function setupGame() {
  deck = new Deck();
  deck.shuffle();

  // Deal hands to all players
  for (let i = 0; i < numPlayers; i++) {
    hands.push(new Hand());
  }
  deck.dealHands(numPlayers, hands);

  renderHand();
  maybeTriggerAITurn(); 
}

// === Renders the current player's hand on the screen ===
function renderHand() {
  handDisplay.innerHTML = "";
  const playerHand = hands[currentPlayer];
  const currentCardValue = CARD_VALUES[turnCount % CARD_VALUES.length];

  playerHand.hand.forEach((card, index) => {
    const cardBtn = document.createElement("button");
    cardBtn.className = `card ${card.color}`;
    cardBtn.style.display = "inline-block";
    cardBtn.dataset.index = index.toString();
    cardBtn.textContent = card.toString();

    // Card click selects/deselects
    cardBtn.addEventListener("click", () => {
      const isSelected = cardBtn.classList.toggle("selected");

      // Limit selection to 4 cards
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

    handDisplay.appendChild(cardBtn);
  });

  const status = document.getElementById("game-status")!;
  status.textContent = `Player ${currentPlayer}'s turn — declare: ${currentCardValue}`;
}

// === When a player hits "Play" button ===
function handlePlay() {
  const selectedButtons = handDisplay.querySelectorAll<HTMLButtonElement>(".card.selected");
  const selectedIndices = Array.from(selectedButtons).map(btn => parseInt(btn.dataset.index!));

  if (selectedIndices.length === 0) {
    alert("Please select at least one card.");
    return;
  }

  lastPlayer = currentPlayer;
  const playedCards = hands[currentPlayer].playCards(selectedIndices);
  lastPlayedCards = playedCards;

  // Check for winner and end game if found
  if (checkWinner()) {
    return;
  }

  lastDeclaredValue = CARD_VALUES[turnCount % CARD_VALUES.length];
  playedArea.innerHTML = `Player ${lastPlayer} declared ${playedCards.length} ${lastDeclaredValue}(s)`;

  selectedButtons.forEach(btn => btn.classList.remove("selected"));

  currentPlayer = (currentPlayer + 1) % numPlayers;
  turnCount++;
  bsResult.textContent = "";
  renderHand();
  maybeTriggerAITurn(); 
}

// === Handles a BS call ===
function handleBS() {
  if (lastPlayedCards.length === 0) {
    bsResult.textContent = "No cards have been played yet!";
    return;
  }

  // Check if any played card doesn't match the declared value
  const isLie = lastPlayedCards.some(card => card.value !== lastDeclaredValue);

  if (isLie) {
    bsResult.textContent = `BS was correct! Player ${lastPlayer} picks up the cards.`;
    hands[lastPlayer].addCards(lastPlayedCards);
  } else {
    bsResult.textContent = `Wrong BS! Player ${currentPlayer} picks up the cards.`;
    hands[currentPlayer].addCards(lastPlayedCards);
  }

  lastPlayedCards = [];
  playedArea.textContent = "";

  currentPlayer = (currentPlayer + 1) % numPlayers;
  turnCount++;

  renderHand();
  maybeTriggerAITurn(); 
}

// === Manual "Next" button (skip turn) ===
function handleNext() {
  currentPlayer = (currentPlayer + 1) % numPlayers;
  playedArea.textContent = "";
  bsResult.textContent = "";
  renderHand();

  if (aiPlayers.has(currentPlayer)) {
    setTimeout(() => {
      aiTakeTurn();
      maybeAIcallsBS();
    }, 1000);
  }
}

// === AI turn logic ===
function aiTakeTurn() {
  const aiHand = hands[player];
  const currentCard = CARD_VALUES[turnCount % CARD_VALUES.length];

  const playHonestly = Math.random() < 0.6;
  const matchingCards = aiHand.hand.filter(card => card.value === currentCard);
  let cardsToPlay: Card[] = [];

  if (playHonestly && matchingCards.length > 0) {
    cardsToPlay = matchingCards.slice(0, 4);
  } else {
    cardsToPlay = aiHand.hand.slice(0, Math.min(3, aiHand.hand.length));
  }

  const indices = cardsToPlay.map(card => aiHand.hand.indexOf(card));
  const played = aiHand.playCards(indices);
  lastPlayedCards = played;
  lastPlayer = player;
  lastDeclaredValue = currentCard;

  playedArea.innerHTML = `Player ${player} (AI) declared ${played.length} ${lastDeclaredValue}(s)`;

  // Update currentPlayer and turnCount here only after the AI turn ends:
  if (player === currentPlayer) {
    currentPlayer = (currentPlayer + 1) % numPlayers;
    turnCount++;
  }

  renderHand();

  setTimeout(() => {
    if (aiPlayers.has(currentPlayer)) {
      maybeAIcallsBS(currentPlayer);
      setTimeout(() => aiTakeTurn(currentPlayer), 1000);
    }
  }, 1000);
}

// === AI randomly decides to call BS ===
function maybeAIcallsBS() {
  const challenger = player;
  const target = (challenger - 1 + numPlayers) % numPlayers;

  if (lastPlayedCards.length > 0 && aiPlayers.has(challenger) && Math.random() < 0.3) {
    bsResult.textContent = `AI Player ${challenger} calls BS on Player ${target}!`;
    handleBS();
  }
}

// === Checks if AI should go next ===
function maybeTriggerAITurn() {
  if (aiPlayers.has(currentPlayer)) {
    const playerAtCall = currentPlayer; // lock current player index here
    setTimeout(() => {
      if (aiPlayers.has(playerAtCall)) maybeAIcallsBS(playerAtCall);
      setTimeout(() => {
        if (aiPlayers.has(playerAtCall)) aiTakeTurn(playerAtCall);
      }, 1000);
    }, 1000);
  }
}
// === Check's if Someone Won ===
function checkWinner(): boolean {
  for (let i = 0; i < numPlayers; i++) {
    if (hands[i].hand.length === 0) {
      alert(`Player ${i} wins! 🎉`);
      
      // Disable buttons to end game
      playButton.disabled = true;
      bsButton.disabled = true;
      nextButton.disabled = true;
      
      return true;  // winner found
    }
  }
  return false; // no winner yet
}

// === Start the game and wire up controls ===
setupGame();
playButton.addEventListener("click", handlePlay);
bsButton.addEventListener("click", handleBS);
nextButton.addEventListener("click", handleNext);
