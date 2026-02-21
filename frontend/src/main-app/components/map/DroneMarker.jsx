const STATUS_COLOR = {
  deployed: '#00ff99',
  standby:  '#00aabf',
  warning:  '#ff6a00',
  offline:  '#3a5a68',
};

export default function DroneMarker({ drone }) {
  const color = STATUS_COLOR[drone.status] ?? '#3a5a68';

  return (
    <div
      className={`drone-map-marker ${drone.status}`}
      title={`${drone.id} // ${drone.mission}`}
    >
      <div className="drone-map-ring" style={{ borderColor: color }} />
      <div
        className="drone-map-dot"
        style={{ background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}40` }}
      />
    </div>
  );
}
