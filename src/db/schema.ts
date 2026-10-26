import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('owner'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  coverMediaUrl: text('cover_media_url').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  location: text('location'),
  completionDate: text('completion_date'),
  status: text('status').notNull().default('published'), // 'draft' | 'published'
  featured: integer('featured').notNull().default(0), // 0 or 1
  mediaType: text('media_type').notNull().default('image'), // 'image' | 'video' | 'mixed'
  videoUrl: text('video_url'),
  clientName: text('client_name'),
  squareFootage: text('square_footage'),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  mediaType: text('media_type').notNull().default('image'), // 'image' | 'video'
  storageKey: text('storage_key').notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull().default(0),
  width: integer('width'),
  height: integer('height'),
  durationSeconds: integer('duration_seconds'),
  altText: text('alt_text').default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  service: text('service').notNull(),
  budgetRange: text('budget_range'),
  timeline: text('timeline'),
  message: text('message').notNull(),
  status: text('status').notNull().default('unread'), // 'unread' | 'read' | 'contacted' | 'archived'
  createdAt: text('created_at').notNull(),
});
