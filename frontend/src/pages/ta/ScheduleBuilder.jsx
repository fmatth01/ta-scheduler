import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/shared/Button';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { submitAvailability } from '../../services/api';

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

export default function ScheduleBuilder() {
  const navigate = useNavigate();
  const { utln, name: authName, setName, setUtln } = useAuth();
  const { availability, setAvailability, clearAvailability, config } = useSchedule();

  const [fullName, setFullName] = useState(authName || '');
  const [userUTLN, setUTLN] = useState(utln || '');
  const [labLead, setLabLead] = useState(null);
  const [labAssistant, setLabAssistant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const slotMinutes = config.slotDuration || 30;
  const startHour = config.earliestStart ? parseInt(config.earliestStart) : 9;
  const endHour = config.latestEnd === '00:00' ? 24 : parseInt(config.latestEnd || '24');

  const handleCellClick = (day, time) => {
    const key = `${day}-${time}`;
    const current = availability[key];
    let next;
    if (!current) {
      next = 'preferred';
    } else if (current === 'preferred') {
      next = 'available';
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
    if (!userUTLN.trim()) {
      setError('Please enter your UTLN.');
      return;
    }
    if (labLead === null || labAssistant === null) {
      setError('Please answer both lab preference questions.');
      return;
    }
    const normalizedName = fullName.trim();
    const normalizedUTLN = userUTLN.trim();

    setName(normalizedName);
    setUtln(normalizedUTLN);
    try {
      localStorage.setItem('ta_profile', JSON.stringify({ name: normalizedName, utln: normalizedUTLN }));
    } catch {
      // localStorage may be unavailable
    }

    setError('');
    setLoading(true);
    try {
      await submitAvailability(normalizedUTLN, availability, { labLead, labAssistant }, normalizedName, config);
      navigate('/viewer', { state: { taProfile: { name: normalizedName, utln: normalizedUTLN } } });
    } catch {
      setError('Failed to submit availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateAll = () => {
    const times = generateTimeSlots(startHour, endHour, slotMinutes);
    DAYS.forEach((day) => {
      times.forEach((time) => {
        setAvailability(day, time, 'preferred');
      });
    });
  };

  const handleClearCalendar = () => {
    clearAvailability();
  };

  const sidebar = (
    <>
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1 mt-3">Full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Smith"
          className={`w-full px-3 py-2 border rounded-lg text-lg bg-gray-100 text-gray-500 outline-none focus:ring-2 focus:ring-mint ${
            error && !fullName.trim() ? 'border-red-400' : 'border-gray-300'
          }`}
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">utln</label>
        <input
          type="text"
          value={userUTLN}
          onChange={(e) => setUTLN(e.target.value)}
          placeholder="jsmith01"
          className={`w-full px-3 py-2 border rounded-lg text-lg bg-gray-100 text-gray-500 outline-none focus:ring-2 focus:ring-mint ${
            error && !userUTLN.trim() ? 'border-red-400' : 'border-gray-300'
          }`}
        />
      </div>

      <div>
        <p className="text-lg font-medium text-gray-700 mb-1 mt-7">
          Would you be willing to be a lab lead?
        </p>
        <p className="text-md text-gray-500 mb-2 italic">
          Note: Lab leads need at least one semester of experience as a lab assistant.
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-lg cursor-pointer">
            <input
              type="radio"
              name="labLead"
              checked={labLead === true}
              onChange={() => setLabLead(true)}
              className="accent-blue w-4 h-4"
            />
            Yes
          </label>
          <label className="flex items-center gap-1.5 text-lg cursor-pointer">
            <input
              type="radio"
              name="labLead"
              checked={labLead === false}
              onChange={() => setLabLead(false)}
              className="accent-blue w-4 h-4"
            />
            No
          </label>
        </div>
      </div>

      <div>
        <p className="text-lg font-medium text-gray-700 mb-1">
          Would you be willing to be a lab assistant?
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-lg cursor-pointer">
            <input
              type="radio"
              name="labAssistant"
              checked={labAssistant === true}
              onChange={() => setLabAssistant(true)}
              className="accent-blue w-4 h-4"
            />
            Yes
          </label>
          <label className="flex items-center gap-1.5 text-lg cursor-pointer">
            <input
              type="radio"
              name="labAssistant"
              checked={labAssistant === false}
              onChange={() => setLabAssistant(false)}
              className="accent-blue w-4 h-4"
            />
            No
          </label>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </>
  );

  return (
    <AppLayout sidebar={sidebar}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">TA Schedule Builder</h1>
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-shift-pink py-1 px-7 rounded-xl font-semibold text-white text-lg">
            Preferred Availability
          </div>
          <div className="bg-shift-blue py-1 px-7 rounded-xl font-semibold text-white text-lg">
            General Availability
          </div>
          <div className="bg-white py-1 px-7 rounded-xl font-semibold text-black text-lg shadow-md border border-gray-200">
            Empty
          </div>
        </div>
        <p className="text-lg text-gray-500 italic mb-3 mt-3">
          Click or drag on a time slot to cycle availability type
        </p>
        <ScheduleGrid
          mode="builder"
          data={availability}
          onCellClick={handleCellClick}
          startHour={startHour}
          endHour={endHour}
          slotMinutes={slotMinutes}
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <Button variant="primary" className="text-lg" onClick={handlePopulateAll}>
              Populate All
            </Button>
            <Button variant="primary" className="text-lg" onClick={handleClearCalendar}>
              Clear Calendar
            </Button>
          </div>
          <Button variant="primary" className="text-lg" onClick={handleSubmit} loading={loading}>
            Submit
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
