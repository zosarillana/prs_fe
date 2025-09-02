import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Debug environment variables
console.log("Environment variables:", {
  key: import.meta.env.VITE_REVERB_APP_KEY,
  host: import.meta.env.VITE_REVERB_HOST,
  port: import.meta.env.VITE_REVERB_PORT,
  scheme: import.meta.env.VITE_REVERB_SCHEME,
});

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY || "nnweoeb3x4xpftxvnfau", // fallback for debugging
  wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
  wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
  enabledTransports: ["ws"],
  authEndpoint: "/broadcasting/auth",
  withCredentials: true,
});