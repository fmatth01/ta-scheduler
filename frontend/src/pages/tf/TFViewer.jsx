import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/shared/Button';
import ShiftCard from '../../components/shared/ShiftCard';
import ScheduleGrid from '../../components/shared/ScheduleGrid';
import { useSchedule } from '../../contexts/ScheduleContext';
import { getTFSchedule, copyScheduleAsText } from '../../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_TO_CODE = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'R', Fri: 'F', Sat: 'S', Sun: 'U' };
const DAY_TO_LABEL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const PLACEHOLDER_TA = 'TBD_TA';

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h * 60) + m;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatAssignedTA(ta) {
  if (!ta) return '';
  if (ta.name && ta.utln) return `${ta.name} (${ta.utln})`;
  return ta.name || ta.utln || '';
}

function getOHNames(shift) {
  return (shift.assignedTAs || []).map(formatAssignedTA).filter(Boolean);
}

function getLabNames(shift) {
  const leaders = (shift.labLeaders || []).map(formatAssignedTA).filter(Boolean);
  const tas = (shift.labTAs || []).map(formatAssignedTA).filter(Boolean);
  return [...leaders, ...tas];
}

function formatTANameForCopy(ta) {
  if (!ta) return '';
  if (typeof ta === 'string') return ta.trim();
  if (ta.copyName) return String(ta.copyName).trim();
  if (ta.name) return ta.name.replace(/\s+/g, '_').trim();
  if (ta.utln) return String(ta.utln).trim();
  return '';
}

function hhmmNoColon(timeStr) {
  if (!timeStr) return '0000';
  return timeStr.replace(':', '');
}

function addShiftSlotsToGrid(shift, slotMinutes, grid, tooltip) {
  if (!shift.day || !DAYS.includes(shift.day) || !shift.startTime || !shift.endTime) return;
  if (!slotMinutes || slotMinutes <= 0) return;
  if (!shift.isEmpty && shift.type !== 'oh' && shift.type !== 'lab') return;

  const startMinutes = timeToMinutes(shift.startTime);
  const endMinutes = timeToMinutes(shift.endTime);
  if (endMinutes <= startMinutes) return;

  const slotType = shift.isEmpty ? 'no-ta' : shift.type;
  const names = shift.isEmpty ? [] : (shift.type === 'oh' ? getOHNames(shift) : getLabNames(shift));

  for (let current = startMinutes; current < endMinutes; current += slotMinutes) {
    const key = `${shift.day}-${minutesToTime(current)}`;
    grid[key] = slotType;
    tooltip[key] = names;
  }
}

