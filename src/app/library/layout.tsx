import { HomeNav } from '@/components/HomeNav';
import type { ReactNode } from 'react';

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HomeNav />
      {children}
    </>
  );
}
