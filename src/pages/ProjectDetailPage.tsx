import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { ArrowLeft, MapPin, Calendar, Compass, Maximize2, Play, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { MediaLightbox } from '../components/MediaLightbox';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenConsultation: (service?: string, projectTitle?: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  slug,
  onNavigate,
  onOpenConsultation,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Project not found');
        return res.json();
      })
      .then((data) => setProject(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6F4E37] dark:text-[#D4A373]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl font-medium text-[#302720] dark:text-[#F5EFE6]">
          Project Not Found
        </h2>
        <p className="text-sm text-[#786D63] dark:text-[#A3968A]">
          The architectural project you requested may have been relocated or unpublished.
        </p>
        <button
          onClick={() => onNavigate('/works')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] dark:bg-[#A67C52] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Works
        </button>
      </div>
    );
  }

  // Combine cover and gallery for lightbox
  const allMediaList: Array<{ url: string; title?: string; type?: 'image' | 'video' }> = [
    { url: project.coverMediaUrl, title: project.title, type: project.mediaType === 'video' ? 'video' : 'image' },
  ];
  if (project.gallery && project.gallery.length > 0) {
    project.gallery.forEach((g) => {
      if (g.storageKey !== project.coverMediaUrl) {
        allMediaList.push({ url: g.storageKey, title: g.altText || project.title, type: g.mediaType });
      }
    });
  }

  return (
    <article className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/works')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#786D63] dark:text-[#A3968A] hover:text-[#302720] dark:hover:text-[#F5EFE6] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Selected Works
        </button>
      </div>

      {/* Project Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-[#6F4E37] dark:text-[#D4A373] font-medium">
          <span>{project.category_name || 'Architectural Commission'}</span>
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

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#302720] dark:text-[#F5EFE6] leading-tight">
          {project.title}
        </h1>

        <p className="text-base sm:text-lg text-[#786D63] dark:text-[#A3968A] leading-relaxed">
          {project.shortDescription}
        </p>
      </div>

      {/* Main Cover or Video Showcase */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black border border-[#E2D9CC] dark:border-[#2D2622]">
        {project.mediaType === 'video' && project.videoUrl ? (
          <div className="aspect-video w-full">
            <video
              src={project.videoUrl}
              poster={project.coverMediaUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            onClick={() => {
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            className="group cursor-pointer relative aspect-[16/9] w-full"
          >
            <img
              src={project.coverMediaUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="p-4 rounded-full bg-white/90 text-[#302720] shadow-xl flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <Maximize2 className="w-4 h-4" />
                View Fullscreen
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Specifications & Narrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
        
        {/* Left: Project Narrative */}
        <div className="lg:col-span-8 space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
            Spatial Narrative
          </span>
          <div className="prose dark:prose-invert max-w-none text-[#302720] dark:text-[#F5EFE6] text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
            {project.description}
          </div>

          {/* Consultation Hook */}
          <div className="mt-12 p-8 rounded-2xl bg-[#EDE5D8]/40 dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4">
            <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              Commission a Project with Similar Spatial Intimacy
            </h3>
            <p className="text-xs sm:text-sm text-[#786D63] dark:text-[#A3968A] leading-relaxed">
              Our atelier works with private collectors, family offices, and developers worldwide. Inquire now to discuss your upcoming residence.
            </p>
            <button
              onClick={() => onOpenConsultation(project.category_name, project.title)}
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] rounded-lg transition-colors cursor-pointer"
            >
              Inquire Regarding This Discipline
            </button>
          </div>
        </div>

        {/* Right: Architectural Specifications Table */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#302720] dark:text-[#F5EFE6] pb-3 border-b border-[#E2D9CC] dark:border-[#2D2622]">
              Commission Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#786D63] dark:text-[#A3968A] block">Discipline</span>
                <span className="font-medium text-[#302720] dark:text-[#F5EFE6] mt-0.5 block">
                  {project.category_name || 'Bespoke Architecture'}
                </span>
              </div>

              {project.location && (
                <div>
                  <span className="text-[#786D63] dark:text-[#A3968A] block">Location</span>
                  <span className="font-medium text-[#302720] dark:text-[#F5EFE6] mt-0.5 block">
                    {project.location}
                  </span>
                </div>
              )}

              {project.completionDate && (
                <div>
                  <span className="text-[#786D63] dark:text-[#A3968A] block">Year Completed</span>
                  <span className="font-medium text-[#302720] dark:text-[#F5EFE6] mt-0.5 block">
                    {project.completionDate}
                  </span>
                </div>
              )}

              {project.squareFootage && (
                <div>
                  <span className="text-[#786D63] dark:text-[#A3968A] block">Floor Area</span>
                  <span className="font-medium text-[#302720] dark:text-[#F5EFE6] mt-0.5 block">
                    {project.squareFootage}
                  </span>
                </div>
              )}

              {project.clientName && (
                <div>
                  <span className="text-[#786D63] dark:text-[#A3968A] block">Client Typology</span>
                  <span className="font-medium text-[#302720] dark:text-[#F5EFE6] mt-0.5 block">
                    {project.clientName}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[#786D63] dark:text-[#A3968A] block">Materiality Palette</span>
                <span className="font-medium text-[#302720] dark:text-[#F5EFE6] mt-0.5 block leading-relaxed">
                  Tivoli Travertine, Smoked Swiss Oak, Hand-Troweled Lime Plaster, Unlacquered Patinated Brass, Undyed Bouclé
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Additional Media Gallery if present */}
      {project.gallery && project.gallery.length > 1 && (
        <div className="space-y-6 pt-12 border-t border-[#E2D9CC] dark:border-[#2D2622]">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#302720] dark:text-[#F5EFE6]">
            Spatial Details & Perspectives
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.gallery.map((med, idx) => (
              <div
                key={med.id || idx}
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EDE5D8] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#2D2622] cursor-pointer"
              >
                <img
                  src={med.storageKey}
                  alt={med.altText || `${project.title} view ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-3 rounded-full bg-white/90 text-[#302720]">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        mediaList={allMediaList}
        currentIndex={lightboxIndex}
        onSelectIndex={setLightboxIndex}
        projectTitle={project.title}
        categoryName={project.category_name}
        location={project.location}
      />
    </article>
  );
};
