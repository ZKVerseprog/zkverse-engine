// index.js

export { ZKVerseClient } from "./client.js";
export { DepositStatus } from "./constants.js";
export {
  ZKVerseError,
  ZKVerseHttpError,
  ZKVerseNetworkError
} from "./errors.js";

/**
 * Convenience factory.
 */
export function createZKVerseClient(options) {
  return new (require("./client.js").ZKVerseClient)(options);
}
