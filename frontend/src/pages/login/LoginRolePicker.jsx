import { useNavigate } from 'react-router-dom';
import LoginLayout from '../../components/layout/LoginLayout';
import Button from '../../components/shared/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from "react-router";

export default function LoginRolePicker() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleRoleSelect = (role) => {
    setRole(role);
    navigate(role === 'ta' ? '/login/ta' : '/login/tf');
  };

  return (
    <LoginLayout>
      <div className="w-full text-center flex flex-col h-full justify-between">
        <div className="mt-60">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Get started with scheduling
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Select your role below to get started
          </p>

          <div className="flex flex-col gap-3 w-[384px] justify-self-center">
            <Button
              variant="primary"
              className="w-full py-4 text-xl"
              onClick={() => handleRoleSelect('ta')}
            >
              🕵️‍♂️ Teaching Assistant (TA)
            </Button>
            <Button
              variant="primary"
              className="w-full py-4 text-xl"
              onClick={() => handleRoleSelect('tf')}
            >
              🧙‍♂️ Teaching Fellow (TF)
            </Button>
          </div>
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
