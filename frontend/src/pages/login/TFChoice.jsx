import { useNavigate } from 'react-router-dom';
import LoginLayout from '../../components/layout/LoginLayout';
import Button from '../../components/shared/Button';
import { Link } from "react-router";


export default function TFChoice() {
  const navigate = useNavigate();

  return (
    <LoginLayout>
      <div className="w-full text-center flex flex-col h-full justify-between">
        <div className="mt-60">
          <h1 className="text-5xl font-bold text-gray-900 mb-17">
            Get started with scheduling
          </h1>

          <div className="flex flex-col gap-3 w-[384px] justify-self-center">
            <Button
              variant="primary"
              className="w-full py-4 text-xl"
              onClick={() => navigate('/login/tf/generate')}
            >
              Create new class
            </Button>
            <Button
              variant="primary"
              className="w-full py-4 text-xl"
              onClick={() => navigate('/login/tf/join')}
            >
              Enter class code
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
