// Represents a player's hand of cards
export class Hand {
    constructor() {
        this.hand = [];
    }
    // Adds a card to the player's hand
    addCard(card) {
        this.hand.push(card);
    }
    addCards(cards) {
        cards.forEach(card => this.addCard(card));
    }
    // Removes and returns a single card at a given index
    playCard(index) {
        return this.hand.splice(index, 1)[0];
    }
    // Removes and returns multiple cards by their indices
    playCards(indices) {
        const playing = []; // Cards being played
        const remaining = []; // Cards staying in hand
        // Split hand into cards being played and remaining cards
        this.hand.forEach((card, i) => {
            if (indices.includes(i)) {
                playing.push(card);
            }
            else {
                remaining.push(card);
            }
        });
        this.hand = remaining; // Update hand
        return playing;
    }
    // For debugging: shows hand with card indices
    toString() {
        return this.hand.map((card, i) => `${card.toString()} [${i}]`).join("  ");
    }
}
//# sourceMappingURL=Hand.js.map