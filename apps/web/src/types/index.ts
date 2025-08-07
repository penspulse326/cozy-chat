export type MatchStatus =
  | 'standby'
  | 'waiting'
  | 'matched'
  | 'error'
  | 'cancel';

export type MatchSuccessData = {
  roomId: string;
  userId: string;
};
