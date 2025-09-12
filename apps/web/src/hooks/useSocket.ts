import { useRef } from 'react';
import { Socket, io } from 'socket.io-client';

interface UseSocketOptions {
  url: string;
  query?: Record<string, unknown>;
}

export interface SocketInstance {
  connect: (options?: UseSocketOptions) => void;
  disconnect: () => void;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, handler: (data: unknown) => void) => void;
  isConnected: () => boolean;
}

export default function useSocket(): SocketInstance {
  const socketRef = useRef<Socket | null>(null);

  function connect(options?: UseSocketOptions) {
    if (!options) return;

    socketRef.current = io(options.url, {
      query: options.query || {},
    });
  }

  function disconnect() {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }

  function emit(event: string, data?: unknown) {
    socketRef.current?.emit(event, data);
  }

  function on(event: string, handler: (data: unknown) => void) {
    socketRef.current?.on(event, handler);
  }

  function isConnected() {
    return socketRef.current?.connected ?? false;
  }

  return {
    connect,
    disconnect,
    emit,
    on,
    isConnected,
  };
}
