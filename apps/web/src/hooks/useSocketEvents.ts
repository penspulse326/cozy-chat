import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

type EventHandlers = {
  [event: string]: (...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default function useSocketEvents(
  socket: Socket | null,
  handlers: EventHandlers,
) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!socket) return;

    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(handlersRef.current).forEach((event) => {
        socket.off(event);
      });
    };
    // By stringifying handlers, we ensure the effect re-runs if the handler functions change.
  }, [socket]);
}