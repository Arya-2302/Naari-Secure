import { ReactNode } from 'react';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';
import SOSButton from '../sos/SOSButton';
import FakeCallOverlay from '../FakeCallOverlay';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isSosActive } = useApp();

  return (
    <div className="min-h-screen gradient-bg text-foreground">
      <DesktopNav />
      <main className={cn(
        "pb-24 md:pb-8 transition-all duration-300",
        // Base padding (accounting for top nav on desktop)
        "pt-4 md:pt-20",
        // Extra padding if SOS banner is active to prevent overlapping content
        isSosActive && "pt-24 md:pt-40"
      )}>
        {children}
      </main>
      <MobileNav />
      <SOSButton />
      <FakeCallOverlay />
    </div>
  );
};

export default Layout;
