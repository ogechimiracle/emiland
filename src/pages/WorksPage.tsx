import React, { useEffect, useState } from 'react';
import { Project, Category } from '../types';
import { Search, SlidersHorizontal, Maximize2, Play, ArrowRight, FolderKanban } from 'lucide-react';
import { MediaLightbox } from '../components/MediaLightbox';

interface WorksPageProps {
  onNavigate: (path: string) => void;
  onOpenConsultation: () => void;
}

export const WorksPage: React.FC<WorksPageProps> = ({ onNavigate, onOpenConsultation }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMediaList, setActiveMediaList] = useState<Array<{ url: string; title?: string; type?: 'image' | 'video' }>>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch projects with category and search filter
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    fetch(`/api/projects?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch((err) => console.error('Failed to load projects', err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const openLightbox = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#6F4E37] dark:text-[#D4A373]">
          Portfolio Archive
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#302720] dark:text-[#F5EFE6]">
          Selected Works & Commissions
        </h1>
        <p className="text-sm sm:text-base text-[#786D63] dark:text-[#A3968A] leading-relaxed">
          An ongoing archive of bespoke private residences, culinary sanctuaries, and boutique hospitality spaces realized across Europe and Asia.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E2D9CC] dark:border-[#2D2622]">
        
        {/* Category Tabs (Interactive buttons with active states) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#6F4E37] text-white shadow-sm dark:bg-[#A67C52]'
                : 'text-[#302720] dark:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D]'
            }`}
          >
            All Disciplines
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.slug
                  ? 'bg-[#6F4E37] text-white shadow-sm dark:bg-[#A67C52]'
                  : 'text-[#302720] dark:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786D63] dark:text-[#A3968A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-[#302720] dark:text-[#F5EFE6] placeholder-[#786D63]/70 focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[4/3] bg-[#EDE5D8] dark:bg-[#24201D] rounded-2xl" />
              <div className="h-4 bg-[#EDE5D8] dark:bg-[#24201D] rounded w-3/4" />
              <div className="h-3 bg-[#EDE5D8] dark:bg-[#24201D] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl bg-[#EDE5D8]/30 dark:bg-[#1E1A17]/30 border border-[#E2D9CC] dark:border-[#2D2622] space-y-4">
          <FolderKanban className="w-12 h-12 mx-auto text-[#786D63] dark:text-[#A3968A] opacity-60" />
          <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6]">
            No Works Found
          </h3>
          <p className="text-sm text-[#786D63] dark:text-[#A3968A] max-w-md mx-auto">
            {searchQuery
              ? `No published projects matched "${searchQuery}". Try selecting another category or resetting the search.`
              : 'No projects in this category currently. New commissions are published seasonally.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] rounded-lg border border-[#E2D9CC] dark:border-[#38312B] transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onNavigate(`/works/${project.slug}`)}
              className="group cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EDE5D8] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#2D2622]">
                <img
                  src={project.coverMediaUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Media Type Icon & Hover Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {project.mediaType === 'video' && (
                    <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </span>
                  )}
                </div>

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
                  <span>{project.category_name || 'Interior Architecture'}</span>
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

      {/* Media Lightbox */}
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
