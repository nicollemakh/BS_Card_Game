import { CARD_VALUES, SUIT_SYMBOLS } from "./constants.js";
// Represents a single playing card
export class Card {
    constructor(num) {
        this.num = num;
        this.amount = num % 13;
        this.value = CARD_VALUES[this.amount]; // Map to card face
        this.suit = Math.floor(num / 13); // Determine suit
        this.symbol = SUIT_SYMBOLS[this.suit]; // Map to symbol
        this.color = this.suit < 2 ? "red" : "black"; // Red: ♠♦, Black: ♣♠
        this.fullCard = `${this.value}${this.symbol}`;
    }
    // Returns a new identical card
    copy() {
        return new Card(this.num);
    }
    // For display in logs or UI
    toString() {
        return this.fullCard;
    }
}
//# sourceMappingURL=Card.js.map