import { MATCH_EVENT } from '@packages/lib';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { MatchingStatus } from '../types';

function useMatch() {
  const socketRef = useRef<Socket | null>(null);
  const [matchingStatus, setMatchingStatus] =
    useState<MatchingStatus>('standby');

  function matchSwitch() {
    switch (matchingStatus) {
      case 'waiting':
        connect();
        break;

      default:
        break;
    }
  }

  function connect() {
    socketRef.current = io('http://localhost:8080');

    socketRef.current.on('connect', () => {
      handleMatchStart();
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setMatchingStatus('error');
    });
  }

  function handleMatchStart() {
    socketRef.current?.emit(MATCH_EVENT.START, 'PC');
  }

  useEffect(() => {
    matchSwitch();
  }, [matchingStatus]);

  return { matchingStatus, setMatchingStatus };
}

export default useMatch;
