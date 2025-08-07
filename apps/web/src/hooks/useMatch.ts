import { MATCH_EVENT } from '@packages/lib';
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { MatchStatus } from '../types';

function useMatch() {
  const socketRef = useRef<Socket | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('standby');

  function connect() {
    socketRef.current = io('http://localhost:8080');

    socketRef.current.on('connect', () => {
      handleMatchStart();
    });
  }

  function handleMatchStart() {
    socketRef.current?.emit(MATCH_EVENT.START, 'PC');
  }

  function onMatchStatusChange() {
    switch (matchStatus) {
      case 'waiting':
        connect();
        break;

      default:
        break;
    }
  }

  useEffect(() => {
    onMatchStatusChange();
  }, [matchStatus]);

  return { matchStatus, setMatchStatus };
}

export default useMatch;
