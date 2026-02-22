import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import ShiftCard from '../../components/shared/ShiftCard';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { getTASchedule } from '../../services/api';

function createDummyShifts(profile) {
  const myName = profile.name || 'You';
  const myUtlm = profile.utln || 'ta_demo01';
  return [
    {
      day: 'Mon',
      startTime: '09:00',
      endTime: '10:30',
      type: 'oh',
      isMine: true,
      assignedTAs: [{ name: myName, utln: myUtlm }],
    },
    {
      day: 'Mon',
      startTime: '10:30',
      endTime: '12:00',
      type: 'oh',
      isMine: true,
      assignedTAs: [{ name: myName, utln: myUtlm }],
    },
    {
      day: 'Mon',
      startTime: '12:00',
      endTime: '1:30',
      type: 'oh',
      isMine: true,
      assignedTAs: [{ name: myName, utln: myUtlm }],
    },
    {
      day: 'Tue',
      startTime: '12:00',
      endTime: '13:30',
      type: 'lab',
      isMine: true,
      assignedTAs: [{ name: myName, utln: myUtlm }],
    },
    {
      day: 'Tue',
      startTime: '13:30',
      endTime: '15:00',
      type: 'lab',
      isMine: true,
      assignedTAs: [{ name: myName, utln: myUtlm }],
    },
    {
      day: 'Wed',
      startTime: '15:00',
      endTime: '16:30',
      type: 'oh',
      assignedTAs: [{ utln: 'other01', name: 'Priya Shah' }],
    },
    {
      day: 'Thu',
      startTime: '18:00',
      endTime: '19:30',
      type: 'lab',
      assignedTAs: [{ utln: 'other02', name: 'Ethan Park' }],
    },
  ];
}

function getTALabel(ta) {
  if (!ta) return '';
  if (ta.name && ta.utln) return `${ta.name} (${ta.utln})`;
  return ta.name || ta.utln || '';
}

export default function TAViewer() {
  const location = useLocation();
  const { utln, name } = useAuth();
  const { schedule, setSchedule } = useSchedule();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    myOh: true,
    myLab: true,
    other: true,
  });
  const storedProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem('ta_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const navProfile = location.state?.taProfile || {};
  const userProfile = {
    name: (navProfile.name || storedProfile?.name || name || '').trim(),
    utln: (navProfile.utln || storedProfile?.utln || utln || '').trim(),
  };

  useEffect(() => {
    if (!userProfile.name && !userProfile.utln) return;
    try {
      localStorage.setItem('ta_profile', JSON.stringify(userProfile));
    } catch {
      // localStorage may be unavailable
    }
  }, [userProfile.name, userProfile.utln]);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const result = await getTASchedule(utln);
        if (result.shifts?.length) {
          setSchedule(result.shifts);
        } else {
          setSchedule(createDummyShifts(userProfile));
        }
      } catch {
        setSchedule(createDummyShifts(userProfile));
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [utln, setSchedule, userProfile.name, userProfile.utln]);

  const { gridData, tooltipData, ohShifts, labShifts } = useMemo(() => {
    const grid = {};
    const tooltip = {};
    const oh = [];
    const lab = [];

    schedule.forEach((shift) => {
      const hasMineByUTLN = userProfile.utln
        ? shift.assignedTAs?.some((ta) => ta.utln === userProfile.utln)
        : false;
      const isMyShift = Boolean(shift.isMine) || hasMineByUTLN;
      const effectiveAssignedTAs = (isMyShift && (!shift.assignedTAs || shift.assignedTAs.length === 0) && (userProfile.name || userProfile.utln))
        ? [{ name: userProfile.name, utln: userProfile.utln }]
        : (shift.assignedTAs || []);
      const card = {
        day: shift.day || '',
        startTime: shift.startTime || '',
        endTime: shift.endTime || '',
        type: shift.type,
        assignedTAs: [],
      };

      if (shift.type === 'oh') {
        if (isMyShift) oh.push(card);
      } else if (isMyShift) {
        lab.push(card);
      }

      const key = `${shift.day || ''}-${shift.startTime || ''}`;
      const cellType = shift.type === 'oh' ? (isMyShift ? 'my-oh' : 'other') : (isMyShift ? 'my-lab' : 'other');
      const isVisible = (cellType === 'my-oh' && filters.myOh)
        || (cellType === 'my-lab' && filters.myLab)
        || (cellType === 'other' && filters.other);

      if (isVisible) {
        grid[key] = cellType;
        tooltip[key] = effectiveAssignedTAs.map(getTALabel).filter(Boolean);
      }
    });

    return { gridData: grid, tooltipData: tooltip, ohShifts: oh, labShifts: lab };
  }, [schedule, userProfile.utln, userProfile.name, filters]);

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sidebar = (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">My Upcoming OH Shifts</h2>
        <div className="bg-white rounded-lg min-h-40 overflow-hidden">
          <div className="p-4 max-h-[30vh] overflow-y-auto">
            {ohShifts.length === 0 ? (
              <p className="text-md text-gray-500 italic text-center">No upcoming OH shifts</p>
            ) : (
              <div className="flex flex-col gap-2">
                {ohShifts.map((shift, i) => (
                  <ShiftCard key={i} {...shift} colorOverride="pink" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">My Upcoming Lab Shifts</h2>
        <div className="bg-white rounded-lg min-h-40 overflow-hidden">
          <div className="p-4 max-h-[30vh] overflow-y-auto">
            {labShifts.length === 0 ? (
              <p className="text-md text-gray-500 italic text-center">No upcoming lab shifts</p>
            ) : (
              <div className="flex flex-col gap-2">
                {labShifts.map((shift, i) => (
                  <ShiftCard key={i} {...shift} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AppLayout sidebar={sidebar}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          My TA Schedule
        </h1>

        <div className="flex items-center gap-4 mb-2">
          <button
            type="button"
            onClick={() => toggleFilter('myOh')}
            className={`py-1 px-7 rounded-xl font-semibold text-white text-lg transition ${filters.myOh ? 'bg-shift-pink' : 'bg-gray-300'}`}
          >
            My OH Shifts
          </button>
          <button
            type="button"
            onClick={() => toggleFilter('myLab')}
            className={`py-1 px-7 rounded-xl font-semibold text-white text-lg transition ${filters.myLab ? 'bg-shift-yellow' : 'bg-gray-300'}`}
          >
            My Lab Shifts
          </button>
          <button
            type="button"
            onClick={() => toggleFilter('other')}
            className={`py-1 px-7 rounded-xl font-semibold text-white text-lg transition ${filters.other ? 'bg-shift-blue' : 'bg-gray-300'}`}
          >
            Other Shifts
          </button>
        </div>
        <p className="text-lg text-gray-500 italic mb-4">Click a legend label to toggle visibility</p>

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
