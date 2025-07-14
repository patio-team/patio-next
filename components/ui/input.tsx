'use client';

import { forwardRef } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="space-y-3">
        {label && (
          <label className="block text-[#34314C] text-base leading-[22px] font-medium">
            {label}
          </label>
        )}
        <input
          type={type}
          className={`w-full max-w-[407px] h-[42px] px-4 py-2 border border-[#DBDAE7] rounded-lg bg-white text-base leading-[18px] tracking-[0.1px] placeholder:text-[#948FB7] focus:outline-none focus:ring-2 focus:ring-[#3FE3D2] focus:border-transparent ${className || ''}`}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
