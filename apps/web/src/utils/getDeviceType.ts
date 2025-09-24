export function getDeviceType() {
  const isMobile = window.matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

  return isMobile ? 'MB' : 'PC';
}