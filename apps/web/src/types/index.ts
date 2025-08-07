export type MatchStatus =
  | 'standby'
  | 'waiting'
  | 'matched'
  | 'error'
  | 'cancel'
  | 'leave'
  | 'quit';

export type MatchSuccessData = {
  roomId: string;
  userId: string;
};
