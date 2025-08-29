import { useEffect } from 'react';
import { Socket } from 'socket.io-client';

type EventHandlers = {
  [event: string]: (...args: any[]) => void;
};

export default function useSocketEvents(
  socket: Socket | null,
  handlers: EventHandlers,
) {
  useEffect(() => {
    if (!socket) return;

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(handlers).forEach((event) => {
        socket.off(event);
      });
    };
    // By stringifying handlers, we ensure the effect re-runs if the handler functions change.
  }, [socket, JSON.stringify(handlers)]);
}