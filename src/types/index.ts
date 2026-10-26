export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaItem {
  id: string;
  projectId: string;
  mediaType: 'image' | 'video';
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  altText?: string;
  sortOrder: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverMediaUrl: string;
  categoryId?: string;
  category_name?: string;
  category_slug?: string;
  location?: string;
  completionDate?: string;
  status: 'draft' | 'published';
  featured: number; // 0 or 1
  mediaType: 'image' | 'video' | 'mixed';
  videoUrl?: string;
  clientName?: string;
  squareFootage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  gallery?: MediaItem[];
}

export interface SiteSettings {
  studioName: string;
  studioTagline: string;
  studioDescription: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  studioAddress: string;
  instagramUrl: string;
  pinterestUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  consultationCtaText: string;
  founderName: string;
  founderRole: string;
  yearsExperience: string;
  projectsCompleted: string;
  [key: string]: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
  status: 'unread' | 'read' | 'contacted' | 'archived';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  featuredProjects: number;
  unreadInquiries: number;
  totalInquiries: number;
}
