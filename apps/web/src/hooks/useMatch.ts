import { useLocalStorage } from '@mantine/hooks';
import { CHAT_EVENT, ChatMessage, MATCH_EVENT } from '@packages/lib';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { MatchStatus, MatchSuccessData } from '../types';
import useSocketEvents from './useSocketEvents';

export default function useMatch() {
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('standby');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [userId, setUserId, removeUserId] = useLocalStorage<string>({
    key: 'userId',
    defaultValue: '',
  });

  const [roomId, setRoomId, removeRoomId] = useLocalStorage<string>({
    key: 'roomId',
    defaultValue: '',
  });

  const { socket, connect, disconnect } = useSocketContext();

  const onMatchSuccess = useCallback(
    (data: MatchSuccessData) => {
      setRoomId(data.roomId);
      setUserId(data.userId);
      setMatchStatus('matched');
    },
    [setRoomId, setUserId]
  );

  const onLeave = useCallback(() => {
    setMatchStatus('left');
  }, []);

  const onReceiveMessage = useCallback((data: ChatMessage) => {
    setMessages((prev) => [...prev, data]);
  }, []);

  const onLoadMessages = useCallback((data: ChatMessage[]) => {
    setMessages(data);
  }, []);

  const onConnect = useCallback(() => {
    if (!roomId) {
      socket?.emit(MATCH_EVENT.START, 'PC');
    } else {
      setMatchStatus('matched');
    }
  }, [roomId, socket]);

  const handlers = useMemo(
    () => ({
      connect: onConnect,
      [MATCH_EVENT.SUCCESS]: onMatchSuccess,
      [MATCH_EVENT.LEAVE]: onLeave,
      [CHAT_EVENT.SEND]: onReceiveMessage,
      [CHAT_EVENT.LOAD]: onLoadMessages,
    }),
    [onConnect, onLoadMessages, onLeave, onMatchSuccess, onReceiveMessage]
  );

  useSocketEvents(socket, handlers);

  const emitMatchCancel = useCallback(() => {
    // No need to emit event if not connected
    if (socket) {
      socket.emit(MATCH_EVENT.CANCEL);
    }
    setMatchStatus('standby');
  }, [socket]);

  const emitMatchLeave = useCallback(
    (userId: string) => {
      socket?.emit(MATCH_EVENT.LEAVE, userId);
      removeUserId();
      removeRoomId();
      setMessages([]);
      setMatchStatus('standby');
    },
    [socket, removeRoomId, removeUserId]
  );

  const handleQuit = useCallback(() => {
    if (!roomId || !userId) {
      emitMatchCancel();
      return;
    }
    emitMatchLeave(userId);
  }, [emitMatchCancel, emitMatchLeave, roomId, userId]);

  function emitChatSend(content: string) {
    socket?.emit(CHAT_EVENT.SEND, {
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
    if (matchStatus === 'quit') {
      handleQuit();
    }
  }, [matchStatus, handleQuit]);

  // Effect to manage connection based on status
  useEffect(() => {
    if (matchStatus === 'waiting' || matchStatus === 'reloading') {
      connect({ roomId });
    } else if (matchStatus === 'standby') {
      disconnect();
    }
  }, [matchStatus, roomId, connect, disconnect]);

  return { matchStatus, setMatchStatus, emitChatSend, messages };
}
