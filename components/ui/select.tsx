'use client';

import { forwardRef } from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-primary block text-base leading-[22px] font-medium">
            {label}
          </label>
        )}

        <select
          {...props}
          className={`h-[42px] w-full max-w-[407px] rounded-lg border border-[#DBDAE7] bg-white px-4 py-2 text-base leading-[18px] tracking-[0.1px] focus:border-transparent focus:ring-2 focus:ring-[#3FE3D2] focus:outline-none ${className || ''}`}
          ref={ref}>
          {props.children}
        </select>
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
