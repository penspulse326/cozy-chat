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
