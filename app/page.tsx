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

export default function Home() {
  return (
    <div
      className={`${merriweather.variable} ${lato.variable} min-h-screen bg-white`}
    >
      {/* Header */}
      <header className="w-full h-20 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-4 md:px-16">
        {/* Logo */}
        <div className="flex items-center">
          <svg
            width="108"
            height="42"
            viewBox="0 0 108 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M108 20.2189C108 22.6139 107.457 24.7694 106.37 26.6854C105.283 28.5715 103.788 30.0384 101.886 31.0862C100.014 32.134 97.9461 32.6579 95.6817 32.6579C93.3871 32.6579 91.3039 32.134 89.432 31.0862C87.5601 30.0384 86.0807 28.5715 84.9938 26.6854C83.9068 24.7694 83.3634 22.6139 83.3634 20.2189C83.3634 17.8238 83.9068 15.6833 84.9938 13.7972C86.0807 11.8812 87.5601 10.3993 89.432 9.3515C91.3039 8.27374 93.3871 7.73486 95.6817 7.73486C97.9461 7.73486 100.014 8.27374 101.886 9.3515C103.788 10.3993 105.283 11.8812 106.37 13.7972C107.457 15.6833 108 17.8238 108 20.2189ZM102.565 20.2189C102.565 18.7519 102.248 17.4496 101.614 16.312C101.011 15.1444 100.18 14.2463 99.1236 13.6176C98.0971 12.9889 96.9498 12.6746 95.6817 12.6746C94.4136 12.6746 93.2513 12.9889 92.1945 13.6176C91.168 14.2463 90.3377 15.1444 89.7037 16.312C89.0999 17.4496 88.7979 18.7519 88.7979 20.2189C88.7979 21.6858 89.0999 22.9881 89.7037 24.1257C90.3377 25.2633 91.168 26.1465 92.1945 26.7752C93.2513 27.4039 94.4136 27.7182 95.6817 27.7182C96.9498 27.7182 98.0971 27.4039 99.1236 26.7752C100.18 26.1465 101.011 25.2633 101.614 24.1257C102.248 22.9881 102.565 21.6858 102.565 20.2189Z"
              fill="#3FE3D2"
            />
            <path
              d="M79.35 29.6288C79.35 30.4081 79.0931 31.0675 78.5793 31.607C78.0655 32.1166 77.4157 32.3714 76.6299 32.3714C75.8441 32.3714 75.1943 32.1166 74.6805 31.607C74.1667 31.0675 73.9098 30.4081 73.9098 29.6288V10.4607C73.9098 9.68143 74.1667 9.037 74.6805 8.52745C75.1943 7.98793 75.8441 7.71817 76.6299 7.71817C77.4157 7.71817 78.0655 7.98793 78.5793 8.52745C79.0931 9.037 79.35 9.68143 79.35 10.4607V29.6288Z"
              fill="#98DDAB"
            />
            <path
              d="M73.9125 2.69761C73.9125 1.20776 75.1304 0 76.6326 0C78.1349 0 79.3528 1.20776 79.3528 2.69761V3.59682C79.3528 5.08667 78.1349 6.29443 76.6326 6.29443C75.1304 6.29443 73.9125 5.08667 73.9125 3.59682V2.69761Z"
              fill="#98DDAB"
            />
            <path
              d="M64.4054 31.6088C64.9185 31.0705 65.175 30.4126 65.175 29.6351V2.73624C65.175 1.95873 64.9185 1.31579 64.4054 0.807415C63.8923 0.269138 63.2434 0 62.4587 0C61.6739 0 61.025 0.269138 60.5119 0.807415C59.9988 1.31579 59.7423 1.95873 59.7423 2.73624V29.6351C59.7423 30.4126 59.9988 31.0705 60.5119 31.6088C61.025 32.1172 61.6739 32.3714 62.4587 32.3714C63.2434 32.3714 63.8923 32.1172 64.4054 31.6088Z"
              fill="#FFC952"
            />
            <path
              d="M53.8568 10.4665C53.8568 8.98008 55.073 7.77511 56.5732 7.77511H68.0423C69.5425 7.77511 70.7587 8.98008 70.7587 10.4665C70.7587 11.9529 69.5425 13.1579 68.0423 13.1579H56.5732C55.073 13.1579 53.8568 11.9529 53.8568 10.4665Z"
              fill="#FFC952"
            />
            <path
              d="M47.4378 7.73486C48.2163 7.73486 48.8601 7.98933 49.3691 8.49827C49.8782 9.00721 50.1327 9.66584 50.1327 10.4742V29.4696C50.1327 30.248 49.8782 30.9066 49.3691 31.4455C48.8601 31.9544 48.2163 32.2089 47.4378 32.2089C46.6592 32.2089 46.0154 31.9544 45.5064 31.4455C45.0273 30.9365 44.7728 30.2929 44.7428 29.5145C43.9943 30.3827 42.9762 31.1311 41.6886 31.7598C40.431 32.3586 39.0985 32.6579 37.6911 32.6579C35.625 32.6579 33.7536 32.134 32.0767 31.0862C30.3999 30.0085 29.0674 28.5266 28.0793 26.6405C27.1211 24.7544 26.642 22.6139 26.642 20.2189C26.642 17.8238 27.1211 15.6833 28.0793 13.7972C29.0375 11.8812 30.34 10.3993 31.9869 9.3515C33.6637 8.27374 35.5053 7.73486 37.5115 7.73486C38.9488 7.73486 40.2962 8.0043 41.5539 8.54318C42.8115 9.05212 43.8745 9.71075 44.7428 10.5191V10.4742C44.7428 9.69578 44.9974 9.05212 45.5064 8.54318C46.0154 8.0043 46.6592 7.73486 47.4378 7.73486ZM38.3649 27.7182C40.3112 27.7182 41.8982 27.0147 43.1259 25.6076C44.3536 24.1706 44.9674 22.3744 44.9674 20.2189C44.9674 18.0633 44.3536 16.2671 43.1259 14.8301C41.8982 13.3931 40.3112 12.6746 38.3649 12.6746C36.4485 12.6746 34.8764 13.3931 33.6488 14.8301C32.4211 16.2671 31.8072 18.0633 31.8072 20.2189C31.8072 22.3744 32.4061 24.1706 33.6038 25.6076C34.8315 27.0147 36.4185 27.7182 38.3649 27.7182Z"
              fill="#FF7473"
            />
            <path
              d="M12.4416 7.73486C14.5077 7.73486 16.3791 8.27474 18.056 9.35449C19.7328 10.4042 21.0503 11.8739 22.0085 13.7635C22.9967 15.653 23.4907 17.7975 23.4907 20.197C23.4907 22.5964 23.0116 24.7559 22.0534 26.6755C21.0952 28.565 19.7777 30.0497 18.1009 31.1295C16.454 32.1792 14.6274 32.7041 12.6212 32.7041C11.1839 32.7041 9.82149 32.4192 8.53392 31.8493C7.27629 31.2494 6.22826 30.5296 5.38984 29.6898V38.5078C5.38984 39.2876 5.13532 39.9324 4.62628 40.4423C4.11724 40.9822 3.47345 41.2521 2.69492 41.2521C1.91639 41.2521 1.2726 40.9972 0.76356 40.4873C0.25452 39.9774 0 39.3176 0 38.5078V10.9291C0 10.1493 0.25452 9.50445 0.76356 8.99457C0.25452 8.4547 1.91639 8.18476 2.69492 8.18476C3.47345 8.18476 4.11724 8.4547 4.62628 8.99457C5.13532 9.50445 5.38984 10.1493 5.38984 10.9291V11.1091C6.10849 10.2093 7.1116 9.42947 8.39917 8.76962C9.68674 8.07978 11.0342 7.73486 12.4416 7.73486ZM11.7678 27.7552C13.6842 27.7552 15.2562 27.0354 16.4839 25.5957C17.7116 24.1561 18.3255 22.3565 18.3255 20.197C18.3255 18.0375 17.7116 16.2529 16.4839 14.8432C15.2862 13.4036 13.7142 12.6837 11.7678 12.6837C9.82149 12.6837 8.23448 13.4036 7.00679 14.8432C5.77911 16.2529 5.16526 18.0375 5.16526 20.197C5.16526 22.3565 5.77911 24.1561 7.00679 25.5957C8.23448 27.0354 9.82149 27.7552 11.7678 27.7552Z"
              fill="#FE346E"
            />
          </svg>
        </div>

        {/* User Dropdown and Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
            <span className="font-lato text-[#34314C] text-sm">Kaleidos</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="#25282B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#948FB7] border-opacity-15 bg-[#948FB7] bg-opacity-15 flex items-center justify-center">
            <span className="font-lato text-[#34314C] text-lg font-normal">
              MM
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 md:px-16 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Section - Chart and Header */}
          <div className="xl:col-span-2 space-y-6">
            {/* Title and Settings */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="font-merriweather text-[#34314C] text-2xl md:text-3xl font-normal">
                  Kaleidos con nombre largo
                </h1>
                <p className="font-lato text-[#948FB7] text-sm mt-1">
                  Tracks on weekdays from 14:00 pm to 12:00 am
                </p>
                <div className="flex gap-6 mt-4">
                  <button className="font-lato text-[#3FA2F7] text-sm font-medium">
                    See members
                  </button>
                  <button className="font-lato text-[#3FA2F7] text-sm font-medium">
                    Leave team
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 text-[#34314C] font-lato text-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.00001 6.66659C7.26363 6.66659 6.66668 7.26354 6.66668 7.99992C6.66668 8.7363 7.26363 9.33325 8.00001 9.33325C8.73639 9.33325 9.33334 8.7363 9.33334 7.99992C9.33334 7.26354 8.73639 6.66659 8.00001 6.66659ZM5.33334 7.99992C5.33334 6.52716 6.52725 5.33325 8.00001 5.33325C9.47277 5.33325 10.6667 6.52716 10.6667 7.99992C10.6667 9.47268 9.47277 10.6666 8.00001 10.6666C6.52725 10.6666 5.33334 9.47268 5.33334 7.99992Z"
                    fill="#25282B"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 1.33333C7.82319 1.33333 7.65362 1.40357 7.5286 1.5286C7.40357 1.65362 7.33333 1.82319 7.33333 2V2.11599C7.33196 2.46053 7.22986 2.79715 7.03963 3.08441C6.84939 3.37167 6.5793 3.59703 6.26262 3.73276C6.20625 3.75692 6.14695 3.77313 6.08641 3.78104C5.79865 3.88181 5.48888 3.90665 5.18733 3.85197C4.84 3.789 4.5195 3.62341 4.26716 3.37658L4.2619 3.37143L4.22193 3.3314C4.16001 3.26942 4.08623 3.21999 4.00529 3.18644C3.92436 3.15289 3.83761 3.13562 3.75 3.13562C3.66239 3.13562 3.57564 3.15289 3.49471 3.18644C3.41377 3.21999 3.34025 3.26916 3.27833 3.33114L3.27781 3.33167C3.21582 3.39358 3.16665 3.46711 3.1331 3.54804C3.09955 3.62897 3.08228 3.71572 3.08228 3.80333C3.08228 3.89094 3.09955 3.97769 3.1331 4.05863C3.16665 4.13956 3.21582 4.21308 3.27781 4.275L3.32327 4.32046C3.57011 4.57281 3.73566 4.89334 3.79864 5.24067C3.86036 5.58109 3.82075 5.93198 3.68497 6.24985C3.56126 6.57422 3.34465 6.85511 3.06203 7.05725C2.7737 7.26348 2.42999 7.37819 2.07559 7.38648L2.06 7.38667H2C1.82319 7.38667 1.65362 7.4569 1.5286 7.58193C1.40357 7.70695 1.33333 7.87652 1.33333 8.05333C1.33333 8.23014 1.40357 8.39971 1.5286 8.52474C1.65362 8.64976 1.82319 8.72 2 8.72H2.11599C2.46053 8.72137 2.79715 8.82347 3.08441 9.01371C3.37067 9.20329 3.59547 9.47215 3.73134 9.78741C3.87272 10.1095 3.91474 10.4665 3.85197 10.8127C3.789 11.16 3.62341 11.4805 3.37658 11.7328L3.37143 11.7381L3.3314 11.7781C3.26942 11.84 3.21999 11.9138 3.18644 11.9947C3.15289 12.0756 3.13562 12.1624 3.13562 12.25C3.13562 12.3376 3.15289 12.4244 3.18644 12.5053C3.21999 12.5862 3.26916 12.6598 3.33114 12.7217L3.33167 12.7222C3.39358 12.7842 3.46711 12.8333 3.54804 12.8669C3.62897 12.9004 3.71572 12.9177 3.80333 12.9177C3.89094 12.9177 3.97769 12.9004 4.05863 12.8669C4.13956 12.8333 4.21309 12.7842 4.275 12.7222L4.32046 12.6767C4.57281 12.4299 4.89334 12.2643 5.24067 12.2014C5.58108 12.1396 5.93197 12.1792 6.24985 12.315C6.57422 12.4387 6.85511 12.6553 7.05725 12.938C7.26348 13.2263 7.37819 13.57 7.38648 13.9244L7.38667 13.94V14C7.38667 14.1768 7.4569 14.3464 7.58193 14.4714C7.70695 14.5964 7.87652 14.6667 8.05333 14.6667C8.23014 14.6667 8.39971 14.5964 8.52474 14.4714C8.64976 14.3464 8.72 14.1768 8.72 14V13.8867L8.72001 13.884C8.72138 13.5395 8.82347 13.2029 9.01371 12.9156C9.2033 12.6293 9.4722 12.4045 9.78749 12.2686C10.1096 12.1273 10.4665 12.0853 10.8127 12.148C11.16 12.211 11.4805 12.3766 11.7328 12.6234L11.7381 12.6286L11.7781 12.6686C11.84 12.7306 11.9138 12.78 11.9947 12.8136C12.0756 12.8471 12.1624 12.8644 12.25 12.8644C12.3376 12.8644 12.4244 12.8471 12.5053 12.8136C12.5862 12.78 12.6598 12.7308 12.7217 12.6689L12.7222 12.6683C12.7842 12.6064 12.8333 12.5329 12.8669 12.452C12.9004 12.371 12.9177 12.2843 12.9177 12.1967C12.9177 12.1091 12.9004 12.0223 12.8669 11.9414C12.8333 11.8604 12.7842 11.7869 12.7222 11.725L12.6767 11.6795C12.4299 11.4272 12.2643 11.1067 12.2014 10.7593C12.1386 10.4132 12.1806 10.0562 12.322 9.73416C12.4578 9.41887 12.6826 9.14997 12.9689 8.96037C13.2562 8.77014 13.5928 8.66805 13.9373 8.66667L13.94 8.66666L14 8.66667C14.1768 8.66667 14.3464 8.59643 14.4714 8.47141C14.5964 8.34638 14.6667 8.17681 14.6667 8C14.6667 7.82319 14.5964 7.65362 14.4714 7.5286C14.3464 7.40357 14.1768 7.33333 14 7.33333H13.8867L13.884 7.33333C13.5395 7.33195 13.2029 7.22986 12.9156 7.03963C12.6283 6.84939 12.403 6.5793 12.2672 6.26262C12.2431 6.20625 12.2269 6.14695 12.219 6.08641C12.1182 5.79865 12.0933 5.48888 12.148 5.18733C12.211 4.84 12.3766 4.5195 12.6234 4.26716L12.6286 4.2619L12.6686 4.22193C12.7306 4.16001 12.78 4.08622 12.8136 4.00529C12.8471 3.92436 12.8644 3.83761 12.8644 3.75C12.8644 3.66239 12.8471 3.57564 12.8136 3.49471C12.78 3.41378 12.7308 3.34025 12.6689 3.27833L12.6683 3.27781C12.6064 3.21582 12.5329 3.16665 12.452 3.1331C12.371 3.09955 12.2843 3.08228 12.1967 3.08228C12.1091 3.08228 12.0223 3.09955 11.9414 3.1331C11.8604 3.16665 11.7869 3.21583 11.725 3.27781L11.6795 3.32327C11.4272 3.57011 11.1067 3.73566 10.7593 3.79864C10.4132 3.86141 10.0562 3.81939 9.73408 3.67801C9.41882 3.54213 9.14995 3.31734 8.96037 3.03108C8.77014 2.74382 8.66805 2.4072 8.66667 2.06266L8.66667 2.06V2C8.66667 1.82319 8.59643 1.65362 8.47141 1.5286C8.34638 1.40357 8.17681 1.33333 8 1.33333Z"
                    fill="#25282B"
                  />
                </svg>
                Team Settings
              </button>
            </div>

            {/* Chart Container */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Chart Legend */}
              <div className="flex justify-end gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-[#948FB7]"></div>
                  <span className="font-lato text-[#948FB7] text-sm">
                    Results
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-[#948FB7] opacity-50"></div>
                  <span className="font-lato text-[#948FB7] text-sm">Avg.</span>
                </div>
              </div>

              {/* Chart Area */}
              <div className="relative h-64 md:h-80">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1000 300"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern
                      id="grid"
                      width="100"
                      height="60"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 100 0 L 0 0 0 60"
                        fill="none"
                        stroke="#E9EBF1"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Y-axis labels */}
                  <g className="font-lato text-xs fill-[#34314C]">
                    <text x="20" y="60" textAnchor="middle">
                      5
                    </text>
                    <text x="20" y="120" textAnchor="middle">
                      4
                    </text>
                    <text x="20" y="180" textAnchor="middle">
                      3
                    </text>
                    <text x="20" y="240" textAnchor="middle">
                      2
                    </text>
                    <text x="20" y="280" textAnchor="middle">
                      1
                    </text>
                  </g>

                  {/* Chart Line */}
                  <path
                    d="M50 250 Q150 200 250 180 Q350 120 450 100 Q550 140 650 160 Q750 120 850 80 Q900 70 950 75"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3FE3D2" />
                      <stop offset="40%" stopColor="#98DDAB" />
                      <stop offset="70%" stopColor="#FFC952" />
                      <stop offset="100%" stopColor="#FF7473" />
                    </linearGradient>
                  </defs>

                  {/* Data Points */}
                  <circle
                    cx="950"
                    cy="75"
                    r="8"
                    fill="white"
                    stroke="#98DDAB"
                    strokeWidth="3"
                    className="drop-shadow-lg"
                  />

                  {/* Mood indicators on y-axis */}
                  <circle cx="8" cy="60" r="8" fill="#3FE3D2" opacity="0.5" />
                  <circle cx="8" cy="120" r="8" fill="#98DDAB" opacity="0.5" />
                  <circle cx="8" cy="180" r="8" fill="#FFC952" opacity="0.5" />
                  <circle cx="8" cy="240" r="8" fill="#FF7473" opacity="0.5" />
                  <circle cx="8" cy="280" r="8" fill="#FE346E" opacity="0.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Section - Poll Results and CTA */}
          <div className="space-y-6">
            {/* Last Poll Result */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-merriweather text-[#34314C] text-xl">
                  Last poll result
                </h3>
                <span className="font-lato text-[#948FB7] text-sm">
                  Monday, July 9th, 2020
                </span>
              </div>

              {/* Score Display */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-[#98DDAB] rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-lato text-[#34314C] text-4xl font-light">
                      3,7
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-lato text-[#34314C] text-2xl font-light">
                    9/20
                  </div>
                  <div className="font-merriweather text-[#948FB7] text-sm">
                    Participation
                  </div>
                  <div className="font-lato text-[#948FB7] text-sm">
                    Usually 12 people participate
                  </div>
                </div>
              </div>

              <div className="text-[#948FB7] text-sm mb-6">
                7% below average
              </div>

              {/* Poll Results Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#3FE3D2] flex items-center justify-center">
                    <span className="font-lato text-black text-lg">70</span>
                  </div>
                  <div className="flex-1 bg-[#3FE3D2] opacity-50 h-4 rounded-r-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#98DDAB] flex items-center justify-center">
                    <span className="font-lato text-black text-lg">12</span>
                  </div>
                  <div className="w-24 bg-[#98DDAB] opacity-50 h-4 rounded-r-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#FFC952] flex items-center justify-center">
                    <span className="font-lato text-black text-lg">5</span>
                  </div>
                  <div className="w-8 bg-[#FFC952] opacity-50 h-4 rounded-r-full"></div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-[#FF7473] border-dashed flex items-center justify-center">
                  <span className="font-lato text-black text-lg"></span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#FE346E] flex items-center justify-center">
                    <span className="font-lato text-black text-lg">42</span>
                  </div>
                  <div className="w-64 bg-[#FE346E] opacity-50 h-4 rounded-r-full"></div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="font-lato text-[#34314C] text-sm mb-4">
                You haven't participated yet.
              </p>
              <button className="w-full bg-[#34314C] text-white font-lato font-bold px-6 py-4 rounded-tl-xl rounded-br-xl shadow-lg">
                Share your mood
              </button>
            </div>
          </div>
        </div>

        {/* Team Member Cards Grid */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Sample Team Member Cards */}
            {[
              {
                name: "Miryam Moreno",
                initials: "MM",
                mood: "neutral",
                color: "#FFC952",
              },
              {
                name: "Susana Riegp",
                initials: "SR",
                mood: "happy",
                color: "#3FE3D2",
                quote: "De 10",
              },
              {
                name: "Joanna Marinari",
                initials: "SM",
                mood: "happy",
                color: "#98DDAB",
                quote: "¡Viernes!",
              },
              {
                name: "Aythami Moreno",
                initials: "AM",
                mood: "sad",
                color: "#FF7473",
                quote: "Un caos",
              },
              {
                name: "Aythami Moreno",
                initials: "AY",
                mood: "neutral",
                color: "#FFC952",
              },
              {
                name: "Susana Riegp",
                initials: "SR",
                mood: "happy",
                color: "#3FE3D2",
                quote: "De 10",
              },
              {
                name: "Joanna Marinari",
                initials: "SM",
                mood: "happy",
                color: "#98DDAB",
                quote: "¡Viernes!",
              },
              {
                name: "Aythami Moreno",
                initials: "AM",
                mood: "sad",
                color: "#FF7473",
                quote: "Un caos",
              },
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                {/* User Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#948FB7] border-opacity-10 bg-[#948FB7] bg-opacity-10 flex items-center justify-center">
                    <span className="font-lato text-[#34314C] text-lg">
                      {member.initials}
                    </span>
                  </div>
                  <span className="font-merriweather text-[#34314C] text-sm">
                    {member.name}
                  </span>
                </div>

                {/* Mood Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.mood === "happy" && (
                      <div className="text-[#34314C]">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 80 80"
                          fill="none"
                        >
                          <path
                            d="M33.361 45.9471C33.361 46.5555 33.744 47.0961 34.3235 47.2814C36.4284 47.9543 41.5412 49.4577 45.1505 49.4395C48.6194 49.4221 53.5226 47.9502 55.5666 47.284C56.1411 47.0968 56.5189 46.5594 56.5189 45.9551C56.5189 44.9779 55.5596 44.2792 54.6213 44.5524C52.2561 45.2411 48.1589 46.2926 45.1505 46.3065C42.0005 46.3211 37.6955 45.2378 35.2544 44.5401C34.3163 44.272 33.361 44.9714 33.361 45.9471Z"
                            fill="#34314C"
                          />
                          <path
                            d="M30.4924 32.5977C30.4924 31.435 31.4349 30.4924 32.5976 30.4924C33.7603 30.4924 34.7029 31.435 34.7029 32.5977V34.703C34.7029 35.8657 33.7603 36.8082 32.5976 36.8082C31.4349 36.8082 30.4924 35.8657 30.4924 34.703V32.5977Z"
                            fill="#34314C"
                          />
                          <path
                            d="M54.4923 32.5977C54.4923 31.435 55.4348 30.4924 56.5975 30.4924C57.7602 30.4924 58.7028 31.435 58.7028 32.5977V34.703C58.7028 35.8657 57.7602 36.8082 56.5975 36.8082C55.4348 36.8082 54.4923 35.8657 54.4923 34.703V32.5977Z"
                            fill="#34314C"
                          />
                        </svg>
                      </div>
                    )}
                    {member.mood === "neutral" && (
                      <div className="text-[#34314C]">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 80 80"
                          fill="none"
                        >
                          <path
                            d="M33.361 46.703C33.361 45.8891 34.0208 45.2293 34.8347 45.2293H55.0452C55.8591 45.2293 56.5189 45.8891 56.5189 46.703C56.5189 47.5168 55.8591 48.1766 55.0452 48.1766H34.8347C34.0208 48.1766 33.361 47.5168 33.361 46.703Z"
                            fill="#34314C"
                          />
                          <path
                            d="M30.4923 32.5977C30.4923 31.435 31.4349 30.4924 32.5976 30.4924C33.7603 30.4924 34.7028 31.435 34.7028 32.5977V34.703C34.7028 35.8657 33.7603 36.8082 32.5976 36.8082C31.4349 36.8082 30.4923 35.8657 30.4923 34.703V32.5977Z"
                            fill="#34314C"
                          />
                          <path
                            d="M54.4923 32.5977C54.4923 31.435 55.4349 30.4924 56.5976 30.4924C57.7603 30.4924 58.7028 31.435 58.7028 32.5977V34.703C58.7028 35.8657 57.7603 36.8082 56.5976 36.8082C55.4349 36.8082 54.4923 35.8657 54.4923 34.703V32.5977Z"
                            fill="#34314C"
                          />
                        </svg>
                      </div>
                    )}
                    {member.mood === "sad" && (
                      <div className="text-[#34314C]">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 80 80"
                          fill="none"
                        >
                          <path
                            d="M33.4397 47.4587C33.4397 46.8503 33.8227 46.3097 34.4022 46.1245C36.5071 45.4516 41.6199 43.9481 45.2292 43.9663C48.6981 43.9837 53.6014 45.4556 55.6453 46.1218C56.2198 46.309 56.5976 46.8464 56.5976 47.4507C56.5976 48.4279 55.6383 49.1266 54.7 48.8534C52.3348 48.1647 48.2376 47.1132 45.2292 47.0993C42.0792 47.0847 37.7742 48.1681 35.3331 48.8657C34.395 49.1338 33.4397 48.4344 33.4397 47.4587Z"
                            fill="#34314C"
                          />
                          <path
                            d="M30.4924 32.5977C30.4924 31.435 31.4349 30.4924 32.5976 30.4924C33.7603 30.4924 34.7029 31.435 34.7029 32.5977V34.703C34.7029 35.8657 33.7603 36.8082 32.5976 36.8082C31.4349 36.8082 30.4924 35.8657 30.4924 34.703V32.5977Z"
                            fill="#34314C"
                          />
                          <path
                            d="M54.4923 32.5977C54.4923 31.435 55.4349 30.4924 56.5976 30.4924C57.7603 30.4924 58.7029 31.435 58.7029 32.5977V34.703C58.7029 35.8657 57.7603 36.8082 56.5976 36.8082C55.4349 36.8082 54.4923 35.8657 54.4923 34.703V32.5977Z"
                            fill="#34314C"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quote */}
                {member.quote && (
                  <div className="flex items-center gap-2">
                    <svg width="11" height="12" viewBox="0 0 11 12" fill="none">
                      <path
                        d="M1.33781 11.358C0.761806 10.41 0.371806 9.42 0.167806 8.388C-0.0361935 7.356 -0.0541935 6.342 0.113806 5.346C0.281806 4.35 0.629806 3.396 1.15781 2.484C1.69781 1.56 2.41781 0.732 3.31781 0L4.70381 0.845999C4.94381 1.002 5.05181 1.194 5.02781 1.422C5.00381 1.65 4.92581 1.83 4.79381 1.962C4.54181 2.262 4.30181 2.658 4.07381 3.15C3.84581 3.642 3.68381 4.194 3.58781 4.806C3.50381 5.418 3.51581 6.072 3.62381 6.768C3.73181 7.464 4.00181 8.16 4.43381 8.856C4.64981 9.204 4.70981 9.51 4.61381 9.774C4.51781 10.026 4.31981 10.206 4.01981 10.314L1.33781 11.358ZM7.31381 11.358C6.73781 10.41 6.34781 9.42 6.14381 8.388C5.93981 7.356 5.92181 6.342 6.08981 5.346C6.25781 4.35 6.60581 3.396 7.13381 2.484C7.67381 1.56 8.39381 0.732 9.29381 0L10.6798 0.845999C10.9198 1.002 11.0278 1.194 11.0038 1.422C10.9798 1.65 10.9018 1.83 10.7698 1.962C10.5178 2.262 10.2778 2.658 10.0498 3.15C9.82181 3.642 9.65981 4.194 9.56381 4.806C9.47981 5.418 9.49181 6.072 9.59981 6.768C9.70781 7.464 9.97781 8.16 10.4098 8.856C10.6258 9.204 10.6858 9.51 10.5898 9.774C10.4938 10.026 10.2958 10.206 9.99581 10.314L7.31381 11.358Z"
                        fill="#948FB7"
                      />
                    </svg>
                    <span className="font-lato text-[#948FB7] text-sm">
                      {member.quote}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-[#3FE3D2] opacity-50 rounded-full"></div>
            <div className="w-4 h-4 bg-[#98DDAB] opacity-75 rounded-full"></div>
            <div className="w-4 h-4 bg-[#FFC952] rounded-full"></div>
            <div className="w-4 h-4 bg-[#FF7473] opacity-75 rounded-full"></div>
            <div className="w-4 h-4 bg-[#FE346E] opacity-50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed bottom-0 left-0 w-full h-64 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FE346E] opacity-25 rounded-full"></div>
        <div className="absolute bottom-8 left-48 w-24 h-24 bg-[#FF7473] opacity-25 rounded-full"></div>
        <div className="absolute bottom-4 left-96 w-20 h-20 bg-[#98DDAB] opacity-25 rounded-full"></div>
        <div className="absolute bottom-12 right-64 w-28 h-28 bg-[#3FE3D2] opacity-25 rounded-full"></div>
        <div className="absolute bottom-0 right-32 w-36 h-36 bg-[#FFC952] opacity-25 rounded-full"></div>
      </div>
    </div>
  );
}
