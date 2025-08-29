import { useEffect, useMemo, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

type SocketOptions = Parameters<typeof io>[1];

export default function useSocket(
  uri: string,
  opts: SocketOptions,
  enabled: boolean = true,
) {
  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(
    null,
  );

  // useMemo with JSON.stringify is a common way to deep-compare objects in dependency arrays.
  const memoizedOpts = useMemo(() => opts, [JSON.stringify(opts)]);

  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(uri, memoizedOpts);
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [uri, memoizedOpts, enabled]);

  return socketRef.current;
}