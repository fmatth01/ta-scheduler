import { useState, useRef, useCallback } from 'react';
import TimeSlotTooltip from './TimeSlotTooltip';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function generateTimeSlots(startHour, endHour, slotMinutes) {
  const slots = [];
  let hour = startHour;
  let minute = 0;

  while (hour < endHour || (hour === endHour && minute === 0)) {
    if (hour === 24) break;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    slots.push(timeStr);
    minute += slotMinutes;
    if (minute >= 60) {
      hour += Math.floor(minute / 60);
      minute = minute % 60;
    }
  }
  return slots;
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getCellColor(mode, cellValue) {
  if (!cellValue) return '';

  switch (mode) {
    case 'builder':
      return cellValue === 'preferred' ? 'bg-preferred/70' : 'bg-general/70';
    case 'ta-viewer':
      if (cellValue === 'my-oh') return 'bg-oh-shift/70';
      if (cellValue === 'my-lab') return 'bg-lab-shift/70';
      if (cellValue === 'other') return 'bg-other-shift/50';
      return '';
    case 'tf-config':
      return cellValue === 'oh' ? 'bg-oh-shift/70' : 'bg-lab-shift/70';
    case 'tf-viewer':
      return cellValue === 'oh' ? 'bg-oh-shift/50' : 'bg-lab-shift/50';
    default:
      return '';
  }
}

function getHoverColorClass(mode, cellValue, isEditable) {
  if (!isEditable) return '';
  if (!cellValue) return 'hover:bg-gray-100';

  if (mode === 'tf-config') {
    return cellValue === 'oh' ? 'hover:bg-oh-shift' : 'hover:bg-lab-shift';
  }

  return 'hover:bg-gray-100';
}

export default function ScheduleGrid({
  mode = 'builder',
  data = {},
  onCellClick,
  startHour = 9,
  endHour = 24,
  slotMinutes = 30,
  tooltipData = {},
}) {
  const [hoverCell, setHoverCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const isDragging = useRef(false);
  const dragType = useRef(null);

  const timeSlots = generateTimeSlots(startHour, endHour, slotMinutes);
  const isEditable = mode === 'builder' || mode === 'tf-config';

  const handleMouseDown = useCallback((day, time) => {
    if (!isEditable || !onCellClick) return;
    isDragging.current = true;
    const key = `${day}-${time}`;
    const currentValue = data[key];
    dragType.current = currentValue ? null : 'paint';
    onCellClick(day, time);
  }, [isEditable, onCellClick, data]);

  const handleMouseEnter = useCallback((day, time, e) => {
    if (isDragging.current && isEditable && onCellClick) {
      onCellClick(day, time);
    }

    if (!isEditable) {
      const key = `${day}-${time}`;
      const names = tooltipData[key] || [];
      if (data[key]) {
        setHoverCell({ day, time });
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }
    }
  }, [isEditable, onCellClick, tooltipData, data]);

  const handleMouseLeave = useCallback(() => {
    setHoverCell(null);
    setTooltipPos(null);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    dragType.current = null;
  }, []);

  return (
    <div className="relative select-none" onMouseUp={handleMouseUp} onMouseLeave={() => { isDragging.current = false; }}>
      <div className="overflow-auto h-[70vh] border border-gray-200 rounded-lg">
        <table className="w-full border-collapse h-[70vh]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50">
              <th className="w-20 p-2 text-xs font-medium text-gray-500 border-b border-r border-gray-200 bg-gray-50">
                Time
              </th>
              {DAYS.map((day) => (
                <th key={day} className="p-2 text-xs font-medium text-gray-700 border-b border-r border-gray-200 bg-gray-50 min-w-[100px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, rowIdx) => (
              <tr key={time}>
                <td className="p-1 content-baseline text-xs text-gray-500 border-r border-b border-gray-200 text-right pr-2 bg-gray-50 whitespace-nowrap">
                  {formatTime(time)}
                </td>
                {DAYS.map((day) => {
                  const key = `${day}-${time}`;
                  const cellValue = data[key];
                  const colorClass = getCellColor(mode, cellValue);
                  const hoverClass = getHoverColorClass(mode, cellValue, isEditable);

                  return (
                    <td
                      key={key}
                      className={`
                        border-r border-b border-gray-200 h-6 transition-colors
                        ${colorClass}
                        ${hoverClass}
                        ${isEditable ? 'cursor-pointer' : ''}
                        ${!isEditable && cellValue ? 'cursor-default' : ''}
                      `}
                      onMouseDown={() => handleMouseDown(day, time)}
                      onMouseEnter={(e) => handleMouseEnter(day, time, e)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={(e) => {
                        if (hoverCell?.day === day && hoverCell?.time === time) {
                          setTooltipPos({ x: e.clientX, y: e.clientY });
                        }
                      }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoverCell && tooltipPos && (
        <TimeSlotTooltip
          day={hoverCell.day}
          time={formatTime(hoverCell.time)}
          names={tooltipData[`${hoverCell.day}-${hoverCell.time}`] || []}
          position={tooltipPos}
        />
      )}
    </div>
  );
}
