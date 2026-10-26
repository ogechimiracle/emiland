import React from 'react';
import { SiteSettings } from '../types';
import { MessageSquare, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  settings: Partial<SiteSettings>;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E2D9CC] dark:border-[#2D2622] bg-[#EDE5D8]/50 dark:bg-[#1E1A17] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand & Studio Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo.jpeg"
                alt="Emiland’s Interior Logo"
                className="w-12 h-12 rounded-full object-cover border border-[#E2D9CC] dark:border-[#38312B] shadow-sm"
              />
              <div className="space-y-0.5">
                <span className="font-serif text-2xl tracking-wider uppercase font-semibold text-[#302720] dark:text-[#F5EFE6]">
                  {settings.studioName || "Emiland’s Interior"}
                </span>
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
                  {settings.studioTagline || 'Beauty and Quality'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#786D63] dark:text-[#A3968A] max-w-md leading-relaxed">
              {settings.studioDescription ||
                'A furniture, cabinetry, and interior design company built on over five years of hands-on industry experience, exceptional craftsmanship, and enduring spaces.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs tracking-wider text-[#302720] dark:text-[#F5EFE6]">
              <span>Luxury Cabinetry</span>
              <span aria-hidden="true">·</span>
              <span>Fitted Wardrobes</span>
              <span aria-hidden="true">·</span>
              <span>Bespoke Furniture</span>
              <span aria-hidden="true">·</span>
              <span>Wall Panels</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#302720] dark:text-[#F5EFE6]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-[#786D63] dark:text-[#A3968A]">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/works')}
                  className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Selected Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Services & Specialties
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  About Emiland’s
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Contact & Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Address */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#302720] dark:text-[#F5EFE6]">
              Get in Touch
            </h4>
            <div className="space-y-2 text-sm text-[#786D63] dark:text-[#A3968A]">
              <p className="leading-snug">{settings.studioAddress || 'Design Studio & Workshop'}</p>
              <p>
                <a
                  href={`mailto:${settings.contactEmail || 'contact@emilandsinterior.com'}`}
                  className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors"
                >
                  {settings.contactEmail || 'contact@emilandsinterior.com'}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${settings.contactPhone || '+1 (555) 382-7400'}`}
                  className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors"
                >
                  {settings.contactPhone || '+1 (555) 382-7400'}
                </a>
              </p>

              {settings.whatsappNumber && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#6F4E37] dark:text-[#D4A373] hover:underline font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp Direct Inquiry
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#E2D9CC] dark:border-[#2D2622] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#786D63] dark:text-[#A3968A]">
          <p>© {currentYear} Emiland’s Interior. Beauty and Quality. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Crafted with Experience</span>
            <button
              onClick={() => onNavigate('/admin')}
              className="text-[#786D63] hover:text-[#3E2B23] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer"
            >
              Owner Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
