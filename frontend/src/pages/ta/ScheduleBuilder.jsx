import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/shared/Button';
import RoleToggle from '../../components/shared/RoleToggle';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { submitAvailability } from '../../services/api';

export default function ScheduleBuilder() {
  const navigate = useNavigate();
  const { utln, name: authName } = useAuth();
  const { availability, setAvailability, config } = useSchedule();

  const [fullName, setFullName] = useState(authName || '');
  const [paintMode, setPaintMode] = useState('Preferred');
  const [labLead, setLabLead] = useState(null);
  const [labAssistant, setLabAssistant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCellClick = (day, time) => {
    const key = `${day}-${time}`;
    const current = availability[key];
    // Click to cycle: empty -> preferred -> general -> empty
    let next;
    if (!current) {
      next = paintMode === 'Preferred' ? 'preferred' : 'general';
    } else if (current === 'preferred') {
      next = 'general';
    } else {
      next = null;
    }
    setAvailability(day, time, next);
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (labLead === null || labAssistant === null) {
      setError('Please answer both lab preference questions.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await submitAvailability(utln, availability, { labLead, labAssistant });
      navigate('/viewer');
    } catch {
      setError('Failed to submit availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sidebar = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Smith"
          className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-mint ${
            error && !fullName.trim() ? 'border-red-400' : 'border-gray-300'
          }`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">utln</label>
        <input
          type="text"
          value={utln}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Would you be willing to be a lab lead?
        </p>
        <p className="text-xs text-gray-500 mb-2 italic">
          Note: Lab leads need at least one semester of experience as a lab assistant.
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="labLead"
              checked={labLead === true}
              onChange={() => setLabLead(true)}
              className="accent-mint"
            />
            Yes
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="labLead"
              checked={labLead === false}
              onChange={() => setLabLead(false)}
              className="accent-mint"
            />
            No
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Would you be willing to be a lab assistant?
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="labAssistant"
              checked={labAssistant === true}
              onChange={() => setLabAssistant(true)}
              className="accent-mint"
            />
            Yes
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="radio"
              name="labAssistant"
              checked={labAssistant === false}
              onChange={() => setLabAssistant(false)}
              className="accent-mint"
            />
            No
          </label>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="mt-auto pt-4">
        <Button
          variant="green"
          className="w-full py-3"
          onClick={handleSubmit}
          loading={loading}
        >
          Submit
        </Button>
      </div>
    </>
  );

  return (
    <AppLayout sidebar={sidebar}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">TA Schedule Builder</h1>
        <div className="flex items-center gap-4 mb-2">
          <RoleToggle
            options={['Preferred', 'General']}
            value={paintMode}
            onChange={setPaintMode}
          />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Click on a cell to set availability. Cycles: empty → preferred → general → empty.
        </p>
        <ScheduleGrid
          mode="builder"
          data={availability}
          onCellClick={handleCellClick}
          startHour={config.earliestStart ? parseInt(config.earliestStart) : 9}
          endHour={config.latestEnd === '00:00' ? 24 : parseInt(config.latestEnd)}
          slotMinutes={config.slotDuration || 30}
        />
      </div>
    </AppLayout>
  );
}
