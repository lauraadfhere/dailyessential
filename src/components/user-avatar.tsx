'use client';

import { avatarFallback } from '../lib/portal-session';

type UserAvatarProps = {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: string;
  showStatus?: boolean;
  className?: string;
};

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-16 w-16',
  xl: 'h-[88px] w-[88px]',
};

const statusTone = (status?: string) => {
  const value = (status || '').toLowerCase();
  if (value === 'active' || value === 'verified') return 'bg-emerald-500';
  if (value === 'pending') return 'bg-amber-400';
  if (value === 'inactive') return 'bg-slate-400';
  return 'bg-[#1738a8]';
};

export default function UserAvatar({
  src,
  name = 'Daily Essential',
  size = 'md',
  status = 'active',
  showStatus = true,
  className = '',
}: UserAvatarProps) {
  const image = src || avatarFallback(name);

  return (
    <span className={`relative inline-block shrink-0 ${sizes[size]} ${className}`}>
      <span className="absolute inset-0 overflow-hidden rounded-full bg-[#e8eefc] ring-2 ring-white/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </span>
      {showStatus && (
        <span
          title={status || 'status'}
          className={`absolute z-10 rounded-full ring-2 ring-white ${statusTone(status)} ${
            size === 'xl' ? 'bottom-0.5 right-0.5 h-4 w-4' : size === 'sm' ? 'bottom-0 right-0 h-2 w-2' : 'bottom-0 right-0 h-2.5 w-2.5'
          }`}
        />
      )}
    </span>
  );
}
