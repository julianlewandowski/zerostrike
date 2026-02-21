// status: 'online' | 'warning' | 'critical' | 'standby' | 'offline'
export default function StatusIndicator({ status = 'online' }) {
  return <span className={`status-dot ${status}`} aria-label={status} />;
}
