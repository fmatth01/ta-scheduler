import { useNavigate } from 'react-router-dom';
import LoginLayout from '../../components/layout/LoginLayout';
import Button from '../../components/shared/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginRolePicker() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleRoleSelect = (role) => {
    setRole(role);
    navigate(role === 'ta' ? '/login/ta' : '/login/tf');
  };

  return (
    <LoginLayout>
      <div className="max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Get started with course scheduling
        </h1>
        <p className="text-gray-500 mb-8">
          Select your role below to get started
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            className="w-full py-3"
            onClick={() => handleRoleSelect('ta')}
          >
            ★ Teaching Assistant (TA)
          </Button>
          <Button
            variant="primary"
            className="w-full py-3"
            onClick={() => handleRoleSelect('tf')}
          >
            ★ Teaching Fellow (TF)
          </Button>
        </div>
        {/* TODO: Link to github */}
        <p className="mt-12 text-sm text-gray-400">
          Learn more about ISpyScheduling ↗
        </p>
      </div>
    </LoginLayout>
  );
}
