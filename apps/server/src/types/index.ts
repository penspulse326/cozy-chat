export const CHAT_EVENT = {
  MATCH_START: 'match:start',
  MATCH_SUCCESS: 'match:success',
  MATCH_CANCEL: 'match:cancel',
  MATCH_FAIL: 'match:fail',

  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
};

export type ChatMessage = {
  message: string;
  roomId: string;
};
