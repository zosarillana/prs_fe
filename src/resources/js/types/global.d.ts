import type Pusher from "pusher-js"
import type Echo from "laravel-echo"

declare global {
  interface Window {
    Pusher: typeof Pusher // ✅ use the modern type
    Echo: Echo
  }
}
