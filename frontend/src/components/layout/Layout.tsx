import { ReactNode } from 'react';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';
import SOSButton from '../sos/SOSButton';
import FakeCallOverlay from '../FakeCallOverlay';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen gradient-bg">
      <DesktopNav />
      <main className="pb-24 md:pb-8 md:pt-20">
        {children}
      </main>
      <MobileNav />
      <SOSButton />
      <FakeCallOverlay />
    </div>
  );
};

export default Layout;
