// lib/csrf.ts
import api from "./api";

let csrfPromise: Promise<void> | null = null;

export async function initCsrf() {
  if (!csrfPromise) {
    csrfPromise = api.get("/sanctum/csrf-cookie").then(() => {
      console.log("✅ CSRF initialized");
    }).catch((err) => {
      csrfPromise = null; // allow retry
      throw err;
    });
  }
  return csrfPromise;
}
