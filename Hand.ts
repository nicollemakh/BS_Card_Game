import { Card } from "./Card.js";

// Represents a player's hand of cards
export class Hand {
  hand: Card[] = [];

  // Adds a card to the player's hand
  addCard(card: Card): void {
    this.hand.push(card);
  }

  // Removes and returns a single card at a given index
  playCard(index: number): Card {
    return this.hand.splice(index, 1)[0];
  }

  // Removes and returns multiple cards by their indices
  playCards(indices: number[]): Card[] {
    const playing: Card[] = [];   // Cards being played
    const remaining: Card[] = []; // Cards staying in hand

    // Split hand into cards being played and remaining cards
    this.hand.forEach((card, i) => {
      if (indices.includes(i)) {
        playing.push(card);
      } else {
        remaining.push(card);
      }
    });

    this.hand = remaining; // Update hand
    return playing;
  }

  // For debugging: shows hand with card indices
  toString(): string {
    return this.hand.map((card, i) => `${card.toString()} [${i}]`).join("  ");
  }
}
