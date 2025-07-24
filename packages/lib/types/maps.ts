export enum CHAT_EVENT {
  CHAT_LOAD = 'chat:load',
  CHAT_RECEIVE = 'chat:receive',
  CHAT_SEND = 'chat:send',
  MATCH_CANCEL = 'match:cancel',

  MATCH_FAIL = 'match:fail',
  MATCH_START = 'match:start',
  MATCH_SUCCESS = 'match:success',
}

export enum Device {
  APP = 'APP',
  MB = '行動裝置',
  PC = '網站',
}

export enum UserStatus {
  ACTIVE = 'active',
  LEFT = 'left',
}
