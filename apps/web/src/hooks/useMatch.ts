import { MessageContentData } from '@/components/MessageContent';
import { CHAT_EVENT, MATCH_EVENT } from '@packages/lib';
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { MatchStatus, MatchSuccessData } from '../types';

function useMatch() {
  const socketRef = useRef<Socket | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('standby');
  const [messages, setMessages] = useState<MessageContentData[]>([]);

  function initClient() {
    socketRef.current = io('http://localhost:8080');

    socketRef.current.on('connect', () => {
      handleMatchStart();
    });

    socketRef.current.on(MATCH_EVENT.SUCCESS, (data: MatchSuccessData) => {
      handleMatchSuccess(data);
    });

    socketRef.current.on(MATCH_EVENT.LEAVE, () => {
      setMatchStatus('left');
    });

    socketRef.current.on(CHAT_EVENT.RECEIVE, (data: MessageContentData) => {
      setMessages((prev) => [...prev, data]);
    });
  }

  function onStandby() {
    clearLocalData();
    socketRef.current?.disconnect();
    socketRef.current = null;
  }

  function handleMatchStart() {
    socketRef.current?.emit(MATCH_EVENT.START, 'PC');
  }

  function handleMatchSuccess(data: MatchSuccessData) {
    setLocalData(data);
    setMatchStatus('matched');
  }

  function onCancel() {
    socketRef.current?.emit(MATCH_EVENT.CANCEL);
    setMatchStatus('standby');
  }

  function onLeave(userId: string) {
    socketRef.current?.emit(MATCH_EVENT.LEAVE, userId);
    setMatchStatus('standby');
  }

  function onQuit() {
    const roomId = localStorage.getItem('roomId');
    const userId = localStorage.getItem('userId');

    if (!roomId || !userId) {
      onCancel();
      return;
    }

    onLeave(userId);
  }

  function onChatSend(content: string) {
    socketRef.current?.emit(CHAT_EVENT.SEND, {
      roomId: localStorage.getItem('roomId'),
      userId: localStorage.getItem('userId'),
      content,
    });
  }

  function onMatchStatusChange() {
    switch (matchStatus) {
      case 'standby':
        onStandby();
        break;
      case 'waiting':
        initClient();
        break;
      case 'quit':
        onQuit();
        break;

      default:
        break;
    }
  }

  function setLocalData(data: MatchSuccessData) {
    localStorage.setItem('roomId', data.roomId);
    localStorage.setItem('userId', data.userId);
  }

  function clearLocalData() {
    localStorage.removeItem('roomId');
    localStorage.removeItem('userId');
  }

  useEffect(() => {
    onMatchStatusChange();
  }, [matchStatus]);

  return { matchStatus, setMatchStatus, onChatSend, messages };
}

export default useMatch;
