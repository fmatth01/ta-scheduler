import { Routes, Route } from 'react-router-dom';
import LoginRolePicker from './pages/login/LoginRolePicker';
import TAJoin from './pages/login/TAJoin';
import TFChoice from './pages/login/TFChoice';
import TFGenerate from './pages/login/TFGenerate';
import TFJoin from './pages/login/TFJoin';
import ScheduleBuilder from './pages/ta/ScheduleBuilder';
import TAViewer from './pages/ta/TAViewer';
import ScheduleConfig from './pages/tf/ScheduleConfig';
import TFViewer from './pages/tf/TFViewer';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRolePicker />} />
      <Route path="/login/ta" element={<TAJoin />} />
      <Route path="/login/tf" element={<TFChoice />} />
      <Route path="/login/tf/generate" element={<TFGenerate />} />
      <Route path="/login/tf/join" element={<TFJoin />} />
      <Route path="/builder" element={<ScheduleBuilder />} />
      <Route path="/viewer" element={<TAViewer />} />
      <Route path="/config" element={<ScheduleConfig />} />
      <Route path="/tf/viewer" element={<TFViewer />} />
    </Routes>
  );
}

export default App;
