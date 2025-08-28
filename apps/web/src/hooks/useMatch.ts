import { useLocalStorage } from '@mantine/hooks';
import { CHAT_EVENT, ChatMessage, MATCH_EVENT } from '@packages/lib';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  const onMatchSuccess = useCallback(
    (data: MatchSuccessData) => {
      setRoomId(data.roomId);
      setUserId(data.userId);
      setMatchStatus('matched');
    },
    [setRoomId, setUserId]
  );

  const mountClientEvent = useCallback(
    (client: Socket) => {
      client.on(MATCH_EVENT.SUCCESS, (data: MatchSuccessData) => {
        onMatchSuccess(data);
      });

      client.on(MATCH_EVENT.LEAVE, () => {
        setMatchStatus('left');
      });

      client.on(CHAT_EVENT.SEND, (data: ChatMessage) => {
        setMessages((prev) => [...prev, data]);
      });

      client.on(CHAT_EVENT.LOAD, (data: ChatMessage[]) => {
        setMessages(data);
      });
    },
    [onMatchSuccess, setMessages]
  );

  const emitMatchStart = useCallback(() => {
    socketRef.current?.emit(MATCH_EVENT.START, 'PC');
  }, []);

  const initClient = useCallback(() => {
    socketRef.current = io('http://localhost:8080', {
      query: {
        roomId,
      },
    });

    socketRef.current.on('connect', () => {
      if (!roomId) {
        emitMatchStart();
      } else {
        setMatchStatus('matched');
      }
    });

    mountClientEvent(socketRef.current);
  }, [roomId, emitMatchStart, mountClientEvent]);

  const handleStandby = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const emitMatchCancel = useCallback(() => {
    socketRef.current?.emit(MATCH_EVENT.CANCEL);
    setMatchStatus('standby');
  }, []);

  const emitMatchLeave = useCallback(
    (userId: string) => {
      socketRef.current?.emit(MATCH_EVENT.LEAVE, userId);
      removeUserId();
      removeRoomId();
      setMessages([]);
      setMatchStatus('standby');
    },
    [removeRoomId, removeUserId]
  );

  const handleQuit = useCallback(() => {
    if (!roomId || !userId) {
      emitMatchCancel();
      return;
    }

    emitMatchLeave(userId);
  }, [emitMatchCancel, emitMatchLeave, roomId, userId]);

  function emitChatSend(content: string) {
    socketRef.current?.emit(CHAT_EVENT.SEND, {
      roomId,
      userId,
      content,
    });
  }

  useEffect(() => {
    if (roomId && matchStatus === 'standby') {
      setMatchStatus('reloading');
    }
  }, [roomId, matchStatus]);

  useEffect(() => {
    switch (matchStatus) {
      case 'standby':
        handleStandby();
        break;
      case 'waiting':
        initClient();
        break;
      case 'reloading':
        initClient();
        break;
      case 'quit':
        handleQuit();
        break;

      default:
        break;
    }
  }, [matchStatus, handleStandby, initClient, handleQuit]);

  return { matchStatus, setMatchStatus, emitChatSend, messages };
}