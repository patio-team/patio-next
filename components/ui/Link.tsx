import Link from 'next/link';

export function PatioLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`bg-[#34314C] text-white font-lato font-bold px-6 py-4 rounded-tl-xl rounded-br-xl shadow-lg ${className}`}>
      {children}
    </Link>
  );
}
