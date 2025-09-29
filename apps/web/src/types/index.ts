export type MatchStatus =
  | 'standby'
  | 'waiting'
  | 'matched'
  | 'error'
  | 'left'
  | 'quit'
  | 'reloading';

export type MatchSuccessData = {
  roomId: string;
  userId: string;
};

export enum DeviceNameMap {
  APP = 'APP',
  MB = '行動裝置',
  PC = '網站',
}

export type Trend = {
  content: string;
};
