// index.js

import { ZKVerseClient } from "@zkverse/engine-sdk";
import { ZKNote } from "@zkverse/core";
import { config } from "./config.js";

const client = new ZKVerseClient({
  baseUrl: config.backendBaseUrl
});

/**
 * Example hook where you could store zk notes, analytics, etc.
 * Right now it only logs to the console.
 */
function onDepositForwarded(ticket) {
  const note = new ZKNote({
    depositId: ticket.id,
    fromWallet: ticket.fromWallet,
    recipient: ticket.recipient,
    amount: ticket.amount
  });

  console.log("[offchain-watcher] Deposit forwarded:", {
    id: ticket.id,
    recipient: ticket.recipient,
    amount: ticket.amount,
    forwardTxSignature: ticket.forwardTxSignature || null,
    noteSummary: note.summary()
  });
}

/**
 * Very simple loop that lists deposits by id provided through environment
 * variable or uses a fixed list. In a real deployment this could be hooked
 * to your database or queue.
 */
async function pollSingleDeposit(id) {
  try {
    const ticket = await client.getDeposit(id);
    if (ticket.status === "forwarded") {
      onDepositForwarded(ticket);
    } else {
      console.log(
        `[offchain-watcher] Deposit ${id} still in status: ${ticket.status}`
      );
    }
  } catch (err) {
    console.error(
      `[offchain-watcher] Failed to fetch deposit ${id}:`,
      err.message || err
    );
  }
}

async function main() {
  const idsRaw = process.env.ZKVERSE_DEPOSIT_IDS || "";
  const ids = idsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    console.log(
      "[offchain-watcher] No deposit ids configured via ZKVERSE_DEPOSIT_IDS. Nothing to poll."
    );
  } else {
    console.log(
      "[offchain-watcher] Starting watcher for deposit ids:",
      ids.join(", ")
    );
  }

  setInterval(() => {
    ids.forEach((id) => pollSingleDeposit(id));
  }, config.pollIntervalMs);
}

main().catch((err) => {
  console.error("[offchain-watcher] Fatal error:", err);
  process.exit(1);
});
