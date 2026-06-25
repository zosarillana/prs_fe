import { useEffect } from "react";
import { authService } from "@/features/auth/authService";

export default function useIdleLogout(timeout = 60 * 60 * 1000) {
  // 10 mins
  useEffect(() => {
    let timer: number;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = window.setTimeout(async () => {
        await authService.logout();
      }, timeout);
    };

    // Listen for user activity
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      clearTimeout(timer);
    };
  }, [timeout]);
}
