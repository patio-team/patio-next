interface PollResult {
  label: string;
  value: number;
  color: string;
  emoji: React.ReactNode;
}

interface PollResultsProps {
  score: number;
  participants: number;
  totalExpected: number;
  averageChange: number;
  date: string;
  results: PollResult[];
}

export default function PollResults({
  score,
  participants,
  totalExpected,
  averageChange,
  date,
  results,
}: PollResultsProps) {
  const maxValue = Math.max(...results.map((r) => r.value));

  return (
    <div className="max-w-[644px] rounded-xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between sm:flex-row">
        <h2 className="font-merriweather text-2xl font-normal text-[#34314C]">
          Last poll result
        </h2>
        <span className="font-lato mt-1 text-base text-[#948FB7] sm:mt-0">
          {date}
        </span>
      </div>

      {/* Score and Participation Info */}
      <div className="mb-8 flex flex-col items-start gap-8 lg:flex-row">
        {/* Score Circle */}
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-[#98DDAB]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-lato text-4xl leading-none font-light text-[#34314C]">
                {score.toFixed(1).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Participation */}
          <div className="space-y-1">
            <div className="font-merriweather text-base text-[#948FB7]">
              Participation
            </div>
            <div className="font-lato text-2xl font-light text-[#34314C]">
              {participants}/{totalExpected}
            </div>
            <div className="font-lato text-base text-[#948FB7]">
              Usually {totalExpected} people participate
            </div>
          </div>
        </div>
      </div>

      {/* Below Average */}
      <div className="font-lato mb-8 text-base text-[#948FB7]">
        {Math.abs(averageChange)}% {averageChange < 0 ? 'below' : 'above'}{' '}
        average
      </div>

      {/* Results Chart */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="flex items-center gap-4">
            {/* Emoji/Value Circle */}
            <div
              className="font-lato relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 text-lg text-[#191825]"
              style={{ borderColor: result.color }}>
              {result.value > 0 ? (
                <span>{result.value}</span>
              ) : (
                <div
                  className="h-full w-full rounded-full border-4 border-dashed"
                  style={{ borderColor: result.color }}></div>
              )}
            </div>

            {/* Label */}
            <div className="w-24 flex-shrink-0">
              <span className="font-lato text-sm text-[#191825]">
                {result.label}
              </span>
            </div>

            {/* Bar Chart */}
            <div className="flex flex-1 items-center">
              {result.value > 0 && (
                <>
                  <div
                    className="h-4 rounded-r-full opacity-50"
                    style={{
                      backgroundColor: result.color,
                      width: `${(result.value / maxValue) * 100}%`,
                      minWidth: '2rem',
                    }}></div>
                  <span className="font-lato ml-3 flex-shrink-0 text-base text-[#191825]">
                    {result.value}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Background Lines (decorative) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="grid h-full grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-r border-[#F3F3F7]"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example usage component
export function PollResultsExample() {
  const sampleResults: PollResult[] = [
    {
      label: 'Very Good',
      value: 70,
      color: '#3FE3D2',
      emoji: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none">
          <circle
            cx="16"
            cy="16"
            r="16"
            fill="#3FE3D2"
          />
          <path
            d="M13.3447 18.2919C13.3447 18.5894 13.5327 18.8539 13.8163 18.9434C14.7051 19.2238 16.6641 19.7862 18.0605 19.7792C19.3998 19.7725 21.2735 19.2237 22.1375 18.9459C22.421 18.8548 22.6079 18.5897 22.6079 18.292C22.6079 17.9038 22.2941 17.5889 21.906 17.5882C20.9699 17.5863 19.2885 17.5843 18.0605 17.59C16.7761 17.5959 15.0117 17.5936 14.0462 17.5916C13.6588 17.5907 13.3447 17.9045 13.3447 18.2919Z"
            fill="#34314C"
          />
          <path
            d="M12.1973 13.0389C12.1973 12.5738 12.5743 12.1968 13.0394 12.1968C13.5045 12.1968 13.8815 12.5738 13.8815 13.0389V13.881C13.8815 14.3461 13.5045 14.7231 13.0394 14.7231C12.5743 14.7231 12.1973 14.3461 12.1973 13.881V13.0389Z"
            fill="#34314C"
          />
          <path
            d="M21.7972 13.0389C21.7972 12.5738 22.1743 12.1968 22.6393 12.1968C23.1044 12.1968 23.4814 12.5738 23.4814 13.0389V13.881C23.4814 14.3461 23.1044 14.7231 22.6393 14.7231C22.1743 14.7231 21.7972 14.3461 21.7972 13.881V13.0389Z"
            fill="#34314C"
          />
        </svg>
      ),
    },
    {
      label: 'Good',
      value: 12,
      color: '#98DDAB',
      emoji: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none">
          <circle
            cx="16"
            cy="16"
            r="16"
            fill="#98DDAB"
          />
          <path
            d="M13.3447 18.3786C13.3447 18.622 13.4979 18.8382 13.7297 18.9123C14.5717 19.1815 16.6168 19.7829 18.0605 19.7756C19.4481 19.7686 21.4094 19.1799 22.227 18.9134C22.4568 18.8385 22.6079 18.6236 22.6079 18.3819C22.6079 17.991 22.2242 17.7115 21.8488 17.8208C20.9027 18.0962 19.2639 18.5168 18.0605 18.5224C16.8005 18.5283 15.0785 18.0949 14.1021 17.8159C13.7268 17.7086 13.3447 17.9884 13.3447 18.3786Z"
            fill="#34314C"
          />
          <path
            d="M12.1973 13.0389C12.1973 12.5738 12.5743 12.1968 13.0394 12.1968C13.5045 12.1968 13.8815 12.5738 13.8815 13.0389V13.881C13.8815 14.3461 13.5045 14.7231 13.0394 14.7231C12.5743 14.7231 12.1973 14.3461 12.1973 13.881V13.0389Z"
            fill="#34314C"
          />
          <path
            d="M21.7972 13.0389C21.7972 12.5738 22.1743 12.1968 22.6393 12.1968C23.1044 12.1968 23.4814 12.5738 23.4814 13.0389V13.881C23.4814 14.3461 23.1044 14.7231 22.6393 14.7231C22.1743 14.7231 21.7972 14.3461 21.7972 13.881V13.0389Z"
            fill="#34314C"
          />
        </svg>
      ),
    },
    {
      label: 'Neutral',
      value: 5,
      color: '#FFC952',
      emoji: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none">
          <circle
            cx="16"
            cy="16"
            r="16"
            fill="#FFC952"
          />
          <path
            d="M13.3448 18.681C13.3448 18.3554 13.6087 18.0915 13.9342 18.0915H22.0184C22.344 18.0915 22.6079 18.3554 22.6079 18.681C22.6079 19.0065 22.344 19.2705 22.0184 19.2705H13.9342C13.6087 19.2705 13.3448 19.0065 13.3448 18.681Z"
            fill="#34314C"
          />
          <path
            d="M12.1973 13.0389C12.1973 12.5738 12.5743 12.1968 13.0394 12.1968C13.5045 12.1968 13.8815 12.5738 13.8815 13.0389V13.881C13.8815 14.3461 13.5045 14.7231 13.0394 14.7231C12.5743 14.7231 12.1973 14.3461 12.1973 13.881V13.0389Z"
            fill="#34314C"
          />
          <path
            d="M21.7973 13.0389C21.7973 12.5738 22.1743 12.1968 22.6394 12.1968C23.1044 12.1968 23.4815 12.5738 23.4815 13.0389V13.881C23.4815 14.3461 23.1044 14.7231 22.6394 14.7231C22.1743 14.7231 21.7973 14.3461 21.7973 13.881V13.0389Z"
            fill="#34314C"
          />
        </svg>
      ),
    },
    {
      label: 'Bad',
      value: 0,
      color: '#C3C1D7',
      emoji: null,
    },
    {
      label: 'Very Bad',
      value: 42,
      color: '#FE346E',
      emoji: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none">
          <circle
            cx="16"
            cy="16"
            r="16"
            fill="#FE346E"
          />
          <path
            d="M13.3762 18.6299C13.3762 18.352 13.5544 18.1066 13.821 18.0286C14.6967 17.7725 16.6814 17.2428 18.092 17.2493C19.4455 17.2556 21.345 17.7729 22.1963 18.0266C22.4619 18.1057 22.6394 18.3511 22.6394 18.6283C22.6394 18.9829 22.3519 19.2703 21.9973 19.2703C19.1437 19.2703 16.7407 19.2703 14.0168 19.2703C13.6631 19.2703 13.3762 18.9835 13.3762 18.6299Z"
            fill="#34314C"
          />
          <path
            d="M12.1973 13.0389C12.1973 12.5738 12.5743 12.1968 13.0394 12.1968C13.5045 12.1968 13.8815 12.5738 13.8815 13.0389V13.881C13.8815 14.3461 13.5045 14.7231 13.0394 14.7231C12.5743 14.7231 12.1973 14.3461 12.1973 13.881V13.0389Z"
            fill="#34314C"
          />
          <path
            d="M21.7973 13.0389C21.7973 12.5738 22.1743 12.1968 22.6394 12.1968C23.1045 12.1968 23.4815 12.5738 23.4815 13.0389V13.881C23.4815 14.3461 23.1045 14.7231 22.6394 14.7231C22.1743 14.7231 21.7973 14.3461 21.7973 13.881V13.0389Z"
            fill="#34314C"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-8">
      <PollResults
        score={3.7}
        participants={9}
        totalExpected={20}
        averageChange={-7}
        date="Monday, July 9th, 2020"
        results={sampleResults}
      />
    </div>
  );
}
