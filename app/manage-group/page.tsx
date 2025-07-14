"use client";

import { useState } from "react";
import { Merriweather, Lato } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["400"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["300", "400", "700"],
});

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  status: "active" | "waiting";
}

export default function ManageGroupPage() {
  const [emailInput, setEmailInput] = useState("");

  const members: Member[] = [
    {
      id: "1",
      name: "Aythami Moreno",
      email: "aythamimoreno@mail.com",
      initials: "AY",
      status: "active",
    },
    {
      id: "2",
      name: "Elena Gutemberg",
      email: "elenagutemberg@mail.com",
      initials: "EG",
      status: "active",
    },
  ];

  const waitingMembers: Member[] = [
    {
      id: "3",
      name: "",
      email: "treythompkins@mail.com",
      initials: "",
      status: "waiting",
    },
    {
      id: "4",
      name: "Elena Gutemberg",
      email: "elenagutemberg@mail.com",
      initials: "EG",
      status: "waiting",
    },
  ];

  const CloseIcon = () => (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

  const UserAvatar = ({
    member,
    isWaiting = false,
  }: {
    member: Member;
    isWaiting?: boolean;
  }) => (
    <div className="flex items-center gap-4 w-full">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-1 -left-1"
        >
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="#948FB7"
            fillOpacity="0.1"
            stroke={
              isWaiting ? (member.name ? "#C3C1D7" : "#F3F3F7") : "#948FB7"
            }
            strokeWidth="4"
          />
        </svg>
        {member.initials && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-lato text-2xl ${
                isWaiting ? "text-[#C3C1D7]" : "text-[#34314C]"
              }`}
            >
              {member.initials}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {member.name && (
          <div
            className={`font-merriweather text-base leading-[22px] ${
              isWaiting ? "text-[#948FB7]" : "text-[#34314C]"
            }`}
          >
            {member.name}
          </div>
        )}
        <div
          className={`font-lato text-base leading-[22px] font-medium ${
            isWaiting ? "text-[#948FB7]" : "text-[#34314C]"
          }`}
        >
          {member.email}
        </div>
      </div>

      {isWaiting && (
        <div className="flex-shrink-0">
          <span className="font-lato text-sm text-[#FFB752] font-normal">
            WAITING...
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`${merriweather.variable} ${lato.variable} min-h-screen bg-white relative`}
    >
      {/* Close button */}
      <button
        type="button"
        className="absolute top-14 right-16 z-10 hover:opacity-75 transition-opacity"
        onClick={() => window.history.back()}
      >
        <CloseIcon />
      </button>

      {/* Main content */}
      <div className="flex flex-col xl:flex-row gap-8 xl:gap-16 px-6 sm:px-16 py-16">
        {/* Left section - Group info and members */}
        <div className="flex-1 max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="font-merriweather text-[#34314C] text-[32px] leading-[42px] font-normal">
              Manage group
            </h1>
            <p className="font-lato text-[#948FB7] text-base leading-[22px] font-medium">
              Tracks on weekdays from 14:00 pm to 12:00 am
            </p>
          </div>

          {/* Member counts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-merriweather text-[#34314C] text-base leading-[22px]">
                Members:
              </span>
              <span className="font-lato text-[#948FB7] text-base leading-[22px] font-medium">
                {members.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-merriweather text-[#34314C] text-base leading-[22px]">
                Waiting:
              </span>
              <span className="font-lato text-[#948FB7] text-base leading-[22px] font-medium">
                {waitingMembers.length}
              </span>
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-6">
            {/* Waiting members */}
            {waitingMembers.map((member) => (
              <UserAvatar key={member.id} member={member} isWaiting={true} />
            ))}

            {/* Active members */}
            {members.map((member) => (
              <UserAvatar key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Right section - Invite members */}
        <div className="flex-1 max-w-2xl space-y-6">
          <h2 className="font-merriweather text-[#34314C] text-2xl leading-[30px] font-normal">
            Invite new members
          </h2>

          <div className="space-y-3">
            <label className="block font-lato text-[#34314C] text-base leading-[22px] font-medium">
              Enter multiple email addresses separated by comma.
            </label>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. username@mail.com, userpetname@mail.com"
              className="w-full h-[42px] px-4 py-2 border border-[#DBDAE7] rounded-lg bg-white font-lato text-base leading-[22px] placeholder:text-[#948FB7] focus:outline-none focus:ring-2 focus:ring-[#3FE3D2] focus:border-transparent"
            />
          </div>

          <button
            type="button"
            disabled={!emailInput.trim()}
            className="w-60 h-15 px-5 py-4 bg-[#C3C1D7] rounded-tl-[20px] rounded-br-[20px] disabled:bg-[#C3C1D7] enabled:bg-[#34314C] enabled:hover:bg-[#2a2742] transition-colors"
          >
            <span className="font-lato text-white text-base font-bold">
              Send invites
            </span>
          </button>
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
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            opacity="0.25"
            cx="494.5"
            cy="168.5"
            r="100.5"
            fill="#FFC952"
          />
          <circle opacity="0.25" cx="671.5" cy="48.5" r="48.5" fill="#98DDAB" />
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
          <circle opacity="0.25" cx="50" cy="138" r="50" fill="#FE346E" />
        </svg>
      </div>
    </div>
  );
}
