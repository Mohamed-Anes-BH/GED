import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppChrome } from './components/layout/MainLayout';

// Existing pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

// New pages – one file per page (dark/light/variants handled inside each file)
import { NouveauDocumentPage } from './pages/UploadPage';
import { SearchPage } from './pages/SearchPage';
import { UtilisateursPage } from './pages/UsersPage';
import { HistoriquePage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { AProposPage } from './pages/AProposPage';
import { ArchivesPhysiquesPage } from './pages/ArchivesPhysiquesPage';
import { BoitesArchivesPage } from './pages/BoitesArchivesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CorbeillePage } from './pages/CorbeillePage';
import { CorrespondantsPage } from './pages/CorrespondantsPage';
import { CourriersEntrantsPage } from './pages/CourriersEntrantsPage';
import { CourriersSortantsPage } from './pages/CourriersSortantsPage';
import { DepartementsPage } from './pages/DepartementsPage';
import { DiffusionPage } from './pages/DiffusionPage';
import { DirectionsPage } from './pages/DirectionsPage';
import { DocumentsActifsPage } from './pages/DocumentsActifsPage';
import { DocumentsRecentsPage } from './pages/DocumentsRecentsPage';
import { FavorisPage } from './pages/FavorisPage';
import { GestionDosssiersPage } from './pages/GestionDossiersPage';
import { HistoriqueVersionsPage } from './pages/HistoriqueVersionsPage';
import { MessageriePage } from './pages/MessageriePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { OcrPage } from './pages/OcrPage';
import { ProfilPage } from './pages/ProfilPage';
import { RolesPermissionsPage } from './pages/RolesPermissionsPage';
import { ScannerPage } from './pages/ScannerPage';
import { ServicesPage } from './pages/ServicesPage';
import { StatistiquesPage } from './pages/StatistiquesPage';
import { TagsPage } from './pages/TagsPage';
import { VisionneusePdfPage } from './pages/VisionneusePdfPage';
import { WorkflowPage } from './pages/WorkflowPage';

// Route → page name mapping
const ROUTE_MAP: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/documents': 'documents',
  '/upload': 'upload',
  '/search': 'search',
  '/admin/users': 'users',
  '/audit': 'audit',
  '/settings': 'settings',
  '/a-propos': 'a-propos',
  '/archives-physiques': 'archive',
  '/boites-archives': 'boxes',
  '/categories': 'categories',
  '/corbeille': 'trash',
  '/correspondants': 'correspondants',
  '/courriers-entrants': 'inbox',
  '/courriers-sortants': 'outbox',
  '/departements': 'departements',
  '/diffusion': 'diffusion',
  '/directions': 'directions',
  '/documents-actifs': 'documents-actifs',
  '/documents-recents': 'documents-recents',
  '/favoris': 'favorites',
  '/dossiers': 'folders',
  '/versions': 'versions',
  '/messagerie': 'messagerie',
  '/notifications': 'notifications',
  '/ocr': 'ocr',
  '/profil': 'profil',
  '/roles': 'roles',
  '/scanner': 'scanner',
  '/services': 'services',
  '/statistiques': 'statistiques',
  '/tags': 'tags',
  '/visionneuse-pdf': 'visionneuse-pdf',
  '/workflow': 'workflow',
};

function withChrome(current: string, onNavigate: (p: string) => void, element: React.ReactNode) {
  return <AppChrome current={current} onNavigate={onNavigate}>{element}</AppChrome>;
}

function AppShellRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = useMemo(() => {
    if (location.pathname.startsWith('/documents/')) return 'documents';
    return ROUTE_MAP[location.pathname] ?? 'login';
  }, [location.pathname]);

  const nav = (page: string) => {
    if (page === 'login') { navigate('/login'); return; }
    
    const idToPath: Record<string, string> = {
      'inbox': 'courriers-entrants',
      'outbox': 'courriers-sortants',
      'archive': 'archives-physiques',
      'boxes': 'boites-archives',
      'users': 'admin/users',
      'trash': 'corbeille',
      'favorites': 'favoris',
      'folders': 'dossiers'
    };
    
    const targetPath = idToPath[page] || page;
    navigate(`/${targetPath}`);
  };

  const C = (el: React.ReactNode) => withChrome(currentPage, nav, el);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage onLogin={() => nav('dashboard')} />} />

      {/* Core */}
      <Route path="/dashboard"           element={C(<DashboardPage onOpenDocument={(id) => navigate(`/documents/${id}`)} onNavigate={nav} />)} />
      <Route path="/documents"           element={C(<DocumentsPage onOpenDocument={(id) => navigate(`/documents/${id}`)} onNavigate={nav} />)} />
      <Route path="/documents/:id"       element={<DocumentDetailRoute currentPage={currentPage} onNavigate={nav} />} />
      <Route path="/upload"              element={C(<NouveauDocumentPage variant={1} />)} />
      <Route path="/upload/v2"           element={C(<NouveauDocumentPage variant={2} />)} />
      <Route path="/search"              element={C(<SearchPage />)} />
      <Route path="/visionneuse-pdf"     element={C(<VisionneusePdfPage />)} />

      {/* Courriers */}
      <Route path="/courriers-entrants"      element={C(<CourriersEntrantsPage variant={1} />)} />
      <Route path="/courriers-entrants/v2"   element={C(<CourriersEntrantsPage variant={2} />)} />
      <Route path="/courriers-sortants"      element={C(<CourriersSortantsPage variant={1} />)} />
      <Route path="/courriers-sortants/v2"   element={C(<CourriersSortantsPage variant={2} />)} />
      <Route path="/courriers-sortants/v3"   element={C(<CourriersSortantsPage variant={3} />)} />
      <Route path="/diffusion"               element={C(<DiffusionPage />)} />
      <Route path="/diffusion/v2"            element={C(<DiffusionPage />)} />
      <Route path="/diffusion/v3"            element={C(<DiffusionPage />)} />
      <Route path="/messagerie"          element={C(<MessageriePage />)} />

      {/* Documents */}
      <Route path="/dossiers"            element={C(<GestionDosssiersPage />)} />
      <Route path="/categories"          element={C(<CategoriesPage />)} />
      <Route path="/documents-actifs"    element={C(<DocumentsActifsPage onOpenDocument={()=>{}} onNavigate={()=>{}} />)} />
      <Route path="/documents-recents"   element={C(<DocumentsRecentsPage onOpenDocument={()=>{}} onNavigate={()=>{}} />)} />
      <Route path="/versions"            element={C(<HistoriqueVersionsPage />)} />
      <Route path="/favoris"             element={C(<FavorisPage />)} />
      <Route path="/tags"                element={C(<TagsPage />)} />
      <Route path="/corbeille"           element={C(<CorbeillePage />)} />

      {/* Processing */}
      <Route path="/scanner"             element={C(<ScannerPage />)} />
      <Route path="/ocr"                 element={C(<OcrPage />)} />

      {/* Archives */}
      <Route path="/archives-physiques"  element={C(<ArchivesPhysiquesPage />)} />
      <Route path="/boites-archives"     element={C(<BoitesArchivesPage />)} />

      {/* System */}
      <Route path="/notifications"       element={C(<NotificationsPage />)} />
      <Route path="/workflow"            element={C(<WorkflowPage />)} />
      <Route path="/statistiques"        element={C(<StatistiquesPage />)} />
      <Route path="/audit"               element={C(<HistoriquePage />)} />

      {/* Admin */}
      <Route path="/admin/users"         element={C(<UtilisateursPage />)} />
      <Route path="/admin/users/add"     element={C(<UtilisateursPage />)} />
      <Route path="/roles"               element={C(<RolesPermissionsPage />)} />
      <Route path="/directions"          element={C(<DirectionsPage />)} />
      <Route path="/departements"        element={C(<DepartementsPage />)} />
      <Route path="/services"            element={C(<ServicesPage />)} />
      <Route path="/correspondants"      element={C(<CorrespondantsPage />)} />

      {/* User */}
      <Route path="/profil"              element={C(<ProfilPage />)} />
      <Route path="/settings"            element={C(<SettingsPage />)} />
      <Route path="/a-propos"            element={C(<AProposPage />)} />

      <Route path="*" element={<NotFoundPage onGoHome={() => navigate('/dashboard')} />} />
    </Routes>
  );
}

function DocumentDetailRoute({ currentPage, onNavigate }: { currentPage: string; onNavigate: (p: string) => void }) {
  const params = useParams();
  const id = Number(params.id) || 1;
  return (
    <AppChrome current={currentPage} onNavigate={onNavigate}>
      <DocumentDetailPage documentId={id} onBack={() => onNavigate('documents')} />
    </AppChrome>
  );
}

export default function App() {
  return <AppShellRoutes />;
}