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
  console.log("playCards called with indices:", indices);
  const playing: Card[] = [];
  const remaining: Card[] = [];

  this.hand.forEach((card, i) => {
    if (indices.includes(i)) {
      console.log(`Removing card at index ${i}: ${card.toString()}`);
      playing.push(card);
    } else {
      remaining.push(card);
    }
  });

  this.hand = remaining;

  console.log("Hand after removal:", this.hand.map(c => c.toString()));
  return playing;
}

  // For debugging: shows hand with card indices
  toString(): string {
    return this.hand.map((card, i) => `${card.toString()} [${i}]`).join("  ");
  }
}
