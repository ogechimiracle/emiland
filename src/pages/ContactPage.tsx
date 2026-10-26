import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { Mail, Phone, MapPin, Clock, MessageSquare, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface ContactPageProps {
  settings: Partial<SiteSettings>;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Residential Architecture & Decoration',
    budgetRange: '$50,000 – $100,000',
    timeline: '3 – 6 Months',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
          Contact & Consultations
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#302720] dark:text-[#F5EFE6]">
          Initiate a Conversation
        </h1>
        <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed">
          Whether you are acquiring a historic townhouse, constructing a contemporary pavilion, or refining an existing sanctuary, our design team is available to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#302720] dark:text-[#F5EFE6]">
                  Consultation Brief Transmitted
                </h3>
                <p className="text-sm text-[#786D63] dark:text-[#A3968A] max-w-md mx-auto leading-relaxed">
                  Thank you, {formData.name}. We have logged your spatial consultation request in our atelier registry. Valerie Laurent and our senior design architects will respond within one business day.
                </p>

                {settings.whatsappNumber && (
                  <div className="pt-4">
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Maison%20Terre,%20I%20have%20submitted%20an%20inquiry%20regarding%20${encodeURIComponent(formData.service)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20ba59] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Follow Up on WhatsApp
                    </a>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        service: 'Residential Architecture & Decoration',
                        budgetRange: '$50,000 – $100,000',
                        timeline: '3 – 6 Months',
                        message: '',
                      });
                    }}
                    className="text-xs font-semibold uppercase tracking-wider text-[#6F4E37] dark:text-[#D4A373] hover:underline cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6] mb-2">
                  Project Brief Form
                </h3>

                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Lord Julian Sterling"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
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
                      placeholder="julian@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+44 20 7123 4567"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                      Discipline of Interest *
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
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
                      Estimated Investment
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                    >
                      <option value="$25,000 – $50,000">$25,000 – $50,000</option>
                      <option value="$50,000 – $100,000">$50,000 – $100,000</option>
                      <option value="$100,000 – $250,000">$100,000 – $250,000</option>
                      <option value="$250,000+">$250,000+ (Full Turnkey)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                      Target Timeframe
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                    >
                      <option value="Immediate (1 – 2 Months)">Immediate (1 – 2 Months)</option>
                      <option value="3 – 6 Months">3 – 6 Months</option>
                      <option value="6 – 12 Months">6 – 12 Months</option>
                      <option value="Exploratory Consultation">Exploratory Consultation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                    Spatial Vision & Location *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your residence, geographical location, rooms requiring reconfiguration, or preferred materiality..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373] resize-none"
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
                        Submitting...
                      </>
                    ) : (
                      <>
                        Send Inquiry to Principal
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right: Studio Details & Direct Lines */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-[#EDE5D8]/40 dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-6">
            <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              Mayfair Studio & Atelier
            </h3>

            <div className="space-y-4 text-sm text-[#786D63] dark:text-[#A3968A]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6F4E37] dark:text-[#D4A373] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#302720] dark:text-[#F5EFE6]">Maison Terre Studio</p>
                  <p>{settings.studioAddress || '14 Berkeley Square, Mayfair, London W1J 6BD'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#6F4E37] dark:text-[#D4A373] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#302720] dark:text-[#F5EFE6]">Direct Email</p>
                  <a
                    href={`mailto:${settings.contactEmail || 'atelier@maisonterre.com'}`}
                    className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors"
                  >
                    {settings.contactEmail || 'atelier@maisonterre.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#6F4E37] dark:text-[#D4A373] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#302720] dark:text-[#F5EFE6]">Telephone</p>
                  <a
                    href={`tel:${settings.contactPhone || '+442079460812'}`}
                    className="hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors"
                  >
                    {settings.contactPhone || '+44 (0) 20 7946 0812'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#6F4E37] dark:text-[#D4A373] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#302720] dark:text-[#F5EFE6]">Consultation Hours</p>
                  <p>Monday – Friday: 09:00 – 18:00 GMT</p>
                  <p className="text-xs mt-0.5">By private appointment only</p>
                </div>
              </div>
            </div>

            {settings.whatsappNumber && (
              <div className="pt-4 border-t border-[#E2D9CC] dark:border-[#2D2622]">
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20ba59] transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Directly on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
