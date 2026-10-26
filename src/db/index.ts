import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Use direct local SQLite file database (standalone local SQLite, independent of any DATABASE_URL)
const sqliteFilePath = path.resolve(process.cwd(), 'sqlite.db');
const dbPath = `file:${sqliteFilePath}`;

export const client = createClient({
  url: dbPath,
});

export const db = drizzle(client, { schema });

// Safe database schema initialization without dropping tables
export async function initializeDatabase() {
  // Ensure tables exist using standard SQLite DDL
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      cover_media_url TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id),
      location TEXT,
      completion_date TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      featured INTEGER NOT NULL DEFAULT 0,
      media_type TEXT NOT NULL DEFAULT 'image',
      video_url TEXT,
      client_name TEXT,
      square_footage TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL DEFAULT 'image',
      storage_key TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      width INTEGER,
      height INTEGER,
      duration_seconds INTEGER,
      alt_text TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      service TEXT NOT NULL,
      budget_range TEXT,
      timeline TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TEXT NOT NULL
    );
  `);

  // Seed default data if users table is empty
  const userCheck = await client.execute('SELECT COUNT(*) as count FROM users');
  const userCount = Number(userCheck.rows[0]?.count || 0);

  if (userCount === 0) {
    const now = new Date().toISOString();
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Atelier2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await client.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: ['usr_owner_default', 'Valerie Laurent', 'owner@maisonterre.com', passwordHash, 'owner', now, now],
    });
  }

  // Seed default categories if empty
  const catCheck = await client.execute('SELECT COUNT(*) as count FROM categories');
  const catCount = Number(catCheck.rows[0]?.count || 0);

  if (catCount === 0) {
    const now = new Date().toISOString();
    const defaultCats = [
      { id: 'cat_residential', name: 'Residential Living', slug: 'residential-living', desc: 'Bespoke residences, salon styling, and spatial architectural layout', order: 1 },
      { id: 'cat_dining_kitchen', name: 'Dining & Kitchens', slug: 'dining-kitchen', desc: 'Curated dining pavilions, stone islands, and bespoke timber joinery', order: 2 },
      { id: 'cat_master_suites', name: 'Master Suites & Baths', slug: 'master-suites-baths', desc: 'Restorative private suites, tactile plaster, and spa bath design', order: 3 },
      { id: 'cat_hospitality', name: 'Commercial & Hospitality', slug: 'commercial-hospitality', desc: 'Boutique hotels, private members clubs, and flagship retail lounges', order: 4 },
      { id: 'cat_bespoke', name: 'Bespoke Joinery & Styling', slug: 'bespoke-styling', desc: 'Custom furniture pieces, curated vintage curation, and fine finishes', order: 5 },
    ];

    for (const c of defaultCats) {
      await client.execute({
        sql: `INSERT INTO categories (id, name, slug, description, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [c.id, c.name, c.slug, c.desc, c.order, now, now],
      });
    }
  }

  // Seed default projects if empty
  const projCheck = await client.execute('SELECT COUNT(*) as count FROM projects');
  const projCount = Number(projCheck.rows[0]?.count || 0);

  if (projCount === 0) {
    const now = new Date().toISOString();
    const initialProjects = [
      {
        id: 'proj_belgravia',
        title: 'The Penthouse at Belgravia',
        slug: 'the-penthouse-at-belgravia',
        shortDescription: 'A 4,200 sq.ft duplex penthouse featuring smoked walnut millwork, Calacatta Borghini marble fireplaces, and custom architectural brass fixtures.',
        description: `Situated atop a historic Belgravia building, this extensive duplex penthouse represents a refined synthesis of architectural geometry and warm residential tactile luxury.

Our studio reconfigured the floor plan to establish clear sightlines through floor-to-ceiling windows toward London's skyline. Deep walnut wall paneling was paired with book-matched Calacatta marble surrounds and an organic travertine coffee table carved from a single quarry block in Tivoli.

Custom upholstery in undyed Italian bouclé provides sculptural balance against the structural wood beams. Every lighting element, including the dual-tier chandelier, was commissioned from local metalsmiths in patinated unlacquered brass.`,
        coverMediaUrl: '/src/assets/images/project_belgravia_penthouse_1792750668137.jpg',
        categoryId: 'cat_residential',
        location: 'Belgravia, London',
        completionDate: 'Autumn 2025',
        status: 'published',
        featured: 1,
        mediaType: 'image',
        videoUrl: '',
        clientName: 'Private Family Office',
        squareFootage: '4,200 sq.ft',
        publishedAt: now,
      },
      {
        id: 'proj_wabisabi',
        title: 'Haus Wabi-Sabi Lakeside Residence',
        slug: 'haus-wabi-sabi-lakeside-residence',
        shortDescription: 'An organic minimalist dining pavilion framed with floor-to-ceiling glass, raw smoked oak trestle table, and artisan stoneware.',
        description: `Embracing the Japanese philosophy of transience and natural beauty, Haus Wabi-Sabi creates a restorative dialogue between sheltered interiors and a private botanical moss garden.

The central pavilion features a massive six-meter dining table shaped from a fallen Swiss oak trunk, left unsealed except for natural organic oils. Micro-cement flooring flows seamlessly across the threshold into the gravel courtyard.

We selected hand-thrown ceramics, raw linen runners, and low-voltage pendant cones to foster quiet conversation and contemplation at every hour of the day.`,
        coverMediaUrl: '/src/assets/images/project_wabisabi_residence_1792750668240.jpg',
        categoryId: 'cat_dining_kitchen',
        location: 'Lucerne, Switzerland',
        completionDate: 'Spring 2025',
        status: 'published',
        featured: 1,
        mediaType: 'image',
        videoUrl: '',
        clientName: 'Private Collector',
        squareFootage: '3,800 sq.ft',
        publishedAt: now,
      },
      {
        id: 'proj_kyoto',
        title: 'Kyoto Sanctuary Master Suite',
        slug: 'kyoto-sanctuary-master-suite',
        shortDescription: 'Fluted timber acoustic headboard wall, tactile clay plaster, washed raw linen textiles, and hand-patinated bronze sconces.',
        description: `Conceived as a restorative escape from urban intensity, this private suite prioritizes acoustic comfort, gentle ambient light, and organic tactile warmth.

A continuous horizontal band of fluted cedar headboard provides both structural grounding and acoustic dampening. Walls are finished in hand-troweled warm clay plaster that responds gracefully to natural daylight.

Furnishings include a low-slung oak bed frame, washed European linen bedding, and custom patinated bronze task lights designed in our Mayfair atelier.`,
        coverMediaUrl: '/src/assets/images/project_kyoto_master_suite_1792750668890.jpg',
        categoryId: 'cat_master_suites',
        location: 'Kyoto, Japan',
        completionDate: 'Winter 2025',
        status: 'published',
        featured: 1,
        mediaType: 'image',
        videoUrl: '',
        clientName: 'Private Commission',
        squareFootage: '1,450 sq.ft',
        publishedAt: now,
      },
      {
        id: 'proj_living_salon',
        title: 'The Côte d’Azur Minimalist Salon',
        slug: 'the-cote-d-azur-minimalist-salon',
        shortDescription: 'Curved organic linen sofa, custom travertine monolithic low table, and architectural black oak library with sun-drenched terrace doors.',
        description: `This light-drenched salon redefines coastal Mediterranean living through a subdued palette of sand, bone, charcoal, and warm earth.

Black oak floor-to-ceiling joinery provides rhythm and deep contrast, showcasing a curated collection of mid-century ceramics and architectural monographs. Steel casement doors open directly onto olive groves, washing the limewashed plaster with warm afternoon light.`,
        coverMediaUrl: '/src/assets/images/hero_interior_living_1792750666855.jpg',
        categoryId: 'cat_residential',
        location: 'Saint-Paul-de-Vence, France',
        completionDate: 'Summer 2025',
        status: 'published',
        featured: 1,
        mediaType: 'image',
        videoUrl: '',
        clientName: 'Private Residence',
        squareFootage: '2,900 sq.ft',
        publishedAt: now,
      },
    ];

    for (const p of initialProjects) {
      await client.execute({
        sql: `INSERT INTO projects (
          id, title, slug, short_description, description, cover_media_url,
          category_id, location, completion_date, status, featured, media_type,
          video_url, client_name, square_footage, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id, p.title, p.slug, p.shortDescription, p.description, p.coverMediaUrl,
          p.categoryId, p.location, p.completionDate, p.status, p.featured, p.mediaType,
          p.videoUrl, p.clientName, p.squareFootage, p.publishedAt, now, now
        ],
      });

      // Add project media item
      await client.execute({
        sql: `INSERT INTO media (id, project_id, media_type, storage_key, original_filename, mime_type, size_bytes, alt_text, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `med_${p.id}_cover`,
          p.id,
          'image',
          p.coverMediaUrl,
          `${p.slug}.jpg`,
          'image/jpeg',
          1024000,
          p.title,
          0,
          now
        ]
      });
    }
  }

  // Seed default site settings if empty
  const settingsCheck = await client.execute('SELECT COUNT(*) as count FROM site_settings');
  const settingsCount = Number(settingsCheck.rows[0]?.count || 0);

  const now = new Date().toISOString();
  const initialSettings = {
    studioName: 'Emiland’s Interior',
    studioTagline: 'Beauty and Quality',
    studioDescription: 'Emiland’s Interior is a furniture, cabinetry, and interior design company built on over five years of hands-on industry experience, exceptional craftsmanship, and enduring spaces.',
    contactEmail: 'contact@emilandsinterior.com',
    contactPhone: '+1 (555) 382-7400',
    whatsappNumber: '+15553827400',
    studioAddress: 'Design Studio & Workshop',
    instagramUrl: 'https://instagram.com/emilandsinterior',
    pinterestUrl: 'https://pinterest.com/emilandsinterior',
    heroTitle: 'Beauty and Quality. Crafted with Experience.',
    heroSubtitle: 'Emiland’s Interior is built on over five years of hands-on industry experience, exceptional craftsmanship, and a commitment to creating beautiful, functional, and enduring spaces.',
    consultationCtaText: 'Craft Your Dream Space with Emiland’s Interior',
    founderName: 'Emiland',
    founderRole: 'Founder & Master Craftsman',
    yearsExperience: '5+ Years Experience',
    projectsCompleted: '100% Bespoke Craftsmanship',
  };

  if (settingsCount === 0) {
    for (const [key, val] of Object.entries(initialSettings)) {
      await client.execute({
        sql: `INSERT INTO site_settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)`,
        args: [`setting_${key}`, key, String(val), now],
      });
    }
  } else {
    // If old default Maison Terre exists, update to Emiland's Interior
    await client.execute({
      sql: `UPDATE site_settings SET value = 'Emiland’s Interior', updated_at = ? WHERE key = 'studioName' AND (value = 'Maison Terre' OR value = '')`,
      args: [now],
    });
    await client.execute({
      sql: `UPDATE site_settings SET value = 'Beauty and Quality', updated_at = ? WHERE key = 'studioTagline' AND (value = 'Interior Architecture & Bespoke Decoration' OR value = '')`,
      args: [now],
    });
  }
}
