// client.js

import { DepositStatus } from "./constants.js";
import { ZKVerseError, ZKVerseHttpError, ZKVerseNetworkError } from "./errors.js";

/**
 * @typedef {Object} ZKVerseClientOptions
 * @property {string} baseUrl Base URL of your zkVerse Engine backend.
 */

/**
 * @typedef {Object} CreateDepositParams
 * @property {number} amount Amount of SOL to deposit.
 * @property {string} recipient Solana public key of the final recipient.
 * @property {string} fromWallet Solana public key of the sender wallet.
 */

/**
 * @typedef {Object} DepositTicket
 * @property {string} id
 * @property {string} depositAddress
 * @property {number} amount
 * @property {string} recipient
 * @property {string} fromWallet
 * @property {string} status
 * @property {string} createdAt
 * @property {string} [updatedAt]
 * @property {string} [forwardTxSignature]
 */

export class ZKVerseClient {
  /**
   * @param {ZKVerseClientOptions} options
   */
  constructor(options) {
    if (!options || typeof options.baseUrl !== "string") {
      throw new ZKVerseError("ZKVerseClient requires a baseUrl option.");
    }

    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
  }

  /**
   * Internal HTTP helper.
   * @private
   */
  async _request(path, init = {}) {
    const url = `${this.baseUrl}${path}`;

    const headers = {
      "Content-Type": "application/json",
      ...(init.headers || {})
    };

    const finalInit = {
      ...init,
      headers
    };

    let res;
    try {
      res = await fetch(url, finalInit);
    } catch (err) {
      throw new ZKVerseNetworkError(
        `Network error while calling zkVerse backend: ${err}`
      );
    }

    let body = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!res.ok) {
      const message =
        (body && body.error) ||
        (typeof body === "string" ? body : `HTTP ${res.status}`);
      throw new ZKVerseHttpError(
        `zkVerse backend responded with an error: ${message}`,
        res.status,
        body
      );
    }

    return body;
  }

  /**
   * Check backend health.
   */
  async health() {
    return this._request("/health", { method: "GET" });
  }

  /**
   * Create a new deposit ticket.
   *
   * @param {CreateDepositParams} params
   * @returns {Promise<DepositTicket>}
   */
  async createDeposit(params) {
    if (!params) {
      throw new ZKVerseError("createDeposit requires params.");
    }

    const { amount, recipient, fromWallet } = params;

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      throw new ZKVerseError("createDeposit: amount must be a positive number.");
    }

    if (!recipient || typeof recipient !== "string") {
      throw new ZKVerseError("createDeposit: recipient is required.");
    }

    if (!fromWallet || typeof fromWallet !== "string") {
      throw new ZKVerseError("createDeposit: fromWallet is required.");
    }

    const payload = { amount, recipient, fromWallet };

    const res = await this._request("/api/deposits", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return /** @type {DepositTicket} */ (res);
  }

  /**
   * Fetch a deposit ticket by id.
   *
   * @param {string} id
   * @returns {Promise<DepositTicket>}
   */
  async getDeposit(id) {
    if (!id || typeof id !== "string") {
      throw new ZKVerseError("getDeposit: id is required.");
    }

    const res = await this._request(`/api/deposits/${encodeURIComponent(id)}`, {
      method: "GET"
    });

    return /** @type {DepositTicket} */ (res);
  }

  /**
   * Wait until a deposit is forwarded or timed out.
   *
   * @param {{ id: string, pollIntervalMs?: number, timeoutMs?: number }} options
   * @returns {Promise<DepositTicket>}
   */
  async waitForForwarded(options) {
    const id = options?.id;
    const pollIntervalMs =
      typeof options?.pollIntervalMs === "number"
        ? options.pollIntervalMs
        : 15000;
    const timeoutMs =
      typeof options?.timeoutMs === "number"
        ? options.timeoutMs
        : 10 * 60 * 1000;

    if (!id || typeof id !== "string") {
      throw new ZKVerseError("waitForForwarded: id is required.");
    }

    const startedAt = Date.now();

    let ticket = await this.getDeposit(id);
    if (ticket.status === DepositStatus.FORWARDED) {
      return ticket;
    }

    while (true) {
      const elapsed = Date.now() - startedAt;
      if (elapsed > timeoutMs) {
        throw new ZKVerseError(
          `waitForForwarded: timed out after ${Math.round(
            elapsed / 1000
          )} seconds.`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      ticket = await this.getDeposit(id);

      if (ticket.status === DepositStatus.FORWARDED) {
        return ticket;
      }

      if (ticket.status === DepositStatus.FAILED) {
        throw new ZKVerseError(
          "waitForForwarded: deposit is in failed state on the backend."
        );
      }
    }
  }
}
