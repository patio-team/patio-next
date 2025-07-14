'use client';

import { useState } from 'react';
import { Merriweather, Lato } from 'next/font/google';
import { Button } from '@/components/ui/button';

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: ['400'],
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['300', '400', '700'],
});

interface DaySelection {
  weekday: boolean;
  weekend: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export default function NewTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [selectedDays, setSelectedDays] = useState<DaySelection>({
    weekday: true,
    weekend: false,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [startTime] = useState('12:00 pm');
  const [duration] = useState('24 hr');

  const handleDayToggle = (day: keyof DaySelection) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

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

  const ChevronDownIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 9L12 15L18 9"
        stroke="#25282B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.0607 7.93934C28.6464 8.52513 28.6464 9.47487 28.0607 10.0607L10.0607 28.0607C9.47487 28.6464 8.52513 28.6464 7.93934 28.0607C7.35355 27.4749 7.35355 26.5251 7.93934 25.9393L25.9393 7.93934C26.5251 7.35355 27.4749 7.35355 28.0607 7.93934Z"
        fill="#25282B"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.93934 7.93934C8.52513 7.35355 9.47487 7.35355 10.0607 7.93934L28.0607 25.9393C28.6464 26.5251 28.6464 27.4749 28.0607 28.0607C27.4749 28.6464 26.5251 28.6464 25.9393 28.0607L7.93934 10.0607C7.35355 9.47487 7.35355 8.52513 7.93934 7.93934Z"
        fill="#25282B"
      />
    </svg>
  );

  const Checkbox = ({
    checked,
    label,
    onClick,
  }: {
    checked: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-6 cursor-pointer group">
      <div className="flex-shrink-0">
        {checked ? <CheckIcon /> : <EmptyCheckIcon />}
      </div>
      <span className="font-lato text-[#34314C] text-base leading-[22px] tracking-[0.1px]">
        {label}
      </span>
    </button>
  );

  const Dropdown = ({ value }: { value: string }) => (
    <div className="relative">
      <button
        type="button"
        className="w-44 h-[42px] flex items-center justify-between px-4 py-2 border border-[#DBDAE7] rounded-lg bg-white">
        <span className="font-lato text-[#948FB7] text-base leading-[18px] tracking-[0.1px]">
          {value}
        </span>
        <ChevronDownIcon />
      </button>
    </div>
  );

  return (
    <div
      className={`${merriweather.variable} ${lato.variable} min-h-screen bg-white relative`}>
      {/* Close button */}
      <button
        type="button"
        className="absolute top-14 right-16 z-10 hover:opacity-75 transition-opacity"
        onClick={() => window.history.back()}>
        <CloseIcon />
      </button>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-16 py-16">
        <div className="space-y-8">
          {/* Title */}
          <h1 className="font-merriweather text-[#34314C] text-[32px] leading-[42px] font-normal">
            New team
          </h1>

          {/* Team name input */}
          <div className="space-y-3">
            <label className="block font-lato text-[#34314C] text-base leading-[22px] font-medium">
              Team name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Placeholder text..."
              className="w-full max-w-[407px] h-[42px] px-4 py-2 border border-[#DBDAE7] rounded-lg bg-white font-lato text-base leading-[18px] tracking-[0.1px] placeholder:text-[#948FB7] focus:outline-none focus:ring-2 focus:ring-[#3FE3D2] focus:border-transparent"
            />
          </div>

          {/* Poll days section */}
          <div className="space-y-6">
            <h2 className="font-lato text-[#34314C] text-base leading-[22px] font-medium">
              On what day do you want polls?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
              <Checkbox
                checked={selectedDays.weekday}
                label="Weekday"
                onClick={() => handleDayToggle('weekday')}
              />
              <Checkbox
                checked={selectedDays.weekend}
                label="Weekend"
                onClick={() => handleDayToggle('weekend')}
              />
              <Checkbox
                checked={selectedDays.monday}
                label="Monday"
                onClick={() => handleDayToggle('monday')}
              />
              <Checkbox
                checked={selectedDays.tuesday}
                label="Tuesday"
                onClick={() => handleDayToggle('tuesday')}
              />
              <Checkbox
                checked={selectedDays.wednesday}
                label="Wednesday"
                onClick={() => handleDayToggle('wednesday')}
              />
              <Checkbox
                checked={selectedDays.thursday}
                label="Thursday"
                onClick={() => handleDayToggle('thursday')}
              />
              <Checkbox
                checked={selectedDays.friday}
                label="Friday"
                onClick={() => handleDayToggle('friday')}
              />
              <Checkbox
                checked={selectedDays.saturday}
                label="Saturday"
                onClick={() => handleDayToggle('saturday')}
              />
              <Checkbox
                checked={selectedDays.sunday}
                label="Sunday"
                onClick={() => handleDayToggle('sunday')}
              />
            </div>
          </div>

          {/* Poll timing section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="font-lato text-[#34314C] text-base leading-[22px] font-medium">
                  Poll starts at
                </span>
                <Dropdown value={startTime} />
              </div>
              <div className="flex items-center gap-4">
                <span className="font-lato text-[#34314C] text-base leading-[22px] font-medium">
                  and is open for
                </span>
                <Dropdown value={duration} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <button
              type="button"
              className="w-60 h-15 px-5 py-4 border-2 border-[#C3C1D7] bg-white rounded-tl-[20px] rounded-br-[20px] shadow-[4px_4px_10px_0px_rgba(195,193,215,0.10)] hover:bg-gray-50 transition-colors">
              <span className="font-lato text-[#34314C] text-base font-bold">
                Cancel
              </span>
            </button>

            <Button>Create team</Button>
            <Button variant="secondary">Create team</Button>

            <button
              type="button"
              disabled={!teamName.trim()}
              className="w-60 h-15 px-5 py-4 bg-[#C3C1D7] rounded-tl-[20px] rounded-br-[20px] disabled:bg-[#C3C1D7] enabled:bg-[#34314C] enabled:hover:bg-[#2a2742] transition-colors">
              <span className="font-lato text-white text-base font-bold">
                Create team
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="fixed bottom-0 left-0 w-full h-64 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 left-3"
          width="908"
          height="269"
          viewBox="0 0 908 153"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <circle
            opacity="0.25"
            cx="494.5"
            cy="168.5"
            r="100.5"
            fill="#FFC952"
          />
          <circle
            opacity="0.25"
            cx="671.5"
            cy="48.5"
            r="48.5"
            fill="#98DDAB"
          />
          <circle
            opacity="0.25"
            cx="850.5"
            cy="130.5"
            r="57.5"
            fill="#3FE3D2"
          />
          <circle
            opacity="0.25"
            cx="250.5"
            cy="114.5"
            r="65.5"
            fill="#FF7473"
          />
          <circle
            opacity="0.25"
            cx="50"
            cy="138"
            r="50"
            fill="#FE346E"
          />
        </svg>
      </div>
    </div>
  );
}
