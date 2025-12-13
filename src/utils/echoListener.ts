// utils/echoListener.ts
export function registerListeners(channels: any[], eventName: string, handler: any) {
  channels.forEach(ch => ch.listen(eventName, handler));

  return () => {
    channels.forEach(ch => ch.stopListening(eventName));
  };
}
