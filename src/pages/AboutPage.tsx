import React from 'react';
import { SiteSettings } from '../types';
import { ShieldCheck, Compass, Sparkles, HeartHandshake, ArrowRight, Layers, CheckCircle2, Hammer, Ruler } from 'lucide-react';
import aboutImage from "../assets/images/project_belgravia_penthouse_1792750668137.jpg";

interface AboutPageProps {
  settings: Partial<SiteSettings>;
  onNavigate: (path: string) => void;
  onOpenConsultation: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate, onOpenConsultation }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-20 md:space-y-28">
      
      {/* 1. Header & Lead Introduction */}
      <section className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
          <span>Company Profile</span>
          <span aria-hidden="true">·</span>
          <span>Crafted with Experience</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#302720] dark:text-[#F5EFE6] leading-tight uppercase tracking-tight">
          ABOUT EMILAND’S INTERIOR
        </h1>

        <p className="font-heading text-2xl sm:text-3xl text-[#6F4E37] dark:text-[#D4A373] font-medium italic">
          Beauty and Quality. Crafted with Experience.
        </p>

        <p className="text-base sm:text-lg text-[#302720] dark:text-[#F5EFE6] leading-relaxed">
          Emiland’s Interior is a furniture, cabinetry, and interior design company built on over five years of hands-on industry experience, a passion for exceptional craftsmanship, and a commitment to creating beautiful, functional, and enduring spaces.
        </p>

        <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed">
          With a strong foundation in furniture making and cabinetmaking, we specialise in designing, manufacturing, and installing customised furniture and interior solutions that combine contemporary aesthetics, practical functionality, and quality workmanship.
        </p>
      </section>

      {/* 2. Visual Split & Expertise Scope */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-[#EDE5D8] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#2D2622] shadow-xl group">
            <img
              src={aboutImage}
              alt="Emiland's Interior luxury cabinetry and bespoke furniture"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-[#EDE5D8] font-semibold">
                Custom Cabinetry & Joinery
              </span>
              <h3 className="font-heading text-2xl font-bold">
                Emiland’s Interior
              </h3>
              <p className="text-xs text-stone-300">
                Beauty and Quality in Every Detail
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
            Our Specialisations
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#302720] dark:text-[#F5EFE6] leading-snug">
            Comprehensive Interior & Furniture Solutions
          </h2>

          <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed">
            Our expertise spans luxury kitchen cabinetry, fitted wardrobes, bespoke furniture, TV consoles, bedroom furniture, decorative wall panels, and comprehensive interior transformations for residential and commercial spaces.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              'Luxury Kitchen Cabinetry',
              'Fitted Wardrobes & Closets',
              'Bespoke Furniture Pieces',
              'Custom TV & Entertainment Consoles',
              'Bedroom Furniture Collections',
              'Decorative Architectural Wall Panels',
              'Residential Interior Transformations',
              'Commercial Interior Fit-Outs',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#302720] dark:text-[#F5EFE6]">
                <CheckCircle2 className="w-4 h-4 text-[#6F4E37] dark:text-[#D4A373] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center gap-6 border-t border-[#E2D9CC] dark:border-[#2D2622]">
            <div>
              <div className="font-heading text-3xl font-bold text-[#6F4E37] dark:text-[#D4A373] tabular-nums">
                5+ Years
              </div>
              <p className="text-xs text-[#786D63] dark:text-[#A3968A] mt-0.5">
                Hands-On Industry Experience
              </p>
            </div>
            <div className="w-[1px] h-10 bg-[#E2D9CC] dark:border-[#2D2622]" />
            <div>
              <div className="font-heading text-3xl font-bold text-[#6F4E37] dark:text-[#D4A373] tabular-nums">
                100%
              </div>
              <p className="text-xs text-[#786D63] dark:text-[#A3968A] mt-0.5">
                Customised Precision Execution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep Craftsmanship & Knowledge */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#EDE5D8]/50 dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-6">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
          Mastery & Technique
        </span>

        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#302720] dark:text-[#F5EFE6]">
          The Finer Details of Exceptional Craftsmanship
        </h2>

        <div className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed space-y-4">
          <p>
            Over the years, our experience has strengthened our understanding of materials, construction techniques, space utilisation, finishing methods, and the finer details that distinguish ordinary work from exceptional craftsmanship. We apply this knowledge to every project, ensuring that our designs are not only visually appealing but also thoughtfully planned and purposefully executed.
          </p>
          <p>
            At Emiland’s Interior, we recognise that every space represents a unique vision. We therefore take a client-focused approach, working closely with our customers to understand their preferences, functional requirements, and project objectives. From initial consultation and design development to production and final installation, we strive to deliver solutions that reflect our clients' individuality while maintaining our commitment to quality and professional service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] space-y-2">
            <Ruler className="w-5 h-5 text-[#6F4E37] dark:text-[#D4A373]" />
            <h4 className="font-heading font-semibold text-sm text-[#302720] dark:text-[#F5EFE6]">
              Space Utilisation
            </h4>
            <p className="text-xs text-[#786D63] dark:text-[#A3968A]">
              Maximising volume and spatial balance for ergonomic and intuitive day-to-day flow.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] space-y-2">
            <Hammer className="w-5 h-5 text-[#6F4E37] dark:text-[#D4A373]" />
            <h4 className="font-heading font-semibold text-sm text-[#302720] dark:text-[#F5EFE6]">
              Finishing Methods
            </h4>
            <p className="text-xs text-[#786D63] dark:text-[#A3968A]">
              Pristine edge-banding, durable lacquers, tactile veneers, and flawless joinery fittings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] space-y-2">
            <HeartHandshake className="w-5 h-5 text-[#6F4E37] dark:text-[#D4A373]" />
            <h4 className="font-heading font-semibold text-sm text-[#302720] dark:text-[#F5EFE6]">
              Client-Focused Delivery
            </h4>
            <p className="text-xs text-[#786D63] dark:text-[#A3968A]">
              Close consultation and transparent execution from concept sketching to final installation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Philosophy & Purpose */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
            Core Philosophy
          </span>

          <blockquote className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#302720] dark:text-[#F5EFE6] leading-relaxed italic">
            "Our philosophy is simple: great interiors are created when creativity, technical expertise, quality materials, and precision craftsmanship work together."
          </blockquote>

          <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed pt-2">
            We continually seek to refine our techniques, embrace modern design concepts, and deliver furniture and interior solutions that balance elegance, durability, and functionality.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] text-center space-y-4">
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#302720] dark:text-[#F5EFE6]">
            Creating Lasting Value
          </h3>
          <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] max-w-3xl mx-auto leading-relaxed">
            Whether we are creating a sophisticated kitchen, a beautifully organised wardrobe, a distinctive entertainment unit, or a complete interior environment, our goal remains the same: to transform spaces into purposeful, elegant, and inspiring places.
          </p>
          <p className="text-sm sm:text-base text-[#302720] dark:text-[#F5EFE6] font-medium max-w-2xl mx-auto pt-2">
            At Emiland’s Interior, we do more than make furniture or design interiors. We create lasting value through craftsmanship, attention to detail, and a genuine commitment to excellence.
          </p>
        </div>
      </section>

      {/* 5. Brand Slogan & Call to Action Banner */}
      <section className="rounded-3xl p-8 sm:p-14 bg-[#EDE5D8] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
          Emiland’s Interior
        </span>

        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#302720] dark:text-[#F5EFE6]">
          Our Experience. Your Vision. Exceptional Craftsmanship.
        </h2>

        <p className="font-heading text-xl text-[#6F4E37] dark:text-[#D4A373] font-medium">
          Emiland’s Interior — Beauty and Quality
        </p>

        <p className="text-sm text-[#786D63] dark:text-[#A3968A] max-w-lg mx-auto">
          Ready to transform your home or commercial space with customized cabinetry, bespoke furniture, or a complete interior environment?
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenConsultation}
            className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] rounded-xl transition-all shadow-md cursor-pointer"
          >
            Book a Design Consultation
          </button>

          <button
            onClick={() => onNavigate('/works')}
            className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] hover:bg-[#E2D9CC] dark:hover:bg-[#2D2622] rounded-xl transition-colors border border-[#E2D9CC] dark:border-[#38312B] cursor-pointer"
          >
            Explore Completed Works
          </button>
        </div>
      </section>

    </div>
  );
};
