import { MessageContentData } from '@/components/MessageContent';
import { CHAT_EVENT, MATCH_EVENT } from '@packages/lib';
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { MatchStatus, MatchSuccessData } from '../types';

export default function useMatch() {
  const socketRef = useRef<Socket | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('standby');
  const [messages, setMessages] = useState<MessageContentData[]>([]);

  function initClient() {
    socketRef.current = io('http://localhost:8080');

    socketRef.current.on('connect', () => {
      emitMatchStart();
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

  function handleStandby() {
    clearLocalData();
    socketRef.current?.disconnect();
    socketRef.current = null;
  }

  function handleMatchSuccess(data: MatchSuccessData) {
    setLocalData(data);
    setMatchStatus('matched');
  }

  function handleQuit() {
    const roomId = localStorage.getItem('roomId');
    const userId = localStorage.getItem('userId');

    if (!roomId || !userId) {
      emitMatchCancel();
      return;
    }

    emitMatchLeave(userId);
  }

  function emitMatchStart() {
    socketRef.current?.emit(MATCH_EVENT.START, 'PC');
  }

  function emitMatchCancel() {
    socketRef.current?.emit(MATCH_EVENT.CANCEL);
    setMatchStatus('standby');
  }

  function emitMatchLeave(userId: string) {
    socketRef.current?.emit(MATCH_EVENT.LEAVE, userId);
    setMatchStatus('standby');
  }



  function emitChatSend(content: string) {
    socketRef.current?.emit(CHAT_EVENT.SEND, {
      roomId: localStorage.getItem('roomId'),
      userId: localStorage.getItem('userId'),
      content,
    });
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
    switch (matchStatus) {
      case 'standby':
        handleStandby();
        break;
      case 'waiting':
        initClient();
        break;
      case 'quit':
        handleQuit();
        break;

      default:
        break;
    }
  }, [matchStatus]);

  return { matchStatus, setMatchStatus, emitChatSend, messages };
}