import { Home, Search, Store, User, ShoppingBag } from 'lucide-react';

interface MobileNavProps {
  currentUser: any;
  onNavigate: (page: string, id?: string) => void;
  activePage?: string;
}

export function MobileNav({ currentUser, onNavigate, activePage = 'home' }: MobileNavProps) {
  const navItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: Home,
      onClick: () => onNavigate('home'),
    },
    {
      id: 'marketplace',
      label: 'Mua sắm',
      icon: ShoppingBag,
      onClick: () => onNavigate('marketplace'),
    },
    {
      id: 'search',
      label: 'Tìm kiếm',
      icon: Search,
      onClick: () => onNavigate('search-results'),
    },
    ...(currentUser.role === 'seller' 
      ? [{
          id: 'store',
          label: 'Cửa hàng',
          icon: Store,
          onClick: () => onNavigate('store', currentUser.id),
        }]
      : [{
          id: 'become-seller',
          label: 'Bán hàng',
          icon: Store,
          onClick: () => onNavigate('become-seller'),
        }]
    ),
    {
      id: 'profile',
      label: 'Cá nhân',
      icon: User,
      onClick: () => onNavigate('profile'),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
