import React from 'react';
import { ArrowRight, Check, Compass, Layers, Home, Building2, Utensils, BedDouble, SlidersHorizontal } from 'lucide-react';

interface ServicesPageProps {
  onOpenConsultation: (service?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenConsultation }) => {
  const services = [
    {
      id: 'residential-architecture',
      title: 'Residential Interior Architecture & Decoration',
      subtitle: 'Complete Private Residences, Duplexes & Villas',
      icon: Home,
      desc: 'End-to-end spatial reconfiguration, custom interior architectural detailing, and comprehensive furniture, lighting, and art curation.',
      features: [
        'Full architectural layout & partition planning',
        'Physical material palettes & moodboards',
        'Custom lighting & acoustic engineering',
        'Procurement of artisan furniture & vintage objects',
        'White-glove turnkey installation and handover',
      ],
      typicalTimeline: '4 – 10 Months',
    },
    {
      id: 'dining-kitchen',
      title: 'Kitchen & Dining Sanctuaries',
      subtitle: 'Bespoke Stone Islands & Architectural Joinery',
      icon: Utensils,
      desc: 'Culinary spaces designed as warm social hubs. Combining solid smoked timber, honed European marble, concealed high-performance appliances, and custom ambient lighting.',
      features: [
        'Stone slab selection at quarries',
        'Integrated custom joinery & pantry design',
        'Dining pavilions & banquet seating design',
        'Artisan hardware & metalwork detailing',
      ],
      typicalTimeline: '3 – 6 Months',
    },
    {
      id: 'master-suites',
      title: 'Master Suites & Wellness Bathrooms',
      subtitle: 'Restorative Private Sanctuaries',
      icon: BedDouble,
      desc: 'Private rooms prioritized for restorative sleep and acoustic serenity. Fluted timber walls, tactile clay plaster, washed linens, and spa-grade wet rooms.',
      features: [
        'Acoustic timber headboards and wall paneling',
        'Integrated walk-in dressing suites',
        'Natural stone soaking tubs and microcement wet rooms',
        'Circadian lighting integration',
      ],
      typicalTimeline: '2 – 5 Months',
    },
    {
      id: 'commercial-hospitality',
      title: 'Commercial & Boutique Hospitality Design',
      subtitle: 'Boutique Hotels, Private Clubs & Retail Lounges',
      icon: Building2,
      desc: 'Elevating commercial environments through high-retention luxury design. Cultivating unforgettable guest atmospheres that reinforce brand prestige.',
      features: [
        'Hospitality spatial strategy & customer journey',
        'Commercial code compliance & durable luxury finishes',
        'Signature bar & lounge centerpiece design',
        'Bespoke contract furniture production',
      ],
      typicalTimeline: '6 – 12 Months',
    },
    {
      id: 'bespoke-styling',
      title: 'Furniture Curation & Space Planning',
      subtitle: 'Refinement for Existing Architectural Spaces',
      icon: SlidersHorizontal,
      desc: 'For residences with finished architecture seeking elevated aesthetic refinement. Furniture curation, rug design, artwork acquisition, and styling.',
      features: [
        'Spatial proportion optimization',
        'One-of-a-kind bespoke joinery commissions',
        'Textile and upholstery revitalization',
        'Art advisory and spatial placement',
      ],
      typicalTimeline: '6 – 12 Weeks',
    },
    {
      id: 'renovation-consultation',
      title: 'Renovation & Finishing Consultation',
      subtitle: 'Strategic Architectural Guidance',
      icon: Compass,
      desc: 'Comprehensive advisory for homeowners or developers before breaking ground. Site evaluations, contractor brief creation, and finish schedules.',
      features: [
        'On-site spatial analysis and feasibility report',
        'Material and finish specification schedules',
        'Contractor review and tender assistance',
        'Architectural design reviews',
      ],
      typicalTimeline: '2 – 4 Weeks',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
          Disciplines & Scope
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#302720] dark:text-[#F5EFE6]">
          Atelier Services
        </h1>
        <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed">
          From full-scale private residence reconfigurations to bespoke joinery and curatorial styling, each service is delivered with obsessive attention to proportion and materiality.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              className="p-8 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] flex flex-col justify-between space-y-6 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#EDE5D8] dark:bg-[#24201D] text-[#6F4E37] dark:text-[#D4A373] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#786D63] dark:text-[#A3968A] block">
                    {svc.subtitle}
                  </span>
                  <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6] mt-1">
                    {svc.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                  {svc.desc}
                </p>

                <div className="pt-2 space-y-2 border-t border-[#E2D9CC] dark:border-[#2D2622]">
                  {svc.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-2 text-xs text-[#302720] dark:text-[#F5EFE6]">
                      <Check className="w-3.5 h-3.5 text-[#6F4E37] dark:text-[#D4A373] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2D9CC] dark:border-[#2D2622] space-y-3">
                <div className="text-[11px] text-[#786D63] dark:text-[#A3968A]">
                  Typical Timeline: <span className="font-semibold text-[#302720] dark:text-[#F5EFE6]">{svc.typicalTimeline}</span>
                </div>
                <button
                  onClick={() => onOpenConsultation(svc.title)}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Request Scope for this Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory Banner */}
      <div className="rounded-3xl p-8 sm:p-12 bg-[#EDE5D8] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6]">
            Uncertain Which Scope Fits Your Property?
          </h3>
          <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A]">
            Schedule an exploratory diagnostic call with Valerie Laurent to evaluate your floor plans and timeline.
          </p>
        </div>
        <button
          onClick={() => onOpenConsultation('General Spatial Diagnostic')}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Book Diagnostic Call
        </button>
      </div>
    </div>
  );
};
