import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import ShiftCard from '../../components/shared/ShiftCard';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { getTASchedule } from '../../services/api';

export default function TAViewer() {
  const { utln } = useAuth();
  const { schedule, setSchedule } = useSchedule();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    myOh: true,
    myLab: true,
    other: true,
  });

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const result = await getTASchedule(utln);
        if (result.shifts) {
          setSchedule(result.shifts);
        }
      } catch {
        // TODO: Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [utln, setSchedule]);

  const { gridData, tooltipData, ohShifts, labShifts } = useMemo(() => {
    const grid = {};
    const tooltip = {};
    const oh = [];
    const lab = [];

    schedule.forEach((shift) => {
      const card = {
        date: shift.date || '',
        day: shift.day || '',
        startTime: shift.startTime || '',
        endTime: shift.endTime || '',
        type: shift.type,
        assignedTAs: shift.assignedTAs?.map((ta) => ta.name) || [],
      };

      const isMyShift = shift.assignedTAs?.some((ta) => ta.utln === utln);

      if (shift.type === 'oh') {
        if (isMyShift) oh.push(card);
      } else if (isMyShift) {
        lab.push(card);
      }

      const key = `${shift.day || ''}-${shift.startTime || ''}`;
      grid[key] = shift.type === 'oh' ? (isMyShift ? 'my-oh' : 'other') : (isMyShift ? 'my-lab' : 'other');
      tooltip[key] = shift.assignedTAs?.map((ta) => ta.name) || [];
    });

    return { gridData: grid, tooltipData: tooltip, ohShifts: oh, labShifts: lab };
  }, [schedule, utln]);

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sidebar = (
    <>
      <div>
        <h2 className="text-md font-bold text-gray-900 mb-3">My Upcoming OH Shifts</h2>
        {ohShifts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No upcoming OH shifts</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ohShifts.map((shift, i) => (
              <ShiftCard key={i} {...shift} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h2 className="text-md font-bold text-gray-900 mb-3">My Upcoming Lab Shifts</h2>
        {labShifts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No upcoming lab shifts</p>
        ) : (
          <div className="flex flex-col gap-2">
            {labShifts.map((shift, i) => (
              <ShiftCard key={i} {...shift} />
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <AppLayout sidebar={sidebar}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-7">
          My TA Schedule
        </h1>

        {/* Legend */}
        <div className="flex items-center gap-7 mb-2">
          {[
            { key: 'myOh', label: 'My OH Shifts', color: 'bg-shift-pink' },
            { key: 'myLab', label: 'My Lab Shifts', color: 'bg-shift-yellow' },
            { key: 'other', label: 'Other Shifts', color: 'bg-shift-blue' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleFilter(item.key)}
              className={`flex items-center gap-1.5 transition ${
                filters[item.key] ? 'text-gray-600' : 'text-gray-400 opacity-60'
              }`}
            >
              <div className={`w-5 h-5 rounded ${filters[item.key] ? item.color : 'bg-gray-300'}`} />
              <span className="text-lg">{item.label}</span>
            </button>
          ))}
        </div>
        <p className="text-md text-gray-500 italic mb-2 mt-2">
          Click on a label above to toggle visibility on the calendar
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-mint" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <ScheduleGrid
            mode="ta-viewer"
            data={gridData}
            tooltipData={tooltipData}
            startHour={9}
            endHour={24}
            slotMinutes={90}
          />
        )}
      </div>
    </AppLayout>
  );
}
