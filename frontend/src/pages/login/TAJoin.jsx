import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginLayout from '../../components/layout/LoginLayout';
import Button from '../../components/shared/Button';
import EmojiCodeInput from '../../components/shared/EmojiCodeInput';
import { useAuth } from '../../contexts/AuthContext';
import { loginTA } from '../../services/api';

export default function TAJoin() {
  const navigate = useNavigate();
  const { setUtln, setName, setClassCode, login } = useAuth();
  const [utln, setUtlnLocal] = useState('');
  const [code, setCode] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = utln.trim() && code.length === 5;

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Please fill in your utln and enter the full 5-emoji code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await loginTA(utln.trim(), code);
      setUtln(utln.trim());
      setClassCode(code);
      if (result.name) setName(result.name);
      login({ isFirstTime: result.isFirstTime ?? true });
      navigate(result.isFirstTime === false ? '/viewer' : '/builder');
    } catch {
      setError('Failed to join class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <div className="max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Get started with scheduling
        </h1>

        <div className="text-left mb-4 mt-5">
          <input
            type="text"
            value={utln}
            onChange={(e) => setUtlnLocal(e.target.value)}
            placeholder="Enter your utln..."
            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-mint ${
              error && !utln.trim() ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Enter your class' unique emoji sequence code
          </p>
          <EmojiCodeInput value={code} onChange={setCode} />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button
          variant="primary"
          className="w-full py-3"
          onClick={handleSubmit}
          loading={loading}
          disabled={!isValid}
        >
          Submit
        </Button>

        <p className="mt-8 text-sm text-gray-400">
          Learn more about ISpyScheduling ↗
        </p>
      </div>
    </LoginLayout>
  );
}
