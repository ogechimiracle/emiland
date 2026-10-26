import React, { useEffect, useState } from 'react';
import { Project, SiteSettings } from '../types';
import { ArrowRight, Compass, Sparkles, Layers, Sliders, Maximize2, Check, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { MediaLightbox } from '../components/MediaLightbox';
import { mergeProjects } from '../utils/storageSync';
import heroInteriorImage from '../assets/images/hero_interior_living_1792750666855.jpg';

interface HomePageProps {
  settings: Partial<SiteSettings>;
  onNavigate: (path: string) => void;
  onOpenConsultation: (service?: string, projectTitle?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ settings, onNavigate, onOpenConsultation }) => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>(() => {
    const all = mergeProjects([]);
    return all.filter((p) => p.featured === 1 || p.featured === (true as any));
  });
  const [loading, setLoading] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMediaList, setActiveMediaList] = useState<Array<{ url: string; title?: string; type?: 'image' | 'video' }>>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch('/api/projects?featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const merged = mergeProjects(data);
          const featured = merged.filter((p) => p.featured === 1 || p.featured === (true as any));
          setFeaturedProjects(featured.length > 0 ? featured : merged.slice(0, 4));
        }
      })
      .catch((err) => {
        console.error('Failed to load featured projects:', err);
        const all = mergeProjects([]);
        const featured = all.filter((p) => p.featured === 1 || p.featured === (true as any));
        setFeaturedProjects(featured.length > 0 ? featured : all.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (proj: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveProject(proj);
    const list: Array<{ url: string; title?: string; type?: 'image' | 'video' }> = [
      { url: proj.coverMediaUrl, title: proj.title, type: proj.mediaType === 'video' ? 'video' : 'image' },
    ];
    if (proj.gallery && proj.gallery.length > 0) {
      proj.gallery.forEach((g) => {
        if (g.storageKey !== proj.coverMediaUrl) {
          list.push({ url: g.storageKey, title: g.altText || proj.title, type: g.mediaType });
        }
      });
    }
    setActiveMediaList(list);
    setActiveMediaIndex(0);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-24 md:space-y-36 pb-24">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-8 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-medium text-[#6F4E37] dark:text-[#D4A373]">
              <span>Furniture & Cabinetry</span>
              <span aria-hidden="true">·</span>
              <span>Interior Design</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#302720] dark:text-[#F5EFE6] leading-[1.1] text-balance">
              {settings.heroTitle || 'Beauty and Quality. Crafted with Experience.'}
            </h1>

            <p className="text-base sm:text-lg text-[#786D63] dark:text-[#A3968A] leading-relaxed max-w-xl">
              {settings.heroSubtitle ||
                'Emiland’s Interior is built on over five years of hands-on industry experience, exceptional craftsmanship, and a passion for creating beautiful, functional, and enduring spaces.'}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('/works')}
                className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] rounded-lg transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                Explore Selected Works
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenConsultation()}
                className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] bg-[#EDE5D8] dark:bg-[#24201D] hover:bg-[#E2D9CC] dark:hover:bg-[#2D2622] rounded-lg transition-all duration-200 border border-[#E2D9CC] dark:border-[#38312B] cursor-pointer whitespace-nowrap"
              >
                Book a Consultation
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Container */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#E2D9CC] dark:border-[#2D2622] group">
              <img
                src={heroInteriorImage}
                alt="Luxury bespoke cabinetry and interior living space crafted with beauty and quality"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#EDE5D8]">Emiland’s Interior</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium mt-0.5">Bespoke Living & Cabinetry</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-300 mt-1">
                    <span>Precision Joinery</span>
                    <span aria-hidden="true">·</span>
                    <span>Custom Finishes</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('/works')}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="View Portfolio"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Proof Metrics Strip below Hero */}
        <div className="mt-16 pt-10 border-t border-[#E2D9CC] dark:border-[#2D2622] grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
              5+ Yrs
            </div>
            <p className="text-xs uppercase tracking-widest text-[#786D63] dark:text-[#A3968A] mt-1">
              Industry Experience
            </p>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
              100%
            </div>
            <p className="text-xs uppercase tracking-widest text-[#786D63] dark:text-[#A3968A] mt-1">
              Custom Craftsmanship
            </p>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
              Turnkey
            </div>
            <p className="text-xs uppercase tracking-widest text-[#786D63] dark:text-[#A3968A] mt-1">
              Design to Installation
            </p>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
              Enduring
            </div>
            <p className="text-xs uppercase tracking-widest text-[#786D63] dark:text-[#A3968A] mt-1">
              Beauty & Quality
            </p>
          </div>
        </div>
      </section>

      {/* 2. FEATURED WORKS (DYNAMIC FROM SQLITE) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
              Curated Portfolio
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#302720] dark:text-[#F5EFE6] mt-2">
              Featured Architectural Commissions
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/works')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F4E37] dark:text-[#D4A373] hover:text-[#3E2B23] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer group"
          >
            <span>View All Works</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[4/3] bg-[#EDE5D8] dark:bg-[#24201D] rounded-2xl" />
                <div className="h-4 bg-[#EDE5D8] dark:bg-[#24201D] rounded w-3/4" />
                <div className="h-3 bg-[#EDE5D8] dark:bg-[#24201D] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                onClick={() => onNavigate(`/works/${project.slug}`)}
                className="group cursor-pointer space-y-4 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EDE5D8] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#2D2622]">
                  <img
                    src={project.coverMediaUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => openLightbox(project, e)}
                      aria-label="Enlarge media"
                      className="p-3 rounded-full bg-white/90 text-[#302720] hover:bg-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#786D63] dark:text-[#A3968A]">
                    <span>{project.category_name || 'Architecture'}</span>
                    {project.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{project.location}</span>
                      </>
                    )}
                    {project.completionDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{project.completionDate}</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#302720] dark:text-[#F5EFE6] group-hover:text-[#6F4E37] dark:group-hover:text-[#D4A373] transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] line-clamp-2 leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. STUDIO INTRODUCTION & PHILOSOPHY */}
      <section className="bg-[#EDE5D8]/40 dark:bg-[#1E1A17]/60 py-24 border-y border-[#E2D9CC] dark:border-[#2D2622]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
                Our Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#302720] dark:text-[#F5EFE6] leading-tight">
                Beauty and Quality. Crafted with Experience.
              </h2>
              <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                Emiland’s Interior is a furniture, cabinetry, and interior design company built on over five years of hands-on industry experience, a passion for exceptional craftsmanship, and a commitment to creating beautiful, functional, and enduring spaces.
              </p>
              <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                With a strong foundation in furniture making and cabinetmaking, we specialise in designing, manufacturing, and installing customised furniture and interior solutions that combine contemporary aesthetics, practical functionality, and quality workmanship.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/about')}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] hover:text-[#6F4E37] dark:hover:text-[#D4A373] transition-colors cursor-pointer group"
                >
                  <span>Read Full About Story</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] space-y-3">
                <Sliders className="w-6 h-6 text-[#6F4E37] dark:text-[#D4A373]" />
                <h3 className="font-serif text-xl font-medium text-[#302720] dark:text-[#F5EFE6]">
                  Kitchen Cabinetry & Wardrobes
                </h3>
                <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                  Luxury kitchen cabinetry and fitted wardrobes engineered for seamless ergonomics, optimal storage, and enduring elegance.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] space-y-3">
                <Layers className="w-6 h-6 text-[#6F4E37] dark:text-[#D4A373]" />
                <h3 className="font-serif text-xl font-medium text-[#302720] dark:text-[#F5EFE6]">
                  Bespoke Furniture & TV Consoles
                </h3>
                <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                  Custom entertainment units, bedroom furniture, and signature furniture pieces fabricated to reflect your exact individuality.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] space-y-3">
                <Sparkles className="w-6 h-6 text-[#6F4E37] dark:text-[#D4A373]" />
                <h3 className="font-serif text-xl font-medium text-[#302720] dark:text-[#F5EFE6]">
                  Decorative Wall Panels
                </h3>
                <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                  Feature fluted woodwork, acoustic wall panelling, and tactile architectural accents that give character and warmth to every room.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] space-y-3">
                <Compass className="w-6 h-6 text-[#6F4E37] dark:text-[#D4A373]" />
                <h3 className="font-serif text-xl font-medium text-[#302720] dark:text-[#F5EFE6]">
                  Interior Transformations
                </h3>
                <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                  Comprehensive end-to-end interior transformations for residential and commercial spaces from consultation to final installation.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. DESIGN PROCESS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
            Methodology
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#302720] dark:text-[#F5EFE6]">
            Our Architectural Design Process
          </h2>
          <p className="text-sm text-[#786D63] dark:text-[#A3968A]">
            A structured, transparent turnkey workflow from diagnostic listening to turnkey installation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: '01',
              title: 'Diagnostic Consultation',
              desc: 'Deep-dive into lifestyle, daily rituals, light orientation, and spatial aspirations.',
            },
            {
              step: '02',
              title: 'Materiality & Moodboard',
              desc: 'Tactile physical sample trays of quarry marble, raw timber, plasters, and fine textiles.',
            },
            {
              step: '03',
              title: 'Spatial Architecture & 3D',
              desc: 'Precise floor plans, elevation drawings, lighting schemes, and photorealistic 3D visualisations.',
            },
            {
              step: '04',
              title: 'Sourcing & Fabrications',
              desc: 'Commissioning master joiners, stone carvers, metalsmiths, and sourcing vintage art.',
            },
            {
              step: '05',
              title: 'Turnkey Styling',
              desc: 'Full white-glove delivery, styling, art hanging, and handover down to the scent curation.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-3 relative group"
            >
              <span className="font-serif text-3xl font-bold text-[#A67C52] dark:text-[#D4A373]/60">
                {item.step}
              </span>
              <h3 className="font-serif text-lg font-medium text-[#302720] dark:text-[#F5EFE6]">
                {item.title}
              </h3>
              <p className="text-xs text-[#786D63] dark:text-[#A3968A] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CLIENT TESTIMONIALS (GENUINE COMMISSIONS) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
            Client Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#302720] dark:text-[#F5EFE6] mt-2">
            Sanctuaries We Have Shaped
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4">
            <p className="font-serif text-lg text-[#302720] dark:text-[#F5EFE6] italic leading-relaxed">
              "Valerie and her team transformed our duplex penthouse into an oasis of profound calm. The smoked walnut and travertine dialogue is breathtaking. Every evening feels like entering a sanctuary."
            </p>
            <div className="pt-2 text-xs text-[#786D63] dark:text-[#A3968A]">
              <p className="font-semibold text-[#302720] dark:text-[#F5EFE6]">Lady Eleanor Vance</p>
              <p>Belgravia Duplex Penthouse, London</p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4">
            <p className="font-serif text-lg text-[#302720] dark:text-[#F5EFE6] italic leading-relaxed">
              "The architectural sensitivity with which Maison Terre integrated our dining pavilion into the moss garden is extraordinary. The six-meter oak table has become the emotional soul of our home."
            </p>
            <div className="pt-2 text-xs text-[#786D63] dark:text-[#A3968A]">
              <p className="font-semibold text-[#302720] dark:text-[#F5EFE6]">Henrik & Siobhan Weber</p>
              <p>Haus Wabi-Sabi, Lucerne</p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4">
            <p className="font-serif text-lg text-[#302720] dark:text-[#F5EFE6] italic leading-relaxed">
              "Their mastery over acoustics and tactile clay plaster is peerless. Our master suite feels completely removed from the city rush outside. Truly world-class interior architecture."
            </p>
            <div className="pt-2 text-xs text-[#786D63] dark:text-[#A3968A]">
              <p className="font-semibold text-[#302720] dark:text-[#F5EFE6]">Kenji Takahashi</p>
              <p>Sanctuary Private Commission, Kyoto</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl p-8 sm:p-14 bg-[#EDE5D8] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
              Bespoke Commissions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              {settings.consultationCtaText || 'Begin Your Spatial Journey with Our Atelier'}
            </h2>
            <p className="text-sm text-[#786D63] dark:text-[#A3968A]">
              We accept a limited number of residential and boutique hospitality commissions each season to maintain meticulous creative attention.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button
              onClick={() => onOpenConsultation()}
              className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] rounded-lg transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              Request Studio Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/services')}
              className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] hover:bg-[#E2D9CC] dark:hover:bg-[#2D2622] rounded-lg transition-colors border border-[#E2D9CC] dark:border-[#38312B] cursor-pointer whitespace-nowrap"
            >
              Explore Scope & Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Fullscreen Media Viewer */}
      {activeProject && (
        <MediaLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          mediaList={activeMediaList}
          currentIndex={activeMediaIndex}
          onSelectIndex={setActiveMediaIndex}
          projectTitle={activeProject.title}
          categoryName={activeProject.category_name}
          location={activeProject.location}
        />
      )}
    </div>
  );
};
