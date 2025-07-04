import { Hand } from "./Hand.js";
import { Deck } from "./Deck.js";
import { CARD_VALUES } from "./constants.js";
// === Game State ===
let turnCount = 0;
const numPlayers = 4;
const hands = [];
const aiPlayers = new Set([1]); // Only Player 1 is AI
let deck;
let currentPlayer = 0;
let lastPlayedCards = [];
let lastPlayer = -1;
let lastDeclaredValue = "";
// === UI Elements ===
const handDisplay = document.getElementById("hand-display");
const playButton = document.getElementById("play-button");
const bsButton = document.getElementById("bs-button");
const nextButton = document.getElementById("next-button");
const playedArea = document.getElementById("played-cards");
const bsResult = document.getElementById("bs-result");
const gameStatus = document.getElementById("game-status");
const rulesButton = document.getElementById("rules-button");
const rulesModal = document.getElementById("rules-modal");
const closeRules = document.getElementById("close-rules");
// === Event Listeners ===
rulesButton.addEventListener("click", () => (rulesModal.style.display = "block"));
closeRules.addEventListener("click", () => (rulesModal.style.display = "none"));
// === Game Setup ===
function setupGame() {
    console.log("Hello setup");
    deck = new Deck();
    deck.shuffle();
    for (let i = 0; i < numPlayers; i++) {
        hands.push(new Hand());
    }
    deck.dealHands(numPlayers, hands);
    skipEmptyHands();
    renderHand();
    maybeTriggerAITurn();
}
// === Skip Players With No Cards ===
function skipEmptyHands() {
    console.log("Hello emptyHands");
    let tries = 0;
    while (hands[currentPlayer].hand.length === 0 && tries < numPlayers) {
        currentPlayer = (currentPlayer + 1) % numPlayers;
        tries++;
    }
}
// check for end game
function checkForGameEnd() {
    console.log("Hello checkEndGame");
    const playersWithCards = hands.filter(hand => hand.hand.length > 0);
    if (playersWithCards.length <= 1) {
        const remainingPlayerIndex = hands.findIndex(hand => hand.hand.length > 0);
        const msg = playersWithCards.length === 1
            ? `Game Over — Player ${remainingPlayerIndex} is the last one with cards!`
            : `Game Over — No players have cards left!`;
        gameStatus.textContent = msg;
        alert(msg);
        playButton.disabled = true;
        bsButton.disabled = true;
        nextButton.disabled = true;
        return true;
    }
    return false;
}
// === Render Current Hand ===
function renderHand() {
    console.log("Hello render");
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
                        c.disabled = true;
                    }
                });
            }
            else {
                cards.forEach(c => (c.disabled = false));
            }
        });
        handDisplay.appendChild(btn);
    });
    gameStatus.textContent = `Player ${currentPlayer}'s turn — declare: ${currentCardValue}`;
}
// === Handle Play Button ===
function handlePlay() {
    console.log("Hello handlePlay");
    console.log("handlePlay triggered");
    const selectedButtons = handDisplay.querySelectorAll(".card.selected");
    const selectedIndices = Array.from(selectedButtons).map(btn => parseInt(btn.dataset.index));
    if (selectedIndices.length === 0) {
        console.log("No cards selected!");
        return alert("Select at least one card.");
    }
    lastPlayer = currentPlayer;
    lastPlayedCards = hands[currentPlayer].playCards(selectedIndices);
    lastDeclaredValue = CARD_VALUES[turnCount % CARD_VALUES.length];
    playedArea.textContent = `Player ${lastPlayer} declared ${lastPlayedCards.length} ${lastDeclaredValue}(s)`;
    selectedButtons.forEach(btn => btn.classList.remove("selected"));
    bsResult.textContent = "";
    if (checkForGameEnd())
        return;
    currentPlayer = (currentPlayer + 1) % numPlayers;
    skipEmptyHands();
    turnCount++;
    renderHand();
    maybeTriggerAITurn();
}
// === Handle BS Button ===
function handleBS() {
    console.log("Hello handleBS");
    if (lastPlayedCards.length === 0) {
        bsResult.textContent = "No cards to call BS on!";
        return;
        if (checkForGameEnd())
            return;
    }
    const isLie = lastPlayedCards.some(card => card.value !== lastDeclaredValue);
    if (isLie) {
        hands[lastPlayer].addCards(lastPlayedCards);
        bsResult.textContent = `Correct! Player ${lastPlayer} picks up the cards.`;
    }
    else {
        hands[currentPlayer].addCards(lastPlayedCards);
        bsResult.textContent = `Wrong! Player ${currentPlayer} picks up the cards.`;
    }
    lastPlayedCards = [];
    playedArea.textContent = "";
    currentPlayer = (currentPlayer + 1) % numPlayers;
    skipEmptyHands();
    turnCount++;
    renderHand();
    maybeTriggerAITurn();
}
// === AI Turn ===
function aiTakeTurn() {
    console.log("Hello aitakeover");
    const hand = hands[currentPlayer];
    const targetValue = CARD_VALUES[turnCount % CARD_VALUES.length];
    const matching = hand.hand.filter(card => card.value === targetValue);
    let toPlay;
    if (Math.random() < 0.6 && matching.length > 0) {
        toPlay = matching.slice(0, 4);
    }
    else {
        toPlay = hand.hand.slice(0, Math.min(3, hand.hand.length));
    }
    const indices = toPlay.map(card => hand.hand.indexOf(card));
    lastPlayedCards = hand.playCards(indices);
    lastDeclaredValue = targetValue;
    lastPlayer = currentPlayer;
    playedArea.textContent = `AI Player ${currentPlayer} declared ${lastPlayedCards.length} ${lastDeclaredValue}(s)`;
    if (checkForGameEnd())
        return;
    currentPlayer = (currentPlayer + 1) % numPlayers;
    skipEmptyHands();
    turnCount++;
    renderHand();
    maybeTriggerAITurn();
}
// === AI May Call BS ===
function maybeAIcallsBS() {
    console.log("Hello maybeAI");
    const challenger = currentPlayer;
    const target = (challenger - 1 + numPlayers) % numPlayers;
    if (lastPlayedCards.length > 0 && aiPlayers.has(challenger) && Math.random() < 0.3) {
        bsResult.textContent = `AI Player ${challenger} calls BS on Player ${target}!`;
        handleBS();
    }
}
// === Trigger AI Turn If Needed ===
function maybeTriggerAITurn() {
    console.log("Hello maybeTrigger");
    if (aiPlayers.has(currentPlayer)) {
        setTimeout(() => {
            maybeAIcallsBS();
            setTimeout(() => aiTakeTurn(), 1000);
        }, 1000);
    }
}
// === Handle Next Button ===
function handleNext() {
    console.log("Hello handleNext");
    currentPlayer = (currentPlayer + 1) % numPlayers;
    skipEmptyHands();
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
//# sourceMappingURL=main.js.map
