// notes.js

import crypto from "crypto";

/**
 * Represents a zkVerse note in an abstract way.
 *
 * NOTE:
 * This is not a real zk-SNARK note implementation. It is an off-chain
 * representation designed to be extended later with actual commitments.
 */

export class ZKNote {
  /**
   * @param {Object} params
   * @param {string} params.depositId
   * @param {string} params.fromWallet
   * @param {string} params.recipient
   * @param {number} params.amount
   */
  constructor(params) {
    this.depositId = params.depositId;
    this.fromWallet = params.fromWallet;
    this.recipient = params.recipient;
    this.amount = params.amount;
    this.createdAt = new Date().toISOString();

    // pseudo-random note secret and nullifier
    this.secret = crypto.randomBytes(32).toString("hex");
    this.nullifier = crypto
      .createHash("sha256")
      .update(`${this.depositId}:${this.secret}`)
      .digest("hex");
  }

  /**
   * Return a human-readable summary of the note.
   */
  summary() {
    return {
      depositId: this.depositId,
      fromWallet: this.fromWallet,
      recipient: this.recipient,
      amount: this.amount,
      createdAt: this.createdAt,
      nullifierPreview: this.nullifier.slice(0, 12) + "..."
    };
  }
}
