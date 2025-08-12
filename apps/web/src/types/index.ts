export type MatchStatus =
  | 'standby'
  | 'waiting'
  | 'matched'
  | 'error'
  | 'left'
  | 'quit';

export type MatchSuccessData = {
  roomId: string;
  userId: string;
};
