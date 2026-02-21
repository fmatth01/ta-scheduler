import { createContext, useContext, useReducer } from 'react';

const ScheduleContext = createContext(null);

const initialState = {
  availability: {},
  schedule: [],
  config: {
    earliestStart: '09:00',
    latestEnd: '00:00',
    slotDuration: 30,
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

  const value = {
    ...state,
    setAvailability: (day, time, type) => {
      const key = `${day}-${time}`;
      dispatch({ type: 'SET_AVAILABILITY', payload: { key, value: type } });
    },
    clearAvailability: () => dispatch({ type: 'CLEAR_AVAILABILITY' }),
    setSchedule: (data) => dispatch({ type: 'SET_SCHEDULE', payload: data }),
    updateConfig: (partial) => dispatch({ type: 'UPDATE_CONFIG', payload: partial }),
    setTemplateSlot: (day, time, type) => {
      const key = `${day}-${time}`;
      dispatch({ type: 'SET_TEMPLATE_SLOT', payload: { key, value: type } });
    },
    clearTemplate: () => dispatch({ type: 'CLEAR_TEMPLATE' }),
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
