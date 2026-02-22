import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/shared/Button';
import ChipInput from '../../components/shared/ChipInput';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { generateTemplate, publishSchedule } from '../../services/api';

export default function ScheduleConfig() {
  const navigate = useNavigate();
  const { name: authName } = useAuth();
  const { config, updateConfig, templateSlots, setTemplateSlot } = useSchedule();

  const [fullName, setFullName] = useState(authName || '');
  const [editMode, setEditMode] = useState('Office Hours');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const SLOT_DURATION_OPTIONS = [30, 45, 60, 75, 90];


  const handleCellClick = (day, time) => {
    const key = `${day}-${time}`;
    const current = templateSlots[key];
    const slotType = editMode === 'Office Hours' ? 'oh' : 'lab';

    if (current === slotType) {
      setTemplateSlot(day, time, null);
    } else {
      setTemplateSlot(day, time, slotType);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      await publishSchedule(templateSlots);
      navigate('/tf/viewer');
    } catch {
      setError('Failed to publish schedule.');
    } finally {
      setPublishing(false);
    }
  };

  const startHour = config.earliestStart ? parseInt(config.earliestStart) : 9;
  const endHour = config.latestEnd === '00:00' ? 24 : parseInt(config.latestEnd || '24');

  const sidebar = (
    <>
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Smith"
          className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-mint"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700">
          utlns of other approved TFs
        </label>
        <p className="text-md text-gray-500 mb-1 italic">(separated with enter)</p>
        <ChipInput
          value={config.approvedTFs}
          onChange={(tfs) => updateConfig({ approvedTFs: tfs })}
          placeholder="Enter utln"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">Earliest shift start time</label>
        <input
          type="time"
          value={config.earliestStart}
          onChange={(e) => updateConfig({ earliestStart: e.target.value })}
          className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-mint"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">Latest shift end time</label>
        <input
          type="time"
          value={config.latestEnd}
          onChange={(e) => updateConfig({ latestEnd: e.target.value })}
          className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-mint"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">Shift Length</label>
        <div className="w-full border border-gray-300 rounded-lg overflow-hidden flex">
          {SLOT_DURATION_OPTIONS.map((duration, idx) => (
            <button
              key={duration}
              type="button"
              onClick={() => updateConfig({ slotDuration: duration })}
              className={`flex-1 px-3 py-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint ${
                idx !== 0 ? 'border-l border-gray-200' : ''
              } ${
                config.slotDuration === duration
                  ? 'bg-gray-200 text-gray-700'
                  : 'text-gray-700 hover:bg-gray-50 cursor-pointer bg-white'
              }`}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">Number of TAs per shift</label>
        <input
          type="number"
          value={config.tasPerShift}
          onChange={(e) => updateConfig({ tasPerShift: parseInt(e.target.value) || 1 })}
          min={1}
          className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-mint"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </>
  );

  return (
    <AppLayout sidebar={sidebar}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">TA Schedule Configuration</h1>
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-shift-blue py-1 px-7 rounded-xl font-semibold text-white text-lg">
            Office Hours
          </div>
          <div className="bg-shift-yellow py-1 px-7 rounded-xl font-semibold text-white text-lg">
            Lab Shifts
          </div>
        </div>
        <p className="text-lg text-gray-500 italic">
          Click on an "x" to remove a block of availability
        </p>
        <p className="text-lg text-gray-500 mb-4 italic">
          Click on a shift to toggle between lab and OH
        </p>
        <ScheduleGrid
          mode="tf-config"
          data={templateSlots}
          onCellClick={handleCellClick}
          startHour={startHour}
          endHour={endHour}
          slotMinutes={config.slotDuration || 30}
        />
        <div className="mt-10 flex justify-end">
          <Button
            variant="primary"
            className="text-lg"
            onClick={handlePublish}
            loading={publishing}
          >
            Publish
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
