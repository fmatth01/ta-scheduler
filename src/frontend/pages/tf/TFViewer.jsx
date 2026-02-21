import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/shared/Button';
import RoleToggle from '../../components/shared/RoleToggle';
import ShiftCard from '../../components/shared/ShiftCard';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useSchedule } from '../../contexts/ScheduleContext';
import { getTFSchedule, copyScheduleAsText } from '../../services/api';

export default function TFViewer() {
  const navigate = useNavigate();
  const { schedule, setSchedule } = useSchedule();
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('Office Hours');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const result = await getTFSchedule();
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
  }, [setSchedule]);

  // Derive grid data and shift cards from schedule
  const gridData = {};
  const tooltipData = {};
  const ohShifts = [];
  const labShifts = [];

  schedule.forEach((shift) => {
    const card = {
      date: shift.date || '',
      day: shift.day || '',
      startTime: shift.startTime || '',
      endTime: shift.endTime || '',
      type: shift.type,
      assignedTAs: shift.assignedTAs?.map((ta) => ta.name) || [],
    };

    if (shift.type === 'oh') {
      ohShifts.push(card);
    } else {
      labShifts.push(card);
    }

    // TODO: Populate gridData and tooltipData from shift time ranges
  });

  const handleCopy = async () => {
    try {
      await copyScheduleAsText(schedule);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may fail
    }
  };

  const sidebar = (
    <>
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Upcoming OH Shifts</h2>
        {ohShifts.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No upcoming OH shifts</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ohShifts.map((shift, i) => (
              <ShiftCard key={i} {...shift} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Upcoming Lab Shifts</h2>
        {labShifts.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No upcoming lab shifts</p>
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            TA Schedule
          </h1>
          {/* TA avatars placeholder */}
          <div className="flex -space-x-2">
            {['A', 'B', 'C'].map((letter, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <RoleToggle
            options={['Office Hours', 'Lab Shifts']}
            value={filterMode}
            onChange={setFilterMode}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-mint" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <ScheduleGrid
            mode="tf-viewer"
            data={gridData}
            tooltipData={tooltipData}
          />
        )}

        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy as Text'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/config')}>
            Configure
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
