import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Project, Category, SiteSettings, Inquiry, DashboardStats } from '../../types';
import { ProjectEditorModal } from './ProjectEditorModal';
import {
  FolderKanban,
  Plus,
  Eye,
  EyeOff,
  Star,
  Edit2,
  Trash2,
  Settings,
  Mail,
  Lock,
  Layers,
  LogOut,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onNavigateProject: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome, onNavigateProject }) => {
  const { user, logout, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'works' | 'categories' | 'inquiries' | 'settings' | 'account'>('works');

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    featuredProjects: 0,
    unreadInquiries: 0,
    totalInquiries: 0,
  });

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Editor Modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Inquiries
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Site Settings
  const [settingsForm, setSettingsForm] = useState<Partial<SiteSettings>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // New Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const fetchStats = async () => {
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/stats', { headers });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setStats(data);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) setCategories(data);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/projects', { headers });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) setProjects(data);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/inquiries', { headers });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) setInquiries(data);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setSettingsForm(data);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchProjects();
    fetchSettings();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'inquiries') fetchInquiries();
  }, [activeTab]);

  // Project Mutations
  const togglePublish = async (proj: Project) => {
    const newStatus = proj.status === 'published' ? 'draft' : 'published';
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/projects/${proj.id}/publish`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProjects();
      fetchStats();
    } catch (err) {
      console.error('Toggle status error', err);
    }
  };

  const toggleFeatured = async (proj: Project) => {
    const newFeatured = proj.featured === 1 ? 0 : 1;
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/projects/${proj.id}/featured`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ featured: newFeatured }),
      });
      fetchProjects();
      fetchStats();
    } catch (err) {
      console.error('Toggle featured error', err);
    }
  };

  const deleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove project "${title}" from the SQLite database?`)) return;

    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers,
      });
      fetchProjects();
      fetchStats();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() }),
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatDesc('');
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Existing projects will remain unassigned.`)) return;
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/categories/${id}`, { method: 'DELETE', headers });
      fetchCategories();
    } catch (err) {
      console.error('Delete category error', err);
    }
  };

  // Update Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    setSettingsError(null);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('maison-token') : null);
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(settingsForm),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned status ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update settings');
      }

      if (data?.settings) {
        setSettingsForm(data.settings);
      }
      setSettingsSuccess(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('settings-updated', { detail: data?.settings || settingsForm }));
      }
      setTimeout(() => setSettingsSuccess(false), 5000);
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to update settings in database');
    } finally {
      setSavingSettings(false);
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      fetchInquiries();
      fetchStats();
    } catch (err) {
      console.error('Inquiry status error', err);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters long');
      return;
    }

    setChangingPwd(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setPwdSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Password update failed');
    } finally {
      setChangingPwd(false);
    }
  };

  // Filter projects by search and status
  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (projectSearch.trim()) {
      const query = projectSearch.toLowerCase();
      return (
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.location && p.location.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      
      {/* Top Banner with greeting and site link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2D9CC] dark:border-[#2D2622]">
        <div className="flex items-center gap-4">
          <img
            src="/logo.jpeg"
            alt="Emiland’s Interior Logo"
            className="w-14 h-14 rounded-full object-cover border border-[#E2D9CC] dark:border-[#38312B] shadow-sm shrink-0"
          />
          <div>
            <span className="text-xs uppercase tracking-widest text-[#6F4E37] dark:text-[#D4A373] font-semibold">
              Emiland’s Interior · Management Console
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#302720] dark:text-[#F5EFE6] mt-0.5">
              Studio Dashboard
            </h1>
            <p className="text-xs text-[#786D63] dark:text-[#A3968A] mt-0.5">
              Logged in as <strong className="text-[#302720] dark:text-[#F5EFE6]">{user?.name}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] bg-[#EDE5D8] dark:bg-[#24201D] hover:bg-[#E2D9CC] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public Site
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#786D63] dark:text-[#A3968A]">Total Works</span>
          <div className="font-serif text-3xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
            {stats.totalProjects}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Published</span>
          <div className="font-serif text-3xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
            {stats.publishedProjects}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400">Drafts</span>
          <div className="font-serif text-3xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
            {stats.draftProjects}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#6F4E37] dark:text-[#D4A373]">Featured</span>
          <div className="font-serif text-3xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
            {stats.featuredProjects}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#6F4E37] dark:text-[#D4A373]">Inquiries</span>
          <div className="font-serif text-3xl font-semibold text-[#302720] dark:text-[#F5EFE6] tabular-nums">
            {stats.unreadInquiries} <span className="text-xs font-sans font-normal text-[#786D63]">new</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E2D9CC] dark:border-[#2D2622] pb-2 scrollbar-none">
        {[
          { id: 'works', label: 'Manage Works', icon: FolderKanban },
          { id: 'categories', label: 'Categories', icon: Layers },
          { id: 'inquiries', label: `Inquiries (${stats.unreadInquiries})`, icon: Mail },
          { id: 'settings', label: 'Site Settings', icon: Settings },
          { id: 'account', label: 'Account Security', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#6F4E37] text-white shadow-sm dark:bg-[#A67C52]'
                  : 'text-[#786D63] dark:text-[#A3968A] hover:text-[#302720] dark:hover:text-[#F5EFE6] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MANAGE WORKS */}
      {activeTab === 'works' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Search & Filter */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#786D63] dark:text-[#A3968A]" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search works..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] text-[#302720] dark:text-[#F5EFE6]"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>

            {/* Add Project CTA */}
            <button
              onClick={() => {
                setEditingProject(null);
                setEditorOpen(true);
              }}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] dark:hover:bg-[#6F4E37] transition-all cursor-pointer shadow-sm flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Work</span>
            </button>
          </div>

          {/* Works Table / Card list */}
          {loadingProjects ? (
            <div className="p-12 text-center text-xs text-[#786D63]">Loading projects from SQLite...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-3">
              <FolderKanban className="w-8 h-8 mx-auto text-[#786D63] opacity-60" />
              <p className="text-sm font-medium text-[#302720] dark:text-[#F5EFE6]">No works match your filter.</p>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setEditorOpen(true);
                }}
                className="text-xs uppercase tracking-wider text-[#6F4E37] dark:text-[#D4A373] hover:underline"
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E2D9CC] dark:border-[#2D2622] overflow-hidden bg-white dark:bg-[#1E1A17] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2D9CC] dark:border-[#2D2622] bg-[#EDE5D8]/40 dark:bg-[#24201D] text-[11px] uppercase tracking-wider text-[#786D63] dark:text-[#A3968A]">
                      <th className="py-3.5 px-4 font-semibold">Visual</th>
                      <th className="py-3.5 px-4 font-semibold">Project Title</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Featured</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D9CC] dark:divide-[#2D2622] text-xs">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8F5EF]/50 dark:hover:bg-[#24201D]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-900 border border-[#E2D9CC] dark:border-[#2D2622] shrink-0">
                            <img src={p.coverMediaUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-serif text-base font-medium text-[#302720] dark:text-[#F5EFE6]">
                            {p.title}
                          </div>
                          <div className="text-[11px] text-[#786D63] dark:text-[#A3968A] font-mono mt-0.5">
                            /{p.slug} {p.location ? `· ${p.location}` : ''}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#786D63] dark:text-[#A3968A]">
                          {p.category_name || 'Unassigned'}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => togglePublish(p)}
                            title="Click to toggle publish status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                              p.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            {p.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{p.status}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleFeatured(p)}
                            title="Toggle featured showcase"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              p.featured === 1
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-stone-300 dark:text-stone-700 hover:text-stone-400'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${p.featured === 1 ? 'fill-amber-500' : ''}`} />
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => onNavigateProject(p.slug)}
                            title="Preview on Public Portfolio"
                            className="p-1.5 rounded-lg text-[#786D63] dark:text-[#A3968A] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingProject(p);
                              setEditorOpen(true);
                            }}
                            title="Edit Project"
                            className="p-1.5 rounded-lg text-[#6F4E37] dark:text-[#D4A373] hover:bg-[#EDE5D8] dark:hover:bg-[#24201D] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteProject(p.id, p.title)}
                            title="Delete Project"
                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Add Category Form */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4 h-fit">
            <h3 className="font-serif text-xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              Add Category
            </h3>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Master Suites & Spa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Curated bath design, tactile plaster, acoustic headboards..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#6F4E37] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingCat}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {savingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Create Category</span>
              </button>
            </form>
          </div>

          {/* Existing Categories List */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4">
            <h3 className="font-serif text-xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              Portfolio Categories ({categories.length})
            </h3>

            <div className="divide-y divide-[#E2D9CC] dark:divide-[#2D2622]">
              {categories.map((cat) => (
                <div key={cat.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-[#302720] dark:text-[#F5EFE6]">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-[#786D63] dark:text-[#A3968A] mt-0.5">
                      Slug: <code className="font-mono">{cat.slug}</code> {cat.description ? `· ${cat.description}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              Client Consultation Briefs ({inquiries.length})
            </h3>
            <button
              onClick={fetchInquiries}
              className="text-xs uppercase tracking-wider text-[#6F4E37] dark:text-[#D4A373] hover:underline cursor-pointer"
            >
              Refresh Inbox
            </button>
          </div>

          {loadingInquiries ? (
            <div className="p-8 text-center text-xs text-[#786D63]">Loading client submissions...</div>
          ) : inquiries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] text-[#786D63]">
              No consultation requests received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-6 rounded-2xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2D9CC] dark:border-[#2D2622] pb-3">
                    <div>
                      <h4 className="font-serif text-xl font-medium text-[#302720] dark:text-[#F5EFE6]">
                        {inq.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#786D63] dark:text-[#A3968A] mt-0.5">
                        <a href={`mailto:${inq.email}`} className="text-[#6F4E37] dark:text-[#D4A373] hover:underline">
                          {inq.email}
                        </a>
                        {inq.phone && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{inq.phone}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#786D63]">Status:</span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-[#302720] dark:text-[#F5EFE6]"
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="contacted">Contacted</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#786D63] block">Discipline Requested:</span>
                      <span className="font-semibold text-[#302720] dark:text-[#F5EFE6]">{inq.service}</span>
                    </div>
                    {inq.budgetRange && (
                      <div>
                        <span className="text-[#786D63] block">Budget Range:</span>
                        <span className="font-semibold text-[#302720] dark:text-[#F5EFE6]">{inq.budgetRange}</span>
                      </div>
                    )}
                    {inq.timeline && (
                      <div>
                        <span className="text-[#786D63] block">Target Timeline:</span>
                        <span className="font-semibold text-[#302720] dark:text-[#F5EFE6]">{inq.timeline}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] text-xs text-[#302720] dark:text-[#F5EFE6] leading-relaxed whitespace-pre-line">
                    {inq.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl p-8 rounded-3xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              Atelier Site Identity & Content
            </h3>
            <p className="text-xs text-[#786D63] dark:text-[#A3968A] mt-1">
              Changes persist across all public pages, headers, footers, and SEO tags.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Settings updated successfully in SQLite database!</span>
            </div>
          )}

          {settingsError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{settingsError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Studio Name
                </label>
                <input
                  type="text"
                  value={settingsForm.studioName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, studioName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settingsForm.studioTagline || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, studioTagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Brand Description
              </label>
              <textarea
                rows={3}
                value={settingsForm.studioDescription || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, studioDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settingsForm.contactEmail || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Studio Phone
                </label>
                <input
                  type="text"
                  value={settingsForm.contactPhone || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  WhatsApp Direct Number
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  placeholder="+442079460812"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Physical Atelier Address
              </label>
              <input
                type="text"
                value={settingsForm.studioAddress || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, studioAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={settingsForm.heroTitle || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={settingsForm.heroSubtitle || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] transition-colors cursor-pointer flex items-center gap-2"
              >
                {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: ACCOUNT & PASSWORD */}
      {activeTab === 'account' && (
        <div className="max-w-md p-8 rounded-3xl bg-white dark:bg-[#1E1A17] border border-[#E2D9CC] dark:border-[#2D2622] space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-medium text-[#302720] dark:text-[#F5EFE6]">
              Change Owner Password
            </h3>
            <p className="text-xs text-[#786D63] dark:text-[#A3968A] mt-1">
              Securely update your secret password with server-side bcrypt hashing.
            </p>
          </div>

          {pwdError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200">
              {pwdError}
            </div>
          )}

          {pwdSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200">
              Password updated successfully!
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                New Password (Min 8 Characters) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#302720] dark:text-[#F5EFE6] mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EF] dark:bg-[#24201D] border border-[#E2D9CC] dark:border-[#38312B] text-xs text-[#302720] dark:text-[#F5EFE6]"
              />
            </div>

            <button
              type="submit"
              disabled={changingPwd}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-[#6F4E37] hover:bg-[#3E2B23] dark:bg-[#A67C52] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {changingPwd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Update Password</span>
            </button>
          </form>
        </div>
      )}

      {/* Project Editor Modal */}
      <ProjectEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          fetchProjects();
          fetchStats();
        }}
        projectToEdit={editingProject}
        categories={categories}
        token={token}
      />

    </div>
  );
};
