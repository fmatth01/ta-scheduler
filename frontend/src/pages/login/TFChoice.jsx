import { useNavigate } from 'react-router-dom';
import LoginLayout from '../../components/layout/LoginLayout';
import Button from '../../components/shared/Button';

export default function TFChoice() {
  const navigate = useNavigate();

  return (
    <LoginLayout>
      <div className="max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Get started with scheduling
        </h1>
        <p className="text-gray-500 mb-6">
          Select your role below to get started
        </p>

        <div className="mb-8">
          <Button variant="primary" className="w-64 py-3 cursor-default" disabled>
            ★ Teaching Fellow (TF)
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full py-3"
            onClick={() => navigate('/login/tf/generate')}
          >
            Create new class
          </Button>
          <Button
            variant="secondary"
            className="w-full py-3"
            onClick={() => navigate('/login/tf/join')}
          >
            Enter class code
          </Button>
        </div>

        <p className="mt-12 text-sm text-gray-400">
          Learn more about ISpyScheduling ↗
        </p>
      </div>
    </LoginLayout>
  );
}
