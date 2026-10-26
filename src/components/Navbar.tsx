import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenConsultation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenConsultation }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Works', path: '/works' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F8F5EF]/90 dark:bg-[#171412]/90 border-b border-[#E2D9CC] dark:border-[#2D2622] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Logo & Brand Wordmark */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-3.5 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <img
            src="/logo.jpeg"
            alt="Emiland’s Interior Logo"
            className="w-11 h-11 rounded-full object-cover border border-[#E2D9CC] dark:border-[#38312B] shadow-sm group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-heading text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#302720] dark:text-[#F5EFE6] group-hover:text-[#6F4E37] dark:group-hover:text-[#D4A373] transition-colors whitespace-nowrap block leading-tight">
              Emiland’s Interior
            </span>
            <span className="text-[11px] tracking-wider text-[#A67C52] dark:text-[#D4A373] font-medium block leading-tight mt-0.5">
              Beauty and Quality
            </span>
          </div>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium tracking-wide">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`transition-colors whitespace-nowrap shrink-0 relative py-1 cursor-pointer focus:outline-none ${
                  isActive
                    ? 'text-[#6F4E37] dark:text-[#D4A373] font-semibold'
                    : 'text-[#302720] dark:text-[#F5EFE6] hover:text-[#6F4E37] dark:hover:text-[#D4A373]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#6F4E37] dark:bg-[#D4A373] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme switcher + Primary Action (Admin access removed from navbar, access via /admin) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg text-[#302720] dark:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4A373]" /> : <Moon className="w-4 h-4 text-[#6F4E37]" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenConsultation}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] rounded-lg transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            Book Consultation
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-[#302720] dark:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F5EF] dark:bg-[#171412] border-b border-[#E2D9CC] dark:border-[#2D2622] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className="text-left py-2 text-base font-medium text-[#302720] dark:text-[#F5EFE6] hover:text-[#6F4E37]"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-[#E2D9CC] dark:border-[#2D2622]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] dark:bg-[#A67C52] rounded-lg cursor-pointer"
            >
              Book Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
