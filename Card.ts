import { CARD_VALUES, SUIT_SYMBOLS } from "./constants.js";

// Represents a single playing card
export class Card {
  num: number;        // Integer from 0–51 representing unique card
  amount: number;     // Value index (0–12), e.g., 0 = A, 12 = K
  value: string;      // Card face value (e.g., "A", "10", "K")
  suit: number;       // Suit index (0–3)
  symbol: string;     // Suit symbol (e.g., "♠", "♦")
  color: string;      // "red" or "black" based on suit
  fullCard: string;   // Full display string (e.g., "Q♠")

  constructor(num: number) {
    this.num = num;
    this.amount = num % 13;
    this.value = CARD_VALUES[this.amount];      // Map to card face
    this.suit = Math.floor(num / 13);           // Determine suit
    this.symbol = SUIT_SYMBOLS[this.suit];      // Map to symbol
    this.color = this.suit < 2 ? "red" : "black"; // Red: ♠♦, Black: ♣♠
    this.fullCard = `${this.value}${this.symbol}`;
  }

  // Returns a new identical card
  copy(): Card {
    return new Card(this.num);
  }

  // For display in logs or UI
  toString(): string {
    return this.fullCard;
  }
}
