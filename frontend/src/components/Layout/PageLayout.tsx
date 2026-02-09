import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { MessengerWidget } from '../MessengerWidget';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

interface PageLayoutProps {
  children: React.ReactNode;
  
  // Header options
  showHeader?: boolean;
  headerVariant?: 'default' | 'simple';
  headerTitle?: string;
  showSearch?: boolean;
  backButton?: {
    show: boolean;
    onClick: () => void;
    label?: string;
  };
  
  // Footer options
  showFooter?: boolean;
  
  // Mobile nav
  showMobileNav?: boolean;
  activePage?: string;
  
  // Messenger widget
  showMessenger?: boolean;
  
  // Layout options
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: boolean;
  backgroundColor?: string;
}

export function PageLayout({
  children,
  showHeader = true,
  headerVariant = 'default',
  headerTitle,
  showSearch = true,
  backButton,
  showFooter = true,
  showMobileNav = true,
  activePage = 'home',
  showMessenger = true,
  maxWidth = '7xl',
  padding = true,
  backgroundColor = 'bg-gray-50',
}: PageLayoutProps) {
  const { user } = useAuth();
  const { cartItemCount } = useCart();
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`min-h-screen ${backgroundColor} flex flex-col`}>
      {/* Header */}
      {showHeader && (
        <Header
          showSearch={showSearch}
          variant={headerVariant}
          backButton={backButton}
          title={headerTitle}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${padding ? 'py-6' : ''}`}>
        <div className={`${maxWidthClasses[maxWidth]} mx-auto ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && <Footer />}

      {/* Mobile Navigation */}
      {showMobileNav && (
        <MobileNav
          activePage={activePage}
        />
      )}

      {/* Messenger Widget */}
      {showMessenger && user && <MessengerWidget />}
    </div>
  );
}
