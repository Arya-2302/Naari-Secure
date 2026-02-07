import { Home, Navigation, Shield, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: Navigation, label: t('travel'), path: '/travel', hidden: user?.role === 'guardian' },
    { icon: Shield, label: user?.role === 'guardian' ? t('track') : t('safeZones'), path: '/safe-zones' },

    { icon: User, label: t('profile'), path: '/profile' },
  ].filter(item => !item.hidden);

  return (
    <nav className="bottom-nav md:hidden z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
