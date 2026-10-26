import React, { useState, useEffect } from 'react';
import { Project, Category } from '../../types';
import { X, Upload, Plus, Trash2, Check, AlertCircle, Loader2, Image as ImageIcon, Video, Star } from 'lucide-react';

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

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      const edit = projectToEdit as any;
      setFormData({
        title: edit.title || '',
        slug: edit.slug || '',
        shortDescription: edit.shortDescription || edit.short_description || '',
        description: edit.description || '',
        coverMediaUrl: edit.coverMediaUrl || edit.cover_media_url || '/src/assets/images/hero_interior_living_1792750666855.jpg',
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
    } else {
      setFormData({
        title: '',
        slug: '',
        shortDescription: '',
        description: '',
        coverMediaUrl: '/src/assets/images/hero_interior_living_1792750666855.jpg',
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

  // Upload cover image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers,
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setFormData((prev) => ({
        ...prev,
        coverMediaUrl: data.url,
        mediaType: data.mediaType === 'video' ? 'video' : prev.mediaType,
      }));
    } catch (err: any) {
      setError(err.message || 'File upload error');
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

    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const body = new FormData();
        body.append('file', files[i]);
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers,
          body,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
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

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('maison-token') : null);
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    try {
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
        throw new Error(`Server returned error (${res.status})`);
      }

      if (!res.ok) throw new Error(data?.error || 'Failed to save project');

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving project to SQLite database');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#F8F5EF] dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2D9CC] dark:border-[#2D2622]">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#6F4E37] dark:text-[#D4A373]">
              Portfolio Editor
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
                placeholder="The Mayfair Penthouse"
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
                placeholder="the-mayfair-penthouse"
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
                placeholder="Mayfair, London"
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
              placeholder="Duplex penthouse featuring smoked walnut millwork and travertine low table."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
            />
          </div>

          {/* Detailed Narrative */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
              Comprehensive Architectural Narrative *
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the architectural layout, material choices, bespoke joinery, light orientation..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373] resize-none"
            />
          </div>

          {/* Cover Media Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6]">
                Cover Visual / Media *
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6F4E37] dark:bg-[#A67C52] hover:bg-[#3E2B23] cursor-pointer">
                {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="text"
                required
                value={formData.coverMediaUrl}
                onChange={(e) => setFormData({ ...formData, coverMediaUrl: e.target.value })}
                placeholder="/uploads/my-photo.jpg or URL"
                className="flex-1 px-3 py-2 rounded-lg bg-[#F8F5EF] dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
              />

              {/* Cover Preview */}
              {formData.coverMediaUrl && (
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-[#E2D9CC] dark:border-[#38312B] shrink-0 bg-stone-900">
                  <img src={formData.coverMediaUrl} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Media Type & Video URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Media Format
              </label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
              >
                <option value="image">Photography Gallery (Images)</option>
                <option value="video">Cinematic Video Showcase</option>
                <option value="mixed">Mixed Visuals (Photos + Video)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Video Stream URL (Optional)
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://...mp4 or /uploads/reel.mp4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-sm text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] dark:focus:ring-[#D4A373]"
              />
            </div>
          </div>

          {/* Additional Gallery Media */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6]">
                Gallery Media Perspectives ({formData.galleryUrls.length})
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#302720] dark:text-[#F5EFE6] bg-[#EDE5D8] dark:bg-[#38312B] hover:bg-[#E2D9CC] cursor-pointer">
                {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add Photos/Videos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm"
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
                No extra gallery images added yet. Upload files to showcase different angles or materials.
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
                  Saving to SQLite...
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
