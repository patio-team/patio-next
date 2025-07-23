import { getMoodEntries } from '@/db/mood-entries';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from 'lucide-react';
import { Mood, Smile } from './smile';
import Link from 'next/link';

export async function DayResult({
  entries,
  teamId,
}: {
  entries: Awaited<ReturnType<typeof getMoodEntries>>;
  teamId: string;
}) {
  return (
    <div className="columns-4 gap-4">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="z-10 mb-4 break-inside-avoid rounded-xl bg-white p-2 p-6 shadow-lg">
          {/* User Avatar */}
          <div className="mb-4 flex items-center gap-4">
            <div className="border-opacity-10 bg-opacity-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#948FB7] bg-[#948FB7]">
              <span className="text-primary text-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={entry.user?.image || ''}
                    alt={entry.user?.name || ''}
                  />
                  <AvatarFallback>
                    <User className="h-4 w-16" />
                  </AvatarFallback>
                </Avatar>
              </span>
            </div>
            <span className="font-merriweather text-primary text-sm">
              <Link href={`/team/${teamId}/member/${entry.user.id}`}>
                {entry.user.name}
              </Link>
            </span>
          </div>

          <div className="mb-4 flex justify-center">
            <Smile mood={('mood' + entry.rating) as Mood} />
          </div>

          {/* Quote */}
          {entry.comment && (
            <div className="flex items-center gap-2">
              <svg
                width="11"
                height="12"
                viewBox="0 0 11 12"
                fill="none">
                <path
                  d="M1.33781 11.358C0.761806 10.41 0.371806 9.42 0.167806 8.388C-0.0361935 7.356 -0.0541935 6.342 0.113806 5.346C0.281806 4.35 0.629806 3.396 1.15781 2.484C1.69781 1.56 2.41781 0.732 3.31781 0L4.70381 0.845999C4.94381 1.002 5.05181 1.194 5.02781 1.422C5.00381 1.65 4.92581 1.83 4.79381 1.962C4.54181 2.262 4.30181 2.658 4.07381 3.15C3.84581 3.642 3.68381 4.194 3.58781 4.806C3.50381 5.418 3.51581 6.072 3.62381 6.768C3.73181 7.464 4.00181 8.16 4.43381 8.856C4.64981 9.204 4.70981 9.51 4.61381 9.774C4.51781 10.026 4.31981 10.206 4.01981 10.314L1.33781 11.358ZM7.31381 11.358C6.73781 10.41 6.34781 9.42 6.14381 8.388C5.93981 7.356 5.92181 6.342 6.08981 5.346C6.25781 4.35 6.60581 3.396 7.13381 2.484C7.67381 1.56 8.39381 0.732 9.29381 0L10.6798 0.845999C10.9198 1.002 11.0278 1.194 11.0038 1.422C10.9798 1.65 10.9018 1.83 10.7698 1.962C10.5178 2.262 10.2778 2.658 10.0498 3.15C9.82181 3.642 9.65981 4.194 9.56381 4.806C9.47981 5.418 9.49181 6.072 9.59981 6.768C9.70781 7.464 9.97781 8.16 10.4098 8.856C10.6258 9.204 10.6858 9.51 10.5898 9.774C10.4938 10.026 10.2958 10.206 9.99581 10.314L7.31381 11.358Z"
                  fill="#948FB7"
                />
              </svg>
              <div
                className="text-sm text-[#948FB7]"
                dangerouslySetInnerHTML={{ __html: entry.comment }}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
