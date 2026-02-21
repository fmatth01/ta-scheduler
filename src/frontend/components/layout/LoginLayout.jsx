import Logo from '../shared/Logo';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoginLayout({ children }) {
  return (
    <div className="flex h-screen">
      <div className="w-[40%] bg-mint relative flex flex-col items-center justify-end overflow-hidden">
        <Logo className="absolute top-10 left-10" />
        
        <DotLottieReact
          src="https://lottie.host/1fd7514c-8d60-4e55-b0f7-691efcdb08cf/GLO8UH8RBj.lottie"
          loop
          autoplay
        />
      </div>

      <div className="w-[60%] bg-white flex flex-col items-center justify-center px-16">
        {children}
      </div>
    </div>
  );
}
