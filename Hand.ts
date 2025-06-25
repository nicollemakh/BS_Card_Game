import { Card } from "./Card.js";

// Represents a player's hand of cards
export class Hand {
  hand: Card[] = [];

  // Adds a card to the player's hand
  addCard(card: Card): void {
    this.hand.push(card);
  }
  addCards(cards: Card[]): void {
  cards.forEach(card => this.addCard(card));
  }

  // Removes and returns a single card at a given index
  playCard(index: number): Card {
    return this.hand.splice(index, 1)[0];
  }

  // Removes and returns multiple cards by their indices
 playCards(indices: number[]): Card[] {
  // Sort indices descending so removal won't shift positions of remaining cards
  const sortedIndices = [...indices].sort((a, b) => b - a);
  const playing: Card[] = [];

  for (const index of sortedIndices) {
    playing.push(this.hand.splice(index, 1)[0]);
  }

  // Reverse to keep original order if needed
  return playing.reverse();
}

  // For debugging: shows hand with card indices
  toString(): string {
    return this.hand.map((card, i) => `${card.toString()} [${i}]`).join("  ");
  }
}
