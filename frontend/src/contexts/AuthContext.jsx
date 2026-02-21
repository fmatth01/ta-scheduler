import { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext(null);

const initialState = {
  role: null,
  utln: '',
  name: '',
  classCode: [],
  isAuthenticated: false,
  isFirstTime: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'SET_UTLN':
      return { ...state, utln: action.payload };
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_CLASS_CODE':
      return { ...state, classCode: action.payload };
    case 'LOGIN':
      return { ...state, isAuthenticated: true, isFirstTime: action.payload?.isFirstTime ?? true };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const value = {
    ...state,
    setRole: (role) => dispatch({ type: 'SET_ROLE', payload: role }),
    setUtln: (utln) => dispatch({ type: 'SET_UTLN', payload: utln }),
    setName: (name) => dispatch({ type: 'SET_NAME', payload: name }),
    setClassCode: (code) => dispatch({ type: 'SET_CLASS_CODE', payload: code }),
    login: (opts) => dispatch({ type: 'LOGIN', payload: opts }),
    logout: () => dispatch({ type: 'LOGOUT' }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
