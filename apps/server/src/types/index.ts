export const CHAT_EVENT = {
  CHAT_LOAD: 'chat:load',
  CHAT_RECEIVE: 'chat:receive',
  CHAT_SEND: 'chat:send',

  MATCH_CANCEL: 'match:cancel',
  MATCH_FAIL: 'match:fail',
  MATCH_START: 'match:start',
  MATCH_SUCCESS: 'match:success',
};

export type ChatMessage = {
  message: string;
  roomId: string;
};
