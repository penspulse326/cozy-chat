export enum Device {
  PC = '網站',
  MB = '行動裝置',
  APP = 'APP',
}

export enum UserStatus {
  ACTIVE = 'active',
  LEFT = 'left',
}

export enum CHAT_EVENT {
  MATCH_START = 'match:start',
  MATCH_SUCCESS = 'match:success',
  MATCH_CANCEL = 'match:cancel',
  MATCH_FAIL = 'match:fail',

  CHAT_SEND = 'chat:send',
  CHAT_RECEIVE = 'chat:receive',
  CHAT_LOAD = 'chat:load',
}
