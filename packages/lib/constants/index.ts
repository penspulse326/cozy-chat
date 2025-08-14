export enum CHAT_EVENT {
  LOAD = 'chat:load',
  SEND = 'chat:send',
}

export enum DeviceMap {
  APP = 'APP',
  MB = '行動裝置',
  PC = '網站',
}

export enum MATCH_EVENT {
  CANCEL = 'match:cancel',
  FAIL = 'match:fail',
  LEAVE = 'match:leave',
  RECONNECT_FAIL = 'match:reconnect-fail',
  START = 'match:start',
  SUCCESS = 'match:success',
}
