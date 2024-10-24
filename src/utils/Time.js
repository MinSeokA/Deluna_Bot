function formatMS_HHMMSS(ms) {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(secs).padStart(2, '0')
  ]
  .filter(Boolean) // null or undefined인 값을 제거
  .join(':');
}
module.exports = { formatMS_HHMMSS };