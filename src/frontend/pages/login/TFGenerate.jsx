import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginLayout from '../../components/layout/LoginLayout';
import Button from '../../components/shared/Button';
import EmojiCodeInput from '../../components/shared/EmojiCodeInput';
import { generateClassCode } from '../../services/api';

export default function TFGenerate() {
  const navigate = useNavigate();
  const [code, setCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function generate() {
      try {
        const result = await generateClassCode();
        // TODO: Use result.classCode from backend. Using placeholder for now.
        setCode(result.classCode || ['🥷', '😂', '💀', '🙈', '🌍']);
      } catch {
        setCode(['❓', '❓', '❓', '❓', '❓']);
      } finally {
        setLoading(false);
      }
    }
    generate();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.join(''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in non-secure contexts
    }
  };

  return (
    <LoginLayout>
      <div className="max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Get started with scheduling
        </h1>
        <p className="text-gray-500 mb-6">
          Select your role below to get started
        </p>

        <div className="mb-6">
          <Button variant="primary" className="w-64 py-3 cursor-default" disabled>
            ★ Teaching Fellow (TF)
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-mint" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Your unique class code sequence is:
            </p>
            <EmojiCodeInput value={code} onChange={() => {}} disabled />

            <p className="text-sm text-gray-500 mt-4 mb-2">
              Use this code at login to register your class and manage the schedule.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Share this code with TAs that belong to this class.
            </p>

            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy Class Code'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')}>
                Back to Login
              </Button>
            </div>
          </>
        )}

        <p className="mt-8 text-sm text-gray-400">
          Learn more about ISpyScheduling ↗
        </p>
      </div>
    </LoginLayout>
  );
}
