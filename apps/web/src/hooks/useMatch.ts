import { useLocalStorage } from '@mantine/hooks';
import { CHAT_EVENT, ChatMessage, MATCH_EVENT } from '@packages/lib';
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { MatchStatus, MatchSuccessData } from '../types';

export default function useMatch() {
  const socketRef = useRef<Socket | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('standby');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [userId, setUserId, removeUserId] = useLocalStorage<string | null>({
    key: 'userId',
    defaultValue: null,
  });

  const [roomId, setRoomId, removeRoomId] = useLocalStorage<string | null>({
    key: 'roomId',
    defaultValue: null,
  });

  function connectSocket() {
    socketRef.current = io('http://localhost:8080', {
      query: {
        roomId,
      },
    });

    socketRef.current.on('connect', () => {
      if (!roomId) {
        startMatch();
      } else {
        setMatchStatus('matched');
      }
    });

    setupSocketEvents(socketRef.current);
  }

  function disconnectSocket() {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }

  function setupSocketEvents(client: Socket) {
    client.on(MATCH_EVENT.SUCCESS, handleMatchSuccess);
    client.on(MATCH_EVENT.LEAVE, handleMatchLeave);
    client.on(CHAT_EVENT.SEND, handleMessageReceive);
    client.on(CHAT_EVENT.LOAD, handleMessagesLoad);
  }

  function quitMatch() {
    if (!roomId || !userId) {
      cancelMatch();
      return;
    }

    leaveMatch(userId);
  }

  function handleMatchSuccess(data: MatchSuccessData) {
    setRoomId(data.roomId);
    setUserId(data.userId);
    setMatchStatus('matched');
  }

  function handleMatchLeave() {
    setMatchStatus('left');
  }

  function handleMessageReceive(data: ChatMessage) {
    setMessages((prev) => [...prev, data]);
  }

  function handleMessagesLoad(data: ChatMessage[]) {
    setMessages(data);
  }

  function startMatch() {
    socketRef.current?.emit(MATCH_EVENT.START, 'PC');
  }

  function cancelMatch() {
    socketRef.current?.emit(MATCH_EVENT.CANCEL);
    setMatchStatus('standby');
  }

  function leaveMatch(userId: string) {
    socketRef.current?.emit(MATCH_EVENT.LEAVE, userId);
    removeUserId();
    removeRoomId();
    setMessages([]);
    setMatchStatus('standby');
  }

  function sendMessage(content: string) {
    socketRef.current?.emit(CHAT_EVENT.SEND, {
      roomId,
      userId,
      content,
    });
  }

  // 載入頁面後，如果 roomId 存在，則設置為 reloading 狀態
  useEffect(() => {
    if (roomId && matchStatus === 'standby') {
      setMatchStatus('reloading');
    }
  }, [roomId]);

  useEffect(() => {
    switch (matchStatus) {
      case 'standby':
        disconnectSocket();
        break;
      case 'waiting':
        connectSocket();
        break;
      case 'reloading':
        connectSocket();
        break;
      case 'quit':
        quitMatch();
        break;
      default:
        break;
    }
  }, [matchStatus]);

  return { matchStatus, setMatchStatus, sendMessage, messages };
}
