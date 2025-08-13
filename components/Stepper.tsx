import React from 'react';

interface StepperProps {
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Google Sign-in' },
    { number: 2, title: 'Clio Sign-in' },
    { number: 3, title: 'Enter App' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className="relative flex items-center">
        {/* Connecting line */}
        <div className="absolute w-full h-0.5 bg-gray-300 top-4 left-0" />
        <div
          className="absolute h-0.5 bg-blue-600 top-4 left-0 transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div
              key={step.number}
              className="relative flex flex-col items-center"
              style={{
                width: `${100 / (steps.length - 1)}%`,
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors duration-500 ease-in-out ${
                  isActive || isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? '✔' : step.number}
              </div>
              <p className={`mt-2 text-xs text-center font-semibold w-24 ${isActive || isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
