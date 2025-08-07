import { MATCH_EVENT } from '@packages/lib';
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { MatchStatus, MatchSuccessData } from '../types';

function useMatch() {
  const socketRef = useRef<Socket | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('standby');

  function initSocketClient() {
    socketRef.current = io('http://localhost:8080');

    socketRef.current.on('connect', () => {
      handleMatchStart();
    });

    socketRef.current.on(MATCH_EVENT.SUCCESS, (data: MatchSuccessData) => {
      handleMatchSuccess(data);
    });
  }

  function handleMatchStart() {
    socketRef.current?.emit(MATCH_EVENT.START, 'PC');
  }

  function handleMatchSuccess(data: MatchSuccessData) {
    localStorage.setItem('roomId', data.roomId);
    localStorage.setItem('userId', data.userId);
    setMatchStatus('matched');
  }

  function onMatchStatusChange() {
    switch (matchStatus) {
      case 'waiting':
        initSocketClient();
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
