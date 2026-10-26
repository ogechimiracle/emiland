import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteSettings } from './types';
import { getCachedSettings, saveCachedSettings } from './utils/storageSync';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';

import { HomePage } from './pages/HomePage';
import { WorksPage } from './pages/WorksPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function AppContent() {
  const { user, isLoading } = useAuth();

  // Simple client-side router
  const [currentPath, setCurrentPath] = useState(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  const [settings, setSettings] = useState<Partial<SiteSettings>>(() => getCachedSettings());
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>();
  const [preselectedProject, setPreselectedProject] = useState<string | undefined>();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === 'object') {
            const merged = { ...getCachedSettings(), ...data };
            setSettings(merged);
            saveCachedSettings(merged);
          }
        })
        .catch((err) => console.error('Failed to load settings', err));
    };

    loadSettings();

    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
        saveCachedSettings(e.detail);
      } else {
        loadSettings();
      }
    };

    window.addEventListener('settings-updated', handleSettingsUpdated);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdated);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openConsultation = (service?: string, projectTitle?: string) => {
    setPreselectedService(service);
    setPreselectedProject(projectTitle);
    setConsultationOpen(true);
  };

  // Route matching
  const renderRoute = () => {
    if (currentPath === '/admin/login') {
      if (user) {
        navigate('/admin');
        return <AdminDashboard onNavigateHome={() => navigate('/')} onNavigateProject={(slug) => navigate(`/works/${slug}`)} />;
      }
      return <AdminLogin onSuccess={() => navigate('/admin')} onNavigateHome={() => navigate('/')} />;
    }

    if (currentPath.startsWith('/admin')) {
      if (isLoading) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#786D63]">
            Verifying owner authorization...
          </div>
        );
      }
      if (!user) {
        return <AdminLogin onSuccess={() => navigate('/admin')} onNavigateHome={() => navigate('/')} />;
      }
      return (
        <AdminDashboard
          onNavigateHome={() => navigate('/')}
          onNavigateProject={(slug) => navigate(`/works/${slug}`)}
        />
      );
    }

    if (currentPath.startsWith('/works/')) {
      const slug = currentPath.replace('/works/', '').split('/')[0];
      return (
        <ProjectDetailPage
          slug={slug}
          onNavigate={navigate}
          onOpenConsultation={openConsultation}
        />
      );
    }

    if (currentPath === '/works') {
      return <WorksPage onNavigate={navigate} onOpenConsultation={() => openConsultation()} />;
    }

    if (currentPath === '/about') {
      return (
        <AboutPage
          settings={settings}
          onNavigate={navigate}
          onOpenConsultation={() => openConsultation()}
        />
      );
    }

    if (currentPath === '/services') {
      return <ServicesPage onOpenConsultation={openConsultation} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage settings={settings} />;
    }

    // Default: Home Page
    return (
      <HomePage
        settings={settings}
        onNavigate={navigate}
        onOpenConsultation={openConsultation}
      />
    );
  };

  const isAdminView = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] dark:bg-[#171412] text-[#302720] dark:text-[#F5EFE6] transition-colors duration-200">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenConsultation={() => openConsultation()}
      />

      <main className="flex-1">
        {renderRoute()}
      </main>

      {!isAdminView && (
        <Footer settings={settings} onNavigate={navigate} />
      )}

      {/* Global Consultation Booking Drawer */}
      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        preselectedService={preselectedService}
        preselectedProject={preselectedProject}
        settings={settings}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
