import dayjs from 'dayjs';

export function formatMessageTime(date: string | number | Date) {
  const messageTime = dayjs(date);
  const now = dayjs();
  const diffMinutes = now.diff(messageTime, 'minute');

  if (diffMinutes < 1) {
    return '剛剛';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分鐘前`;
  }

  const diffHours = now.diff(messageTime, 'hour');

  if (diffHours < 24) {
    return messageTime.format('HH:mm');
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} 天前`;
}
