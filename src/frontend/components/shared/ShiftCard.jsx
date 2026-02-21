const typeColors = {
  oh: {
    badge: 'bg-green-500 text-white',
    border: 'border-l-green-500',
    bg: 'bg-green-50',
  },
  lab: {
    badge: 'bg-orange-500 text-white',
    border: 'border-l-orange-500',
    bg: 'bg-orange-50',
  },
};

export default function ShiftCard({ date, day, startTime, endTime, type = 'oh', assignedTAs }) {
  const colors = typeColors[type] || typeColors.oh;

  return (
    <div className={`rounded-lg border-l-4 ${colors.border} ${colors.bg} p-3 shadow-sm`}>
      <div className="flex items-start gap-2">
        <span className={`text-xs font-bold px-2 py-1 rounded ${colors.badge}`}>
          {date}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {day}: {startTime} - {endTime}
          </p>
          {assignedTAs && assignedTAs.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {assignedTAs.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
