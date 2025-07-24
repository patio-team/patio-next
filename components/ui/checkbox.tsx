'use client';

interface CheckboxProps {
  checked: boolean;
  label: string;
  onClick: () => void;
}

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.7071 3.29289C23.0976 3.68342 23.0976 4.31658 22.7071 4.70711L12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L8.29289 11.7071C7.90237 11.3166 7.90237 10.6834 8.29289 10.2929C8.68342 9.90237 9.31658 9.90237 9.70711 10.2929L12 12.5858L21.2929 3.29289C21.6834 2.90237 22.3166 2.90237 22.7071 3.29289Z"
      fill="#25282B"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 4C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5V19C4 19.2652 4.10536 19.5196 4.29289 19.7071C4.48043 19.8946 4.73478 20 5 20H19C19.2652 20 19.5196 19.8946 19.7071 19.7071C19.8946 19.5196 20 19.2652 20 19V12C20 11.4477 20.4477 11 21 11C21.5523 11 22 11.4477 22 12V19C22 19.7957 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7957 22 19 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7957 2 19V5C2 4.20435 2.31607 3.44129 2.87868 2.87868C3.44129 2.31607 4.20435 2 5 2H16C16.5523 2 17 2.44772 17 3C17 3.55228 16.5523 4 16 4H5Z"
      fill="#25282B"
    />
  </svg>
);

const EmptyCheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 4C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H5ZM2 5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5Z"
      fill="#25282B"
    />
  </svg>
);

export function Checkbox({ checked, label, onClick }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-6">
      <div className="flex-shrink-0">
        {checked ? <CheckIcon /> : <EmptyCheckIcon />}
      </div>
      <span className="text-primary text-base leading-[22px] tracking-[0.1px]">
        {label}
      </span>
    </button>
  );
}
