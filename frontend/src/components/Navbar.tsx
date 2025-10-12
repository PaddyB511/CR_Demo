import React from 'react';
import logoUrl from '@/assets/logo.svg'; // Vite turns this into a hashed URL

type Props = { title?: string };

export default function Navbar({ title = 'Premium' }: Props) {
  // Fallback to public/ if someone later moves the file
  const publicLogo = `${import.meta.env.BASE_URL}logo.svg`;
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-black/10 bg-white px-4">
      <img
        ref={imgRef}
        src={logoUrl}
        alt="Logo"
        width={32}
        height={32}
        className="block"
        style={{ display: 'block', outline: '1px solid transparent' }}
        onError={() => {
          // if the bundled URL ever fails, try the public one
          if (imgRef.current) imgRef.current.src = publicLogo;
        }}
      />
      <span className="text-lg font-semibold">{title}</span>
    </header>
  );
}
