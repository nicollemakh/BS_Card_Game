import { Card } from "./Card.js";
import { Hand } from "./Hand.js";
import { CARD_VALUES } from "./constants.js";
import { SUIT_SYMBOLS } from "./constants.js";

// Represents a full deck of 52 cards and handles card distribution and tracking
export class Deck {
  deck: Card[] = []; // Main deck of cards
  playedDic: Record<string, number> = {}; // Tracks actual played cards by value
  saidPlayedDic: Record<string, number> = {}; // Tracks claimed cards by value

  constructor() {
    // Initialize full deck (0–51)
    for (let i = 0; i < 52; i++) {
      this.deck.push(new Card(i));
    }

    // Initialize tracking dictionaries
    for (const val of CARD_VALUES) {
      this.playedDic[val] = 0;
      this.saidPlayedDic[val] = 0;
    }
  }

  // Shuffles the deck using Fisher–Yates algorithm
  shuffle(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Deals one card from the top of the deck
  dealCard(): Card | undefined {
    return this.deck.pop();
  }

  // Evenly deals cards to all players; leftover cards get tracked (not handed out)
  dealHands(numPlayers: number, hands: Hand[]): void {
    const handSize = Math.floor(this.deck.length / numPlayers);
    const remainder = this.deck.length % numPlayers;

    // Deal equal number of cards to each hand
    for (let i = 0; i < handSize; i++) {
      for (let p = 0; p < numPlayers; p++) {
        const card = this.dealCard();
        if (card) hands[p].addCard(card);
      }
    }

    // Track leftover cards (undealt)
    for (let i = 0; i < remainder; i++) {
      const card = this.deck[i];
      this.playedDic[card.value]++;
    }
  }

  // Resets both tracking dictionaries
  resetTracking(): void {
    for (const val of CARD_VALUES) {
      this.playedDic[val] = 0;
      this.saidPlayedDic[val] = 0;
    }
  }

  // Creates a Card object from a string like "A♠" or "10♦"
  createCardFromString(cardStr: string): Card {
    const value = cardStr.slice(0, -1); // e.g., "A", "10"
    const symbol = cardStr.slice(-1);   // e.g., "♠"
    const suitIndex = SUIT_SYMBOLS.indexOf(symbol);
    const valueIndex = CARD_VALUES.indexOf(value);
    const cardNum = suitIndex * 13 + valueIndex;
    return new Card(cardNum);
  }
}
