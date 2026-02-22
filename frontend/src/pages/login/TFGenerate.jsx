import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginLayout from '../../components/layout/LoginLayout';
import Button from '../../components/shared/Button';
import EmojiCodeInput, { EMOJI_OPTIONS } from '../../components/shared/EmojiCodeInput';
import { generateClassCode } from '../../services/api';
import { Link } from "react-router";


const generateRandomEmojiCode = () => {
  const pool = [...EMOJI_OPTIONS];
  const randomCode = [];
  while (randomCode.length < 5 && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    randomCode.push(pool.splice(index, 1)[0]);
  }
  return randomCode;
};

export default function TFGenerate() {
  const navigate = useNavigate();
  const [code, setCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function generate() {
      try {
        const result = await generateClassCode();
        // TODO: Backend - store class code
        setCode(result.classCode || generateRandomEmojiCode());
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
      <div className="w-full text-center flex flex-col h-full justify-between">
        <div className="mt-60">
          <h1 className="text-5xl font-bold text-gray-900 mb-17">
            Get started with scheduling
          </h1>

          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-mint" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <>
              <p className="text-xl font-medium text-gray-700 mb-3">
                Your unique class code sequence is:
              </p>
              <EmojiCodeInput value={code} onChange={() => {}} disabled />

              <p className="text-md text-gray-500 mt-4 mb-2">
                Use this code at login to register your class and manage the schedule.
              </p>
              <p className="text-md text-gray-500 mb-6">
                Share this code with TAs that belong to this class.
              </p>

              <div className="flex gap-3 mt-12 justify-center">
                <Button variant="primary" onClick={handleCopy} className="py-4 text-xl">
                  {copied ? 'Copied!' : 'Copy Class Code'}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/')} className="py-4 text-xl">
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="mt-auto">
          <p className="mb-6 text-lg text-gray-400">
            <Link to="https://github.com/fmatth01/ta-scheduler/">Learn more about ISpyScheduling ↗</Link>
          </p>
        </div>
      </div>
    </LoginLayout>
  );
}
