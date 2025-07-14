'use client';

import { useState } from 'react';
import { Merriweather, Lato } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

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

  const handleDayToggle = (day: keyof DaySelection) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  return (
    <div
      className={`${merriweather.variable} ${lato.variable} min-h-screen bg-white relative`}>
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-16 py-16">
        <div className="space-y-8">
          {/* Title */}
          <h1 className="font-merriweather text-[#34314C] text-[32px] leading-[42px] font-normal">
            New team
          </h1>

          {/* Team name input */}
          <Input
            label="Team name"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name..."
          />

          {/* Poll days section */}
          <div className="space-y-6">
            <h2 className="text-[#34314C] text-base leading-[22px] font-medium">
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

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Button
              variant="secondary"
              asChild>
              <Link
                href="/"
                className="text-center">
                Cancel
              </Link>
            </Button>
            <Button>Create team</Button>
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
