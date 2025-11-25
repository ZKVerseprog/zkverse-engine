// errors.js

/**
 * Base error for zkVerse SDK.
 */
export class ZKVerseError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ZKVerseError";
    if (options.status != null) {
      this.status = options.status;
    }
    if (options.body != null) {
      this.body = options.body;
    }
  }
}

/**
 * Error for HTTP-related failures.
 */
export class ZKVerseHttpError extends ZKVerseError {
  constructor(message, status, body) {
    super(message, { status, body });
    this.name = "ZKVerseHttpError";
  }
}

/**
 * Error for network failures (no response).
 */
export class ZKVerseNetworkError extends ZKVerseError {
  constructor(message) {
    super(message);
    this.name = "ZKVerseNetworkError";
  }
}
