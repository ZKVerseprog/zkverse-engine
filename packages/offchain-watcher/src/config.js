// config.js

export const config = {
  backendBaseUrl:
    process.env.ZKVERSE_BACKEND_URL ||
    "https://your-zkverse-backend.onrender.com",
  pollIntervalMs: Number(process.env.WATCHER_POLL_INTERVAL_MS || 20000)
};
