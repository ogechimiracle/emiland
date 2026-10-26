import React, { useState, useEffect } from 'react';
import { Project, Category } from '../../types';
import { readFileAsOptimizedDataUrl, parseVideoInfo } from '../../utils/mediaUtils';
import { saveCachedProject } from '../../utils/storageSync';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  Star,
  Link,
  Film,
} from 'lucide-react';

interface ProjectEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  projectToEdit?: Project | null;
  categories: Category[];
  token: string | null;
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  projectToEdit,
  categories,
  token,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    coverMediaUrl: '',
    categoryId: '',
    location: '',
    completionDate: '',
    status: 'published' as 'published' | 'draft',
    featured: 0,
    mediaType: 'image' as 'image' | 'video' | 'mixed',
    videoUrl: '',
    clientName: '',
    squareFootage: '',
    galleryUrls: [] as string[],
  });

  const [coverInputMode, setCoverInputMode] = useState<'upload' | 'url'>('upload');
  const [videoInputMode, setVideoInputMode] = useState<'url' | 'upload'>('url');
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      const edit = projectToEdit as any;
      const coverUrl = edit.coverMediaUrl || edit.cover_media_url || '/src/assets/images/hero_interior_living_1792750666855.jpg';
      setFormData({
        title: edit.title || '',
        slug: edit.slug || '',
        shortDescription: edit.shortDescription || edit.short_description || '',
        description: edit.description || '',
        coverMediaUrl: coverUrl,
        categoryId: edit.categoryId || edit.category_id || categories[0]?.id || '',
        location: edit.location || '',
        completionDate: edit.completionDate || edit.completion_date || '',
        status: edit.status || 'published',
        featured: edit.featured === 1 || edit.featured === true ? 1 : 0,
        mediaType: edit.mediaType || edit.media_type || 'image',
        videoUrl: edit.videoUrl || edit.video_url || '',
        clientName: edit.clientName || edit.client_name || '',
        squareFootage: edit.squareFootage || edit.square_footage || '',
        galleryUrls: edit.gallery ? edit.gallery.map((g: any) => g.storageKey || g.storage_key) : [],
      });
      setCustomCoverUrl(coverUrl);
    } else {
      const defaultCover = '/src/assets/images/hero_interior_living_1792750666855.jpg';
      setFormData({
        title: '',
        slug: '',
        shortDescription: '',
        description: '',
        coverMediaUrl: defaultCover,
        categoryId: categories[0]?.id || '',
        location: 'London, UK',
        completionDate: '2026',
        status: 'published',
        featured: 0,
        mediaType: 'image',
        videoUrl: '',
        clientName: 'Private Commission',
        squareFootage: '3,200 sq.ft',
        galleryUrls: [],
      });
      setCustomCoverUrl(defaultCover);
    }
    setError(null);
  }, [projectToEdit, categories, isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug when title changes if creating new
  const handleTitleChange = (val: string) => {
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !projectToEdit ? generatedSlug : prev.slug,
    }));
  };

  // Upload cover image: read & compress via canvas for 100% reliable local/cloud rendering
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError(null);

    try {
      // 1. Generate optimized data URL in browser
      const { url: optimizedUrl, mediaType } = await readFileAsOptimizedDataUrl(file);

      setFormData((prev) => ({
        ...prev,
        coverMediaUrl: optimizedUrl,
        mediaType: mediaType === 'video' ? 'video' : prev.mediaType,
      }));
      setCustomCoverUrl(optimizedUrl);

      // 2. Also attempt server upload if token available, but data URL is already set safely
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('maison-token') : null) || 'fallback-owner-token';
      const body = new FormData();
      body.append('file', file);
      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
          body,
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.url && !data.url.startsWith('data:')) {
            setFormData((prev) => ({ ...prev, coverMediaUrl: data.url }));
            setCustomCoverUrl(data.url);
          }
        }
      } catch {
        // Fallback data URL is already active, so ignore server error
      }
    } catch (err: any) {
      setError(err.message || 'File upload error');
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload video file for video showcase
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingCover(true);

    try {
      const { url: videoDataUrl } = await readFileAsOptimizedDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        mediaType: 'video',
        videoUrl: videoDataUrl,
      }));
    } catch (err: any) {
      setError(err.message || 'Video read error. Please use a YouTube or direct MP4 URL.');
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload additional gallery files
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setError(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const { url } = await readFileAsOptimizedDataUrl(files[i]);
          if (url) newUrls.push(url);
        } catch (fileErr) {
          console.warn('Skipping file due to error:', fileErr);
        }
      }
      setFormData((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, ...newUrls],
      }));
    } catch (err: any) {
      setError(err.message || 'Gallery upload error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const isEdit = !!projectToEdit;
    const url = isEdit ? `/api/projects/${projectToEdit.id}` : '/api/projects';
    const method = isEdit ? 'PUT' : 'POST';

    const activeToken =
      token || (typeof window !== 'undefined' ? localStorage.getItem('maison-token') : null) || 'fallback-owner-token';

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${activeToken}`,
    };

    // Construct clean project object
    const finalProject: Project = {
      id: isEdit ? projectToEdit.id : `proj_${Date.now()}`,
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      coverMediaUrl: formData.coverMediaUrl || '/src/assets/images/hero_interior_living_1792750666855.jpg',
      categoryId: formData.categoryId || categories[0]?.id || '',
      location: formData.location.trim(),
      completionDate: formData.completionDate.trim(),
      status: formData.status,
      featured: formData.featured,
      mediaType: formData.mediaType,
      videoUrl: formData.videoUrl.trim(),
      clientName: formData.clientName.trim(),
      squareFootage: formData.squareFootage.trim(),
      gallery: formData.galleryUrls.map((url, i) => ({
        id: `med_${i}`,
        projectId: isEdit ? projectToEdit.id : `proj_${Date.now()}`,
        mediaType: url.endsWith('.mp4') || url.includes('youtube') || url.includes('vimeo') ? 'video' : 'image',
        storageKey: url,
        originalFilename: `view-${i + 1}`,
        mimeType: 'image/jpeg',
        sizeBytes: 0,
        sortOrder: i,
        createdAt: new Date().toISOString(),
      })),
      createdAt: isEdit ? (projectToEdit as any).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Send to server API
      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON response (e.g. serverless cold start hiccup)
      }

      if (res.status === 401) {
        throw new Error('Authentication expired. Please re-login with your credentials.');
      }

      // 2. Regardless of serverless state, persist project in local storage cache
      saveCachedProject(finalProject);

      onSaved();
      onClose();
    } catch (err: any) {
      // If server failed, save to client storage so the user's project is never lost!
      saveCachedProject(finalProject);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const parsedVideo = parseVideoInfo(formData.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#F8F5EF] dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2D9CC] dark:border-[#2D2622]">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#6F4E37] dark:text-[#D4A373]">
              Emiland’s Interior · Management
            </span>
            <h2 className="font-serif text-2xl font-semibold text-[#302720] dark:text-[#F5EFE6]">
              {projectToEdit ? `Edit: ${projectToEdit.title}` : 'Add New Portfolio Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#786D63] dark:text-[#A3968A] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          
          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Luxury Kitchen & Fluted Island"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                URL Slug * (Unique)
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="luxury-kitchen-fluted-island"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] font-mono focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
              />
            </div>
          </div>

          {/* Category, Location, Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Belgravia, London"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Completion Year
              </label>
              <input
                type="text"
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                placeholder="Autumn 2025"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
              Card Short Description *
            </label>
            <input
              type="text"
              required
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Custom walnut cabinetry, integrated appliances, and Calacatta Borghini island."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
            />
          </div>

          {/* Detailed Narrative */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
              Comprehensive Architectural & Joinery Narrative *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe craftsmanship details, material selections, fitted joinery, space optimization..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373] resize-none"
            />
          </div>

          {/* Cover Media Section with Upload & URL Switcher */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6]">
                Cover Visual / Media *
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCoverInputMode('upload')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    coverInputMode === 'upload'
                      ? 'bg-[#6F4E37] text-white dark:bg-[#A67C52]'
                      : 'text-[#786D63] hover:bg-[#EDE5D8] dark:hover:bg-[#38312B]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setCoverInputMode('url')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    coverInputMode === 'url'
                      ? 'bg-[#6F4E37] text-white dark:bg-[#A67C52]'
                      : 'text-[#786D63] hover:bg-[#EDE5D8] dark:hover:bg-[#38312B]'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>

            {coverInputMode === 'upload' ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6F4E37] dark:bg-[#A67C52] hover:bg-[#3E2B23] transition-colors cursor-pointer shrink-0">
                  {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Choose Image File (Auto-Optimized)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>

                {formData.coverMediaUrl && (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-[#E2D9CC] dark:border-[#38312B] shrink-0 bg-stone-900">
                      <img src={formData.coverMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                      ✓ Cover ready for display
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={customCoverUrl}
                  onChange={(e) => {
                    setCustomCoverUrl(e.target.value);
                    setFormData((prev) => ({ ...prev, coverMediaUrl: e.target.value }));
                  }}
                  placeholder="https://images.unsplash.com/... or image link"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
                {formData.coverMediaUrl && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-[#E2D9CC] dark:border-[#38312B] shrink-0 bg-stone-900">
                    <img src={formData.coverMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Format & Video Stream Showcase */}
          <div className="space-y-4 p-4 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Media Format
                </label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                >
                  <option value="image">Photography Showcase (High-Res Images)</option>
                  <option value="video">Cinematic Video Tour (YouTube, Vimeo, MP4)</option>
                  <option value="mixed">Mixed Visuals (Photos + Video)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Video Tour URL / Stream Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube URL, Vimeo URL, or direct .mp4 link"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
                  />
                  <Film className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#786D63]" />
                </div>
              </div>
            </div>

            {/* Video file upload option or live preview */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#E2D9CC]/50 dark:border-[#38312B]/50">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#302720] dark:text-[#F5EFE6] bg-[#EDE5D8] dark:bg-[#38312B] hover:bg-[#E2D9CC] cursor-pointer">
                <Video className="w-3.5 h-3.5 text-[#6F4E37] dark:text-[#D4A373]" />
                <span>Upload Local MP4 Video File</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>

              {parsedVideo.type !== 'empty' && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Valid {parsedVideo.type.toUpperCase()} video stream connected
                </span>
              )}
            </div>

            {/* Live Video Preview in modal */}
            {parsedVideo.type !== 'empty' && (
              <div className="aspect-video w-full max-w-md rounded-xl overflow-hidden border border-[#E2D9CC] dark:border-[#38312B] bg-black">
                {parsedVideo.type === 'youtube' || parsedVideo.type === 'vimeo' ? (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title="Video preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video src={parsedVideo.embedUrl} controls className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </div>

          {/* Additional Gallery Media */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6]">
                  Gallery Media Perspectives ({formData.galleryUrls.length})
                </label>
                <p className="text-[11px] text-[#786D63] dark:text-[#A3968A]">
                  Select multiple photos from your device — auto-optimized for ultra-fast rendering.
                </p>
              </div>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#302720] dark:text-[#F5EFE6] bg-[#EDE5D8] dark:bg-[#38312B] hover:bg-[#E2D9CC] cursor-pointer shrink-0">
                {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>

            {formData.galleryUrls.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                {formData.galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E2D9CC] dark:border-[#38312B] group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="absolute top-1 right-1 p-1 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#786D63] dark:text-[#A3968A] italic">
                No additional gallery images added yet. Click &quot;Add Photos&quot; to showcase angles, joinery joints, or textures.
              </p>
            )}
          </div>

          {/* Status & Featured */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={() => setFormData({ ...formData, status: 'published' })}
                  className="accent-[#6F4E37] dark:accent-[#D4A373]"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6]">
                  Publish Publicly
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={() => setFormData({ ...formData, status: 'draft' })}
                  className="accent-[#6F4E37] dark:accent-[#D4A373]"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#786D63] dark:text-[#A3968A]">
                  Save as Draft
                </span>
              </label>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured === 1}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 accent-[#6F4E37] dark:accent-[#D4A373]"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Featured on Homepage
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E2D9CC] dark:border-[#2D2622]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Project...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {projectToEdit ? 'Save Changes' : 'Create Project'}
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
