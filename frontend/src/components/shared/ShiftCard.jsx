const typeColors = {
  oh: {
    border: 'border-shift-blue',
    bg: 'bg-shift-blue-light',
  },
  lab: {
    border: 'border-shift-yellow',
    bg: 'bg-shift-yellow-light',
  },
};

const colorOverrides = {
  pink: {
    border: 'border-shift-pink',
    bg: 'bg-shift-pink/20',
  },
};

export default function ShiftCard({ day, startTime, endTime, type = 'oh', assignedTAs, colorOverride }) {
  const colors = (colorOverride && colorOverrides[colorOverride]) || typeColors[type] || typeColors.oh;

  return (
    <div className={`rounded-lg border-l-4 ${colors.border} ${colors.bg} p-3 shadow-sm`}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-lg font-medium text-gray-900">
            {day}: {startTime} - {endTime}
          </p>
          {assignedTAs && assignedTAs.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {assignedTAs.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
