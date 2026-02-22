import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/shared/Button';
import ShiftCard from '../../components/shared/ShiftCard';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useSchedule } from '../../contexts/ScheduleContext';
import { getTFSchedule, copyScheduleAsText } from '../../services/api';

export default function TFViewer() {
  const navigate = useNavigate();
  const { schedule, setSchedule, config } = useSchedule();
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

  // Placeholder shifts for empty state
  if (ohShifts.length === 0) {
    ohShifts.push(
      {
        day: 'Mon',
        startTime: '10:00',
        endTime: '12:00',
        type: 'oh',
        assignedTAs: ['alice01', 'bobby02'],
      },
      {
        day: 'Mon',
        startTime: '10:00',
        endTime: '12:00',
        type: 'oh',
        assignedTAs: ['alice01', 'bobby02'],
      },
      {
        day: 'Mon',
        startTime: '10:00',
        endTime: '12:00',
        type: 'oh',
        assignedTAs: ['alice01', 'bobby02'],
      },
      {
        day: 'Mon',
        startTime: '10:00',
        endTime: '12:00',
        type: 'oh',
        assignedTAs: ['alice01', 'bobby02'],
      },
      {
        day: 'Mon',
        startTime: '10:00',
        endTime: '12:00',
        type: 'oh',
        assignedTAs: ['alice01', 'bobby02'],
      },
      {
        day: 'Mon',
        startTime: '10:00',
        endTime: '12:00',
        type: 'oh',
        assignedTAs: ['alice01', 'bobby02'],
      },
      {
        day: 'Tue',
        startTime: '14:00',
        endTime: '16:00',
        type: 'oh',
        assignedTAs: ['bobbert01'],
      }
    );
  }

  if (labShifts.length === 0) {
    labShifts.push(
      {
        day: 'Wed',
        startTime: '11:00',
        endTime: '13:00',
        type: 'lab',
        assignedTAs: ['blah12', 'wilson23'],
      },
      {
        day: 'Wed',
        startTime: '11:00',
        endTime: '13:00',
        type: 'lab',
        assignedTAs: ['blah12', 'wilson23'],
      },
      {
        day: 'Wed',
        startTime: '11:00',
        endTime: '13:00',
        type: 'lab',
        assignedTAs: ['blah12', 'wilson23'],
      },
      {
        day: 'Wed',
        startTime: '11:00',
        endTime: '13:00',
        type: 'lab',
        assignedTAs: ['blah12', 'wilson23'],
      },
      {
        day: 'Wed',
        startTime: '11:00',
        endTime: '13:00',
        type: 'lab',
        assignedTAs: ['blah12', 'wilson23'],
      },
      {
        day: 'Wed',
        startTime: '11:00',
        endTime: '13:00',
        type: 'lab',
        assignedTAs: ['blah12', 'wilson23'],
      },
      {
        day: 'Wed',
        startTime: '11:00',
        endTime: '13:00',
        type: 'lab',
        assignedTAs: ['blah12', 'wilson23'],
      },
      {
        day: 'Thu',
        startTime: '15:00',
        endTime: '17:00',
        type: 'lab',
        assignedTAs: ['punch12'],
      }
    );
  }

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
        <h2 className="text-xl font-bold text-gray-900 mb-3">Upcoming OH Shifts</h2>
        <div className="bg-white rounded-lg min-h-40 overflow-hidden">
          <div className="p-4 max-h-[30vh] overflow-y-auto">
            {ohShifts.length === 0 ? (
              <p className="text-md text-gray-500 italic text-center">No upcoming OH shifts</p>
            ) : (
              <div className="flex flex-col gap-2">
                {ohShifts.map((shift, i) => (
                  <ShiftCard key={i} {...shift} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Upcoming Lab Shifts</h2>
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
          TA Schedule Viewer
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="bg-shift-blue py-1 px-7 rounded-xl font-semibold text-white text-lg">
            Office Hours
          </div>
          <div className="bg-shift-yellow py-1 px-7 rounded-xl font-semibold text-white text-lg">
            Lab Shifts
          </div>
          <div className="bg-red-500 py-1 px-7 rounded-xl font-semibold text-white text-lg">
            No Availability
          </div>
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
            startHour={config.earliestStart ? parseInt(config.earliestStart) : 9}
            endHour={config.latestEnd === '00:00' ? 24 : parseInt(config.latestEnd || '24')}
            slotMinutes={config.slotDuration || 30}
          />
        )}

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="primary" onClick={handleCopy} className="text-lg">
            {copied ? 'Copied!' : 'Copy as Text'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/config')} className="text-lg">
            Configure
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
