import { useLocalStorage } from '@mantine/hooks';
import { CHAT_EVENT, ChatMessage, MATCH_EVENT } from '@packages/lib';
import { useEffect, useState } from 'react';
import { MatchStatus, MatchSuccessData } from '../types';
import useSocket from './useSocket';

export default function useMatch() {
  const socket = useSocket();
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

  // Event handlers
  function handleMatchSuccess(data: unknown) {
    const matchData = data as MatchSuccessData;
    setRoomId(matchData.roomId);
    setUserId(matchData.userId);
    setMatchStatus('matched');
  }

  function handleMatchLeave() {
    setMatchStatus('left');
  }

  function handleMessageReceive(data: unknown) {
    const message = data as ChatMessage;
    setMessages((prev) => [...prev, message]);
  }

  function handleMessagesLoad(data: unknown) {
    const messageList = data as ChatMessage[];
    setMessages(messageList);
  }

  // Socket actions
  function startMatch() {
    socket.emit(MATCH_EVENT.START, 'PC');
  }

  function cancelMatch() {
    socket.emit(MATCH_EVENT.CANCEL);
    setMatchStatus('standby');
  }

  function leaveMatch(userId: string) {
    socket.emit(MATCH_EVENT.LEAVE, userId);
    removeUserId();
    removeRoomId();
    setMessages([]);
    setMatchStatus('standby');
  }

  function quitMatch() {
    if (!roomId || !userId) {
      cancelMatch();
      return;
    }

    leaveMatch(userId);
  }

  function sendMessage(content: string) {
    socket.emit(CHAT_EVENT.SEND, {
      roomId,
      userId,
      content,
    });
  }

  // Socket management
  function setupSocketEvents() {
    socket.on(MATCH_EVENT.SUCCESS, handleMatchSuccess);
    socket.on(MATCH_EVENT.LEAVE, handleMatchLeave);
    socket.on(CHAT_EVENT.SEND, handleMessageReceive);
    socket.on(CHAT_EVENT.LOAD, handleMessagesLoad);
  }

  function connectSocket() {
    socket.connect({
      url: 'http://localhost:8080',
      query: {
        roomId,
      },
    });

    socket.on('connect', () => {
      if (!roomId) {
        startMatch();
      } else {
        setMatchStatus('matched');
      }
    });

    setupSocketEvents();
  }

  function disconnectSocket() {
    socket.disconnect();
  }

  // Effects
  // 載入頁面後，如果 roomId 存在，則設置為 reloading 狀態
  useEffect(() => {
    if (roomId && matchStatus === 'standby') {
      setMatchStatus('reloading');
    }
  }, [roomId, matchStatus]);

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