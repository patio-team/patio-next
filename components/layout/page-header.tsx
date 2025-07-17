'use client';

import { Session } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ChevronDown } from 'lucide-react';
import { signOut as authSignOut } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { User, LogOut, CirclePlus } from 'lucide-react';
import { TeamMemberWithTeam } from '@/db/schema';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Logo from '../ui/logo';

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface PageHeaderProps {
  user: Session['user'];
  userTeams: TeamMemberWithTeam[];
  currentTeamId?: string;
}

export default function PageHeader({
  user,
  userTeams,
  currentTeamId,
}: PageHeaderProps) {
  const signOut = () => {
    authSignOut();
    redirect('/login');
  };

  const currentTeam = userTeams.find((team) => team.teamId === currentTeamId);

  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm md:px-16">
      {/* Logo */}
      <div className="flex items-center">
        <Logo size="small" />
      </div>

      <div className="flex items-center gap-4">
        {currentTeam && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2">
              {currentTeam.team.name} <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {userTeams.map((userTeam) => (
                <DropdownMenuItem
                  key={userTeam.teamId}
                  asChild
                  className="cursor-pointer">
                  <Link
                    href={`/team/${userTeam.teamId}`}
                    className="flex w-full items-center">
                    <span className="truncate">{userTeam.team.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/new-team"
                  className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
                  <CirclePlus />
                  Create New Team
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="cursor-pointer">
            <Avatar className="h-12 w-12">
              <AvatarImage
                sizes="(140px, 140px)"
                src={user?.image || ''}
                alt={user?.name || ''}
              />
              <AvatarFallback>
                <User className="h-4 w-16" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">{user?.name}</p>
                <p className="text-muted-foreground text-xs leading-none">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
