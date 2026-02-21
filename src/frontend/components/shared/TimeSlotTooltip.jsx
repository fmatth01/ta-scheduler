export default function TimeSlotTooltip({ day, time, names = [], position }) {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)',
      }}
    >
      <p className="font-medium">{day} {time}</p>
      {names.length > 0 ? (
        <ul className="mt-1">
          {names.map((name, i) => (
            <li key={i} className="text-gray-300">{name}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 mt-1">No assignments</p>
      )}
    </div>
  );
}
