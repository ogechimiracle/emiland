import React, { useState } from 'react';
import { X, CheckCircle, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { SiteSettings } from '../types';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
  preselectedProject?: string;
  settings: Partial<SiteSettings>;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  preselectedService,
  preselectedProject,
  settings,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: preselectedService || 'Residential Architecture & Decoration',
    budgetRange: '$50,000 – $100,000',
    timeline: '3 – 6 Months',
    message: preselectedProject ? `Inquiring regarding spatial concepts inspired by ${preselectedProject}.` : '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit consultation request');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#F8F5EF] dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] rounded-2xl shadow-2xl p-6 sm:p-8 transition-colors my-8">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-lg text-[#786D63] dark:text-[#A3968A] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#302720] dark:text-[#F5EFE6]">
              Consultation Scheduled
            </h3>
            <p className="text-sm text-[#786D63] dark:text-[#A3968A] max-w-md mx-auto leading-relaxed">
              Thank you, {formData.name}. Our principal design team has received your project briefing. We will review your spatial requirements and reach out via email within one business day.
            </p>

            {settings.whatsappNumber && (
              <div className="pt-4">
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Maison%20Terre,%20I%20have%20submitted%20a%20consultation%20request%20for%20${encodeURIComponent(formData.service)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20ba59] transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Connect via WhatsApp Now
                </a>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] rounded-lg transition-colors cursor-pointer"
              >
                Return to Atelier
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
                Atelier Consultation
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#302720] dark:text-[#F5EFE6] mt-1">
                Begin Your Spatial Journey
              </h2>
              <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] mt-1.5">
                Share your architectural or interior decoration vision. Every private commission receives dedicated spatial planning and tactile material curation.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Lady Eleanor Vance"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="eleanor@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+44 7911 123456"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                    Service Scope *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                  >
                    <option value="Residential Architecture & Decoration">Residential Architecture & Decoration</option>
                    <option value="Private Living & Bedroom Styling">Private Living & Bedroom Styling</option>
                    <option value="Dining & Kitchen Sanctuaries">Dining & Kitchen Sanctuaries</option>
                    <option value="Master Suites & Spa Baths">Master Suites & Spa Baths</option>
                    <option value="Commercial & Boutique Hospitality">Commercial & Boutique Hospitality</option>
                    <option value="Bespoke Joinery & Furniture Curation">Bespoke Joinery & Furniture Curation</option>
                    <option value="Full Turnkey Renovation Consultation">Full Turnkey Renovation Consultation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                    Investment Budget
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                  >
                    <option value="$25,000 – $50,000">$25,000 – $50,000</option>
                    <option value="$50,000 – $100,000">$50,000 – $100,000</option>
                    <option value="$100,000 – $250,000">$100,000 – $250,000</option>
                    <option value="$250,000+">$250,000+ (Comprehensive Turnkey)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                    Target Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                  >
                    <option value="Immediate (Within 1 Month)">Immediate (Within 1 Month)</option>
                    <option value="3 – 6 Months">3 – 6 Months</option>
                    <option value="6 – 12 Months">6 – 12 Months</option>
                    <option value="Exploratory / Concept Phase">Exploratory / Concept Phase</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Project Brief & Scope *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about the property, rooms involved, preferred materials, or special spatial objectives..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Brief...
                    </>
                  ) : (
                    <>
                      Submit Consultation Request
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