function buildScheduleCopyText(shifts) {
  const safeShifts = Array.isArray(shifts) ? shifts : [];
  const byDay = {};
  for (const d of DAYS) byDay[d] = {};
  const byTA = new Map();

  const addToTAIndex = (taName, day, startTime) => {
    const clean = (taName || '').trim();
    if (!clean) return;
    const code = `${DAY_TO_CODE[day] || '?'}${hhmmNoColon(startTime)}`;
    if (!byTA.has(clean)) byTA.set(clean, new Set());
    byTA.get(clean).add(code);
  };

  for (const shift of safeShifts) {
    if (shift?.isEmpty) continue;

    const day = shift?.day;
    const type = shift?.type;
    const startTime = shift?.startTime;
    if (!DAYS.includes(day) || !startTime) continue;
    if (type !== 'oh' && type !== 'lab') continue;

    if (!byDay[day][startTime]) {
      byDay[day][startTime] = { ohTAs: [], labLeaders: [], labTAs: [] };
    }

    const slot = byDay[day][startTime];

    if (type === 'oh') {
      const ohNames = (shift.officeHourTAs ?? shift.assignedTAs ?? [])
        .map(formatTANameForCopy)
        .filter(Boolean);
      const resolved = ohNames.length ? ohNames : [PLACEHOLDER_TA];
      slot.ohTAs.push(...resolved);
      for (const name of resolved) addToTAIndex(name, day, startTime);
    }

    if (type === 'lab') {
      const leaderNames = (shift.labLeaders ?? [])
        .map(formatTANameForCopy)
        .filter(Boolean);
      const labNames = (shift.labTAs ?? [])
        .map(formatTANameForCopy)
        .filter(Boolean);
      const resolvedLeaders = leaderNames.length ? leaderNames : [PLACEHOLDER_TA];
      const resolvedLabs = labNames.length ? labNames : [PLACEHOLDER_TA];
      slot.labLeaders.push(...resolvedLeaders);
      slot.labTAs.push(...resolvedLabs);
      for (const name of resolvedLeaders) addToTAIndex(name, day, startTime);
      for (const name of resolvedLabs) addToTAIndex(name, day, startTime);
    }
  }

  const lines = [];
  for (const day of DAYS) {
    lines.push(`Schedule for ${DAY_TO_LABEL[day]}:`);
    lines.push('');
    const times = Object.keys(byDay[day]).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    if (times.length === 0) {
      lines.push('');
      lines.push('');
      continue;
    }
    for (const t of times) {
      const slot = byDay[day][t];
      const hasLab = slot.labLeaders.length > 0 || slot.labTAs.length > 0;
      const hasOH = slot.ohTAs.length > 0;
      if (hasLab) {
        lines.push(`  ${t}:  Lab Leader(s): ${slot.labLeaders.join(', ')}`);
        lines.push(`                Lab TAs: ${slot.labTAs.join(', ')}`);
        if (hasOH) lines.push(`          Office Hr TAs: ${slot.ohTAs.join(', ')}`);
        lines.push('');
      } else if (hasOH) {
        lines.push(`  ${t}:  Office Hr TAs: ${slot.ohTAs.join(', ')}`);
        lines.push('');
      }
    }
    lines.push('');
    lines.push('');
  }

  lines.push('Schedule by TA');
  lines.push('');
  const taNames = Array.from(byTA.keys()).sort((a, b) => a.localeCompare(b));
  for (const name of taNames) {
    const codes = Array.from(byTA.get(name)).sort((a, b) => {
      const order = { M: 0, T: 1, W: 2, R: 3, F: 4, S: 5, U: 6, '?': 7 };
      const dayA = a[0];
      const dayB = b[0];
      if (order[dayA] !== order[dayB]) return order[dayA] - order[dayB];
      const timeA = parseInt(a.slice(1), 10) || 0;
      const timeB = parseInt(b.slice(1), 10) || 0;
      return timeA - timeB;
    });
    lines.push(`${name.padEnd(18, ' ')}:${codes.join(', ')}`);
  }

  return lines.join('\n');
}

// Backward-compatible alias for misspelled references.
const buildScheudleCopyText = buildScheduleCopyText;

export default function TFViewer() {
  const navigate = useNavigate();
  const { schedule, setSchedule, config, updateConfig } = useSchedule();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const result = await getTFSchedule();
        setSchedule(result?.shifts || []);
        if (result?.config) updateConfig(result.config);
      } catch {
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [setSchedule, updateConfig]);

  const { gridData, tooltipData, ohShifts, labShifts } = useMemo(() => {
    const grid = {};
    const tooltip = {};
    const oh = [];
    const lab = [];
    const slotMinutes = config.slotDuration || 30;

    schedule.forEach((shift) => {
      if (shift.isEmpty) {
        addShiftSlotsToGrid(shift, slotMinutes, grid, tooltip);
        return;
      }

      const cardNames = shift.type === 'oh' ? getOHNames(shift) : getLabNames(shift);
      const card = {
        day: shift.day || '',
        startTime: shift.startTime || '',
        endTime: shift.endTime || '',
        type: shift.type,
        assignedTAs: cardNames,
      };

      if (shift.type === 'oh') oh.push(card);
      if (shift.type === 'lab') lab.push(card);

      addShiftSlotsToGrid(shift, slotMinutes, grid, tooltip);
    });

    return { gridData: grid, tooltipData: tooltip, ohShifts: oh, labShifts: lab };
  }, [schedule, config.slotDuration]);

  const handleCopy = async () => {
    try {
      const text = buildScheudleCopyText(schedule);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        await copyScheduleAsText(text);
      }
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
            No TAs Available
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
            startHour={config.earliestStart ? parseInt(config.earliestStart, 10) : 9}
            endHour={config.latestEnd === '00:00' ? 24 : parseInt(config.latestEnd || '24', 10)}
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
