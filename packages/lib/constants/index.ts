export enum CHAT_EVENT {
  LOAD = 'chat:load',
  READ = 'chat:read',
  SEND = 'chat:send',
}

export enum MATCH_EVENT {
  CANCEL = 'match:cancel',
  FAIL = 'match:fail',
  LEAVE = 'match:leave',
  RECONNECT_FAIL = 'match:reconnect-fail',
  START = 'match:start',
  SUCCESS = 'match:success',
}
