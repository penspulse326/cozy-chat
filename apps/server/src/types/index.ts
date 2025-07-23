export const CHAT_EVENT = {
  MATCH_START: 'match:start',
  MATCH_SUCCESS: 'match:success',
  MATCH_CANCEL: 'match:cancel',
  MATCH_FAIL: 'match:fail',

  CHAT_SEND: 'chat:send',
  CHAT_RECEIVE: 'chat:receive',
  CHAT_LOAD: 'chat:load',
};

export type ChatMessage = {
  message: string;
  roomId: string;
};
