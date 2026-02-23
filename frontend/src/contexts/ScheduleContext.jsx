import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const ScheduleContext = createContext(null);

const initialState = {
  availability: {},
  schedule: [],
  config: {
    earliestStart: '09:00',
    latestEnd: '00:00',
    slotDuration: 90,
    tasPerShift: 1,
    approvedTFs: [],
  },
  templateSlots: {},
};

function scheduleReducer(state, action) {
  switch (action.type) {
    case 'SET_AVAILABILITY': {
      const { key, value } = action.payload;
      const next = { ...state.availability };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return { ...state, availability: next };
    }
    case 'CLEAR_AVAILABILITY':
      return { ...state, availability: {} };
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.payload };
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'SET_TEMPLATE_SLOT': {
      const { key, value } = action.payload;
      const next = { ...state.templateSlots };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return { ...state, templateSlots: next };
    }
    case 'CLEAR_TEMPLATE':
      return { ...state, templateSlots: {} };
    default:
      return state;
  }
}

export function ScheduleProvider({ children }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  // Stable function references — dispatch from useReducer never changes,
  // so these callbacks are safe with empty dependency arrays.
  const setAvailability = useCallback((day, time, type) => {
    const key = `${day}-${time}`;
    dispatch({ type: 'SET_AVAILABILITY', payload: { key, value: type } });
  }, []);

  const clearAvailability = useCallback(() => dispatch({ type: 'CLEAR_AVAILABILITY' }), []);

  const setSchedule = useCallback((data) => dispatch({ type: 'SET_SCHEDULE', payload: data }), []);

  const updateConfig = useCallback((partial) => dispatch({ type: 'UPDATE_CONFIG', payload: partial }), []);

  const setTemplateSlot = useCallback((day, time, type) => {
    const key = `${day}-${time}`;
    dispatch({ type: 'SET_TEMPLATE_SLOT', payload: { key, value: type } });
  }, []);

  const clearTemplate = useCallback(() => dispatch({ type: 'CLEAR_TEMPLATE' }), []);

  const value = useMemo(() => ({
    ...state,
    setAvailability,
    clearAvailability,
    setSchedule,
    updateConfig,
    setTemplateSlot,
    clearTemplate,
  }), [state, setAvailability, clearAvailability, setSchedule, updateConfig, setTemplateSlot, clearTemplate]);

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
