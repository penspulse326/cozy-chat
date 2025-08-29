'use client';

import { createContext, useContext, useRef, useState, ReactNode, useCallback } from 'react';
import { Socket, io } from 'socket.io-client';

interface ISocketContext {
  socket: Socket | null;
  connect: (query: { [key: string]: string | null }) => void;
  disconnect: () => void;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const connect = useCallback((query: { [key: string]: string | null }) => {
    if (socketRef.current) {
      return;
    }

    const newSocket = io('http://localhost:8080', { query });
    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
