import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import ShiftCard from '../../components/shared/ShiftCard';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { getTASchedule } from '../../services/api';

function getTALabel(ta) {
  if (!ta) return '';
  if (ta.name && ta.utln) return `${ta.name} (${ta.utln})`;
  return ta.name || ta.utln || '';
}

export default function TAViewer() {
  const location = useLocation();
  const { utln, name } = useAuth();
  const { schedule, setSchedule, config, updateConfig } = useSchedule();
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
  const userProfile = useMemo(() => ({
    name: (navProfile.name || storedProfile?.name || name || '').trim(),
    utln: (navProfile.utln || storedProfile?.utln || utln || '').trim(),
  }), [navProfile.name, navProfile.utln, storedProfile?.name, storedProfile?.utln, name, utln]);

  useEffect(() => {
    if (!userProfile.name && !userProfile.utln) return;
    try {
      localStorage.setItem('ta_profile', JSON.stringify(userProfile));
    } catch {
      // localStorage may be unavailable
    }
  }, [userProfile]);

  useEffect(() => {
    async function fetchSchedule() {
      const lookupUTLN = (userProfile.utln || utln || '').trim();
      if (!lookupUTLN) {
        setSchedule([]);
        setLoading(false);
        return;
      }

      try {
        const result = await getTASchedule(lookupUTLN);
        setSchedule(result?.shifts || []);
        if (result?.config) updateConfig(result.config);
      } catch {
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [utln, setSchedule, userProfile.utln, updateConfig]);

  const { gridData, tooltipData, ohShifts, labShifts } = useMemo(() => {
    const grid = {};
    const tooltip = {};
    const oh = [];
    const lab = [];
    const slotBuckets = {};

    const isTypeVisible = (cellType) => (
      (cellType === 'my-oh' && filters.myOh)
      || (cellType === 'my-lab' && filters.myLab)
      || ((cellType === 'other-oh' || cellType === 'other-lab') && filters.other)
    );

    schedule.forEach((shift) => {
      const normalizedUserUTLN = (userProfile.utln || '').trim().toLowerCase();
      const hasMineByUTLN = normalizedUserUTLN
        ? shift.assignedTAs?.some((ta) => (ta?.utln || '').trim().toLowerCase() === normalizedUserUTLN)
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
      const cellType = isMyShift
        ? (shift.type === 'oh' ? 'my-oh' : 'my-lab')
        : (shift.type === 'oh' ? 'other-oh' : 'other-lab');

      if (!slotBuckets[key]) {
        slotBuckets[key] = {
          'my-oh': new Set(),
          'my-lab': new Set(),
          'other-oh': new Set(),
          'other-lab': new Set(),
        };
      }
      effectiveAssignedTAs
        .map(getTALabel)
        .filter(Boolean)
        .forEach((label) => slotBuckets[key][cellType].add(label));
    });

    Object.entries(slotBuckets).forEach(([key, bucket]) => {
      const displayPriority = ['my-oh', 'my-lab', 'other-oh', 'other-lab'];
      const visibleType = displayPriority.find((type) => bucket[type].size > 0 && isTypeVisible(type));
      if (!visibleType) return;
      grid[key] = visibleType;
      tooltip[key] = Array.from(bucket[visibleType]);
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
            startHour={config.earliestStart ? parseInt(config.earliestStart, 10) : 9}
            endHour={config.latestEnd === '00:00' ? 24 : parseInt(config.latestEnd || '24', 10)}
            slotMinutes={config.slotDuration || 30}
          />
        )}
      </div>
    </AppLayout>
  );
}
